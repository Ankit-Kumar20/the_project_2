import type { NextApiRequest, NextApiResponse } from 'next';
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { tripDetails, nodes } = req.body;

    const prompt = `You are a travel itinerary expert. Your job is to take basic trip information and location data, then generate comprehensive, detailed, and engaging descriptions that will be used in a PDF travel itinerary.

TRIP INFORMATION:
- Name: ${tripDetails?.name || 'N/A'}
- Destinations: ${tripDetails?.destinations || 'N/A'}
- Dates: ${tripDetails?.startDate ? new Date(tripDetails.startDate).toLocaleDateString() : 'N/A'} to ${tripDetails?.endDate ? new Date(tripDetails.endDate).toLocaleDateString() : 'N/A'}
- Travellers: ${tripDetails?.travellers || 'N/A'}
- Pace: ${tripDetails?.pace || 'N/A'}
- Budget: ${tripDetails?.budget || 'N/A'}
- Interests: ${tripDetails?.interests || 'N/A'}
- Travel Modes: ${tripDetails?.travelModes || 'N/A'}
- Must-See Attractions: ${tripDetails?.mustSees || 'N/A'}
- Avoid: ${tripDetails?.avoid || 'N/A'}
- Mobility Constraints: ${tripDetails?.mobilityConstraints || 'N/A'}

ITINERARY LOCATIONS:
${nodes.map((node: any, idx: number) => `Day ${node.data?.day || idx + 1}: ${node.data?.label || 'Unknown Location'}
Current Info: ${node.data?.info || 'No information provided'}`).join('\n\n')}

TASK:
1. Create an engaging trip overview (2-3 paragraphs) that summarizes the trip's essence, highlights, and what makes it special
2. For each location/day, enhance the existing information with:
   - Rich context about the location (history, culture, significance)
   - Specific recommendations (best times to visit, insider tips)
   - Practical details (estimated duration, what to bring, booking tips)
   - Why this location fits with the traveler's interests and pace
   - Transportation tips between locations
   - Budget-appropriate suggestions

CRITICAL: You must respond with ONLY valid JSON, no markdown formatting, no code blocks, no additional text.

Return ONLY this JSON structure:
{
  "tripOverview": "Detailed engaging overview here",
  "enhancedLocations": [
    {
      "day": 1,
      "location": "Location name",
      "enhancedInfo": "Rich detailed information here"
    }
  ]
}

Make the descriptions vivid, practical, and personalized based on the traveler's preferences. Each location should have at least 3-4 detailed paragraphs.`;

    const { text } = await generateText({
      model: openai('gpt-4o'),
      prompt,
      temperature: 0.7,
    });

    // Extract JSON from response (handles markdown code blocks)
    let enhancedData;
    try {
      // Try direct parse first
      enhancedData = JSON.parse(text);
    } catch (e) {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = text.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
      if (jsonMatch) {
        enhancedData = JSON.parse(jsonMatch[1]);
      } else {
        // Try to find JSON object in the text
        const objectMatch = text.match(/\{[\s\S]*\}/);
        if (objectMatch) {
          enhancedData = JSON.parse(objectMatch[0]);
        } else {
          throw new Error('Could not extract JSON from LLM response');
        }
      }
    }

    return res.status(200).json({
      success: true,
      data: enhancedData,
    });
  } catch (error) {
    console.error('Error enhancing PDF details:', error);
    return res.status(500).json({
      error: 'Failed to enhance PDF details',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
