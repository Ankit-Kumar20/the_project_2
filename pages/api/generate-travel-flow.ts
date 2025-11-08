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
        text: true
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
    const { from, to, days, stops } = req.body;

    console.log('🔍 Gathering real-time travel information using Exa...');
    const travelInfo = await gatherTravelInformation(from, to, stops);
    console.log("travelInfo: ", travelInfo);
    const prompt = `You are an AI travel planner. The user wants to go on a ${days || 7}-day trip from ${from || 'Delhi'} to ${to || 'Goa'}${stops ? ` with stops in ${stops}` : ''}.

${travelInfo}

Using the above real-time information from web search, generate a detailed travel flow with the following requirements:
1. Create nodes for each day of the journey (minimum ${days || 7} nodes)
2. Include intermediate stops, attractions, and activities (aim for 15-25 total nodes)
3. Each node should contain:
   - label: Name of the location/activity
   - info: Brief description
   - day: Which day of the trip (1-${days || 7})
   - activities: Array of 3-5 specific activities to do at this location
   - accommodation: Suggested place to stay (hotel/resort/guesthouse)
   - transportation: How to reach this location from previous node
   - estimatedCost: Approximate cost in local currency
   - duration: How long to spend here
   - tips: Array of 2-3 helpful travel tips
   - googleMapsLink: Generate a Google Maps URL in the format "https://www.google.com/maps/search/?api=1&query=PLACE_NAME" (replace PLACE_NAME with URL-encoded location name)
   - coordinates: Approximate latitude and longitude of the location (e.g., {lat: 15.2993, lng: 74.1240} for Goa)

4. Node types should vary: 'city', 'attraction', 'activity', 'restaurant', 'accommodation'
5. Position nodes vertically with x coordinates varying slightly for visual appeal
6. Create a comprehensive day-by-day itinerary with morning, afternoon, and evening activities
7. IMPORTANT: Use the real-time information provided above to suggest actual attractions, activities, and places mentioned in the search results
8. IMPORTANT: For each location, generate accurate Google Maps links and approximate coordinates

Generate the complete travel flow in JSON format.`;

    try {
      console.log('🤖 Generating travel flow with LLM...');
      const result = await generateObject({
        model: openai('gpt-4o'),
        schema: AIResponseSchema,
        prompt,
      });

      console.log('✅ Travel flow generated successfully');
      
      // Ensure all nodes have type: 'custom' to display Google Maps links
      const processedFlow = {
        ...result.object.flow,
        nodes: result.object.flow.nodes.map(node => ({
          ...node,
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
