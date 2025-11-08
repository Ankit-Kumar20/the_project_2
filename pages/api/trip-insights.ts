import type { NextApiRequest, NextApiResponse } from 'next';
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { getLocationInsights, getPhotoUrl } from '@/lib/google-places';
import { db } from '@/db';
import { tripInsights } from '@/db/schema';
import { eq } from 'drizzle-orm';

interface TripDetails {
  destinations: string;
  startDate?: string;
  endDate?: string;
  travellers?: string;
  budget?: string;
  interests?: string;
  pace?: string;
}

interface Node {
  label: string;
  day?: number;
  coordinates?: { lat: number; lng: number };
}

interface RequestBody {
  tripDetails: TripDetails;
  nodes: Node[];
  tripId?: string;
  forceRefresh?: boolean;
}

interface Insight {
  title: string;
  description: string;
  photo?: string;
  source?: string;
  severity?: 'info' | 'warning' | 'critical';
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { tripDetails, nodes, tripId, forceRefresh = false } = req.body as RequestBody;

    if (!tripDetails || !nodes || nodes.length === 0) {
      return res.status(400).json({ error: 'Missing trip details or nodes' });
    }

    // Try to fetch from database if not forcing refresh
    if (!forceRefresh && tripId) {
      const cachedInsights = await db
        .select()
        .from(tripInsights)
        .where(eq(tripInsights.tripId, tripId))
        .limit(1);

      if (cachedInsights.length > 0) {
        console.log('Returning cached insights for trip:', tripId);
        const parsedData = JSON.parse(cachedInsights[0].insightsData);
        return res.status(200).json({
          success: true,
          insights: parsedData.insights,
          context: parsedData.context,
          cached: true,
          cachedAt: cachedInsights[0].updatedAt,
        });
      }
    }

    // Extract unique locations from nodes
    const locations = nodes
      .map((node) => node.label)
      .filter((label, index, self) => self.indexOf(label) === index)
      .slice(0, 10); // Limit to 10 locations to avoid excessive API calls

    console.log('Fetching insights for locations:', locations);

    // Fetch Google Places data for each location
    const placesData = await Promise.all(
      locations.map(async (location) => {
        const details = await getLocationInsights(location);
        return {
          location,
          details,
        };
      })
    );

    // Filter out locations where we couldn't get data
    const validPlaces = placesData.filter((place) => place.details !== null);

    if (validPlaces.length === 0) {
      return res.status(500).json({ error: 'Could not fetch place details' });
    }

    // Determine season from dates
    let season = 'year-round';
    if (tripDetails.startDate) {
      const month = new Date(tripDetails.startDate).getMonth();
      const seasons = ['winter', 'winter', 'spring', 'spring', 'spring', 'summer', 'summer', 'summer', 'autumn', 'autumn', 'autumn', 'winter'];
      season = seasons[month];
    }

    // Parse traveller count
    const travellerCount = tripDetails.travellers
      ? parseInt(tripDetails.travellers.match(/\d+/)?.[0] || '1')
      : 1;
    const isLargeGroup = travellerCount >= 5;

    // Prepare context for AI analysis
    const placesContext = validPlaces
      .map((place) => {
        const reviews = place.details?.reviews
          ?.slice(0, 5)
          .map((r) => `"${r.text}" (${r.rating}★)`)
          .join('\n');

        return `
Location: ${place.location}
Rating: ${place.details?.rating || 'N/A'}★ (${place.details?.userRatingsTotal || 0} reviews)
Address: ${place.details?.formattedAddress || 'N/A'}
Sample Reviews:
${reviews || 'No reviews available'}
`;
      })
      .join('\n---\n');

