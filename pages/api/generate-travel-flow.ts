import 'dotenv/config';
import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import type { NextApiRequest, NextApiResponse } from 'next';
import Exa from 'exa-js';

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
  type: z.string().optional().default('smoothstep'),
  data: z.object({
    distance: z.string()
  }).optional()
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
    // Accept startingPoint/destinations from database fields, or fallback to from/to for backward compatibility
    const { 
      startingPoint, 
      destinations, 
      from, 
      to, 
      days, 
      stops 
    } = req.body;

    // Map database fields to internal variables
    const fromLocation = startingPoint || from;
    const toLocation = destinations || to;

    if (!fromLocation || !toLocation) {
      return res.status(400).json({ 
        success: false,
        error: 'Both startingPoint (or from) and destinations (or to) are required' 
      });
    }

    console.log('🔍 Gathering real-time travel information using Exa...');
    const travelInfo = await gatherTravelInformation(fromLocation, toLocation, stops);
    console.log("travelInfo: ", travelInfo);
    const prompt = `You are an AI travel planner. The user wants to go on a ${days || 7}-day trip from ${fromLocation} to ${toLocation}${stops ? ` with stops in ${stops}` : ''}.

${travelInfo}

Using the above real-time information from web search, generate a detailed travel flow showing the GEOGRAPHICAL JOURNEY with the following requirements:

1. NODES REPRESENT REAL LOCATIONS ONLY (cities, tourist spots, landmarks, beaches, monuments, restaurants, hotels, etc.)
   - Each node is a PHYSICAL PLACE the traveler will visit
   - DO NOT create nodes for abstract activities (like "Morning activities" or "Sightseeing")
   - Activities should be listed inside the node's activities array, not as separate nodes
   
2. Create 12-20 location nodes spread across ${days || 7} days
   - Start with ${fromLocation}
   - End with ${toLocation}
   - Include stops at: ${stops || 'interesting places along the route'}
   - Include specific tourist attractions, beaches, forts, temples, markets, restaurants, viewpoints, etc.

3. Each node MUST contain:
   - label: EXACT name of the physical location (e.g., "Gateway of India", "Baga Beach", "Taj Mahal", "Mysore Palace")
   - info: Brief description of the location and why it's worth visiting
   - day: Which day of the trip (1-${days || 7})
   - activities: Array of 3-5 specific things to DO at this location
   - accommodation: Hotel/resort name (for overnight stay locations)
   - transportation: How to travel from previous location (e.g., "20 min taxi", "2 hr train", "flight")
   - estimatedCost: Approximate cost for visiting (entry fees + food + transport)
   - duration: Recommended time to spend at this location
   - tips: Array of 2-3 practical tips for visiting this place
   - googleMapsLink: "https://www.google.com/maps/search/?api=1&query=EXACT_LOCATION_NAME" (URL-encoded)
   - coordinates: Accurate lat/lng for the exact location

4. Node types based on location category:
   - 'city': Major cities/towns
   - 'attraction': Tourist spots, monuments, museums, viewpoints
   - 'restaurant': Specific famous restaurants or food streets
   - 'accommodation': Hotels/resorts where staying overnight

5. Connect locations in travel order with edges showing distance and time
   - Each edge MUST have data.distance showing: "Distance, Time" (e.g., "45 km, 1 hr", "2 km, 10 min walk")
   
6. Use REAL locations from the web search results above - mention actual place names, not generic activities

7. Position nodes vertically by day, with x varying for visual layout

8. **CRITICAL: Node ID MUST EQUAL the day number** (day 1 = id "1", day 2 = id "2", etc.)
 
 Generate the complete travel flow in JSON format.`;

    try {
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
      
      return res.status(200).json({
        success: true,
        data: {
          ...result.object,
          flow: processedFlow
        }
      });
    } catch (llmError) {
      console.error('LLM generation error:', llmError);
      throw new Error('Failed to generate travel plan with AI');
    }
  } catch (error) {
    console.error('Error generating travel flow:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to generate travel flow'
    });
  }
}
