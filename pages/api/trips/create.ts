import 'dotenv/config';
import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import type { NextApiRequest, NextApiResponse } from 'next';
import Exa from 'exa-js';
import { db } from '@/db';
import { trips } from '@/db/schema';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

const NodeSchema = z.object({
  id: z.string(),
  type: z.string().optional().default('city'),
  data: z.object({
    label: z.string(),
    info: z.string().optional(),
    day: z.number().optional(),
    activities: z.array(z.string()).optional(),
    accommodation: z.string().optional(),
    transportation: z.string().optional(),
    estimatedCost: z.string().optional(),
    duration: z.string().optional(),
    tips: z.array(z.string()).optional(),
    googleMapsLink: z.string().optional(),
    coordinates: z.object({
      lat: z.number(),
      lng: z.number()
    }).optional()
  }),
  position: z.object({
    x: z.number(),
    y: z.number()
  })
});

const EdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  label: z.string().optional(),
  type: z.string().optional().default('smoothstep')
});

const FlowSchema = z.object({
  nodes: z.array(NodeSchema),
  edges: z.array(EdgeSchema)
});

const AIResponseSchema = z.object({
  reply: z.string(),
  flow: FlowSchema
});

async function gatherTravelInformation(from: string, to: string, stops?: string) {
  const exa = new Exa(process.env.EXA_API_KEY);
  
  try {
    const queries = [
      `Best attractions and things to do in ${to}`,
      `Travel guide ${from} to ${to}`,
      `Popular activities and places to visit in ${to}`
    ];

    if (stops) {
      const stopsList = stops.split(',').map(s => s.trim());
      stopsList.forEach(stop => {
        queries.push(`Must visit places in ${stop}`);
      });
    }

    const searchPromises = queries.map(query => 
      exa.searchAndContents(query, {
        numResults: 3,
        text: { maxCharacters: 1000 }
      })
    );

    const results = await Promise.all(searchPromises);
    
    let contextInfo = '\n\n=== REAL-TIME TRAVEL INFORMATION FROM WEB SEARCH ===\n';
    
    results.forEach((result, idx) => {
      contextInfo += `\nQuery: ${queries[idx]}\n`;
      result.results?.forEach((item: any) => {
        contextInfo += `- ${item.title}: ${item.text || item.url}\n`;
      });
    });

    return contextInfo;
  } catch (error) {
    console.error('Exa search error:', error);
    return '\n\n(Unable to fetch real-time travel information)';
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get session from Better Auth
    const session = await auth.api.getSession({ headers: req.headers as any });
    
    if (!session?.user?.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { 
      name, 
      destinations, 
      startDate, 
      endDate, 
      travellers, 
      pace, 
      budget, 
      interests, 
      mustSees, 
      avoid, 
      mobilityConstraints, 
      travelModes 
    } = req.body;

    if (!destinations) {
      return res.status(400).json({ error: 'Destinations are required' });
    }

    // Calculate days between dates if provided
    let days = 7;
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)) + 1;
    }

    console.log('🔍 Gathering real-time travel information using Exa...');
    const travelInfo = await gatherTravelInformation(destinations, destinations, mustSees);
    
    const prompt = `You are an AI travel planner. Create a personalized ${days}-day trip itinerary with the following details:

DESTINATIONS: ${destinations}
${startDate ? `START DATE: ${startDate}` : ''}
${endDate ? `END DATE: ${endDate}` : ''}
${travellers ? `TRAVELLERS: ${travellers}` : ''}
PACE: ${pace || 'balanced'} (pace of travel - relaxed, balanced, or packed)
${budget ? `BUDGET: ${budget}` : ''}
${interests ? `INTERESTS: ${interests}` : ''}
${mustSees ? `MUST-SEE PLACES: ${mustSees}` : ''}
${avoid ? `THINGS TO AVOID: ${avoid}` : ''}
${mobilityConstraints ? `MOBILITY CONSTRAINTS: ${mobilityConstraints}` : ''}
${travelModes ? `PREFERRED TRAVEL MODES: ${travelModes}` : ''}

${travelInfo}

Using the above information, generate a detailed travel flow with the following requirements:

1. Create nodes for each day of the journey (${days} days total)
2. Adjust the number of activities per day based on pace:
   - Relaxed: 2-3 activities per day with longer durations
   - Balanced: 3-4 activities per day
   - Packed: 5-6 activities per day with efficient scheduling
3. Each node should contain:
   - label: Name of the location/activity
   - info: Brief description
   - day: Which day of the trip (1-${days})
   - activities: Array of specific activities matching the user's interests
   - accommodation: Suggested places to stay within budget
   - transportation: Use preferred travel modes when possible
   - estimatedCost: Costs aligned with the specified budget
   - duration: Appropriate duration based on pace
   - tips: Helpful tips, especially regarding accessibility if mobility constraints mentioned
   - googleMapsLink: Google Maps URL format "https://www.google.com/maps/search/?api=1&query=PLACE_NAME"
   - coordinates: Approximate latitude and longitude

4. IMPORTANT considerations:
   - Focus activities around specified interests (${interests || 'general tourism'})
   - Include all must-see places: ${mustSees || 'none specified'}
   - Avoid: ${avoid || 'nothing specified'}
   - Consider mobility constraints: ${mobilityConstraints || 'none'}
   - Prioritize travel modes: ${travelModes || 'any'}
   - Keep within budget: ${budget || 'not specified'}

5. Node types should vary: 'city', 'attraction', 'activity', 'restaurant', 'accommodation'
6. Position nodes vertically with x coordinates varying for visual appeal
7. Use real-time information from web search for accurate, current recommendations
8. **CRITICAL: Node ID MUST EQUAL the day number** (day 1 = id "1", day 2 = id "2", etc.)

 Generate the complete travel flow in JSON format.`;

    console.log('🤖 Generating travel flow with LLM...');
    const result = await generateObject({
      model: openai('gpt-4o'),
      schema: AIResponseSchema,
      prompt,
    });

    console.log('✅ Travel flow generated successfully');
    
    // Ensure all nodes have type: 'custom' and sync id with day
    const processedFlow = {
      ...result.object.flow,
      nodes: result.object.flow.nodes.map(node => ({
        ...node,
        id: node.data.day ? String(node.data.day) : node.id,
        type: 'custom'
      }))
    };

    // Store in database
    const tripName = name || `Trip to ${destinations}`;
    const [newTrip] = await db.insert(trips).values({
      userId: session.user.id,
      name: tripName,
      destinations,
      startDate: startDate || null,
      endDate: endDate || null,
      travellers: travellers || null,
      pace: pace || 'balanced',
      budget: budget || null,
      interests: interests || null,
      mustSees: mustSees || null,
      avoid: avoid || null,
      mobilityConstraints: mobilityConstraints || null,
      travelModes: travelModes || null,
      tripData: JSON.stringify(processedFlow),
    }).returning();

    console.log('💾 Trip saved to database with ID:', newTrip.id);

    return res.status(200).json({
      success: true,
      tripId: newTrip.id,
      data: {
        ...result.object,
        flow: processedFlow
      }
    });
  } catch (error) {
    console.error('Error creating trip:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to create trip'
    });
  }
}