    // AI prompt for personalized insights
    const prompt = `You are an experienced travel advisor analyzing real Google Places data to provide personalized, context-aware trip insights.

TRIP CONTEXT:
- Destinations: ${tripDetails.destinations}
- Dates: ${tripDetails.startDate || 'Not specified'} to ${tripDetails.endDate || 'Not specified'}
- Season: ${season}
- Travelers: ${tripDetails.travellers || 'Not specified'} (${isLargeGroup ? 'LARGE GROUP' : 'small group/solo'})
- Budget: ${tripDetails.budget || 'Not specified'}
- Interests: ${tripDetails.interests || 'General sightseeing'}
- Pace: ${tripDetails.pace || 'Moderate'}

GOOGLE PLACES DATA:
${placesContext}

TASK:
Based on the trip context and real reviews, provide brutally honest, personalized insights. Include BOTH positive recommendations AND important warnings.

Respond in this EXACT JSON format:
{
  "mustSee": [
    {
      "title": "Short compelling title",
      "description": "Specific reason why this is great for THIS group (mention group size/season if relevant)",
      "location": "Location name from the data"
    }
  ],
  "warnings": [
    {
      "title": "What to avoid or be careful about",
      "description": "Specific warning based on season, group size, or reviews",
      "severity": "warning or critical",
      "location": "Location name"
    }
  ],
  "proTips": [
    {
      "title": "Actionable insider tip",
      "description": "Specific advice based on reviews or context"
    }
  ],
  "hiddenGems": [
    {
      "title": "Lesser-known spot",
      "description": "Why it's good for this specific trip",
      "location": "Location name if applicable"
    }
  ]
}

GUIDELINES:
- Provide 2-4 items per category
- Be SPECIFIC about group size implications (e.g., "Avoid at noon - cramped for 5+ people")
- Mention season-specific issues (e.g., "Extremely hot in ${season}", "Closed during monsoon")
- Use actual review insights (e.g., "Reviews mention long queues after 10 AM")
- Include budget considerations if relevant
- Warnings are CRITICAL - mention crowds, heat, scams, accessibility issues
- Don't be overly positive - balance good and bad
- Keep descriptions concise (under 100 chars)

Return ONLY valid JSON, no markdown or extra text.`;

    const result = await generateText({
      model: openai('gpt-4o'),
      prompt,
      temperature: 0.7,
    });

    // Strip markdown code blocks if present
    let jsonText = result.text.trim();
    if (jsonText.startsWith('```')) {
      // Remove ```json or ``` at the start and ``` at the end
      jsonText = jsonText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    }

    let insightsData;
    try {
      insightsData = JSON.parse(jsonText);
    } catch (parseError) {
      console.error('Failed to parse AI response:', jsonText);
      throw new Error(`JSON parse error: ${parseError instanceof Error ? parseError.message : 'Unknown'}`);
    }

    // Add photos to insights where applicable
    const mustSeeWithPhotos = insightsData.mustSee?.map((insight: any) => {
      const place = validPlaces.find((p) => p.location === insight.location);
      const photo = place?.details?.photos?.[0];
      return {
        ...insight,
        photo: photo ? getPhotoUrl(photo.photoReference, 400) : undefined,
        source: 'Google Places',
      };
    });

    const hiddenGemsWithPhotos = insightsData.hiddenGems?.map((insight: any) => {
      const place = validPlaces.find((p) => p.location === insight.location);
      const photo = place?.details?.photos?.[0];
      return {
        ...insight,
        photo: photo ? getPhotoUrl(photo.photoReference, 400) : undefined,
      };
    });

    const responseData = {
      success: true,
      insights: {
        mustSee: mustSeeWithPhotos || [],
        warnings: insightsData.warnings || [],
        proTips: insightsData.proTips || [],
        hiddenGems: hiddenGemsWithPhotos || [],
      },
      context: {
        season,
        isLargeGroup,
        locationsAnalyzed: validPlaces.length,
      },
    };

    // Save to database if tripId is provided
    if (tripId) {
      const dataToCache = JSON.stringify({
        insights: responseData.insights,
        context: responseData.context,
      });

      // Check if insights already exist for this trip
      const existingInsights = await db
        .select()
        .from(tripInsights)
        .where(eq(tripInsights.tripId, tripId))
        .limit(1);

      if (existingInsights.length > 0) {
        // Update existing insights
        await db
          .update(tripInsights)
          .set({
            insightsData: dataToCache,
            updatedAt: new Date(),
          })
          .where(eq(tripInsights.tripId, tripId));
        console.log('Updated cached insights for trip:', tripId);
      } else {
        // Insert new insights
        await db.insert(tripInsights).values({
          tripId,
          insightsData: dataToCache,
        });
        console.log('Cached new insights for trip:', tripId);
      }
    }

    return res.status(200).json(responseData);
  } catch (error) {
    console.error('Error generating trip insights:', error);
    return res.status(500).json({
      error: 'Failed to generate insights',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
