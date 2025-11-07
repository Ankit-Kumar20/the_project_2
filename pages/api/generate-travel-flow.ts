import 'dotenv/config';
import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import type { NextApiRequest, NextApiResponse } from 'next';

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
    tips: z.array(z.string()).optional()
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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { from, to, days, stops } = req.body;

    const prompt = `You are an AI travel planner. The user wants to go on a ${days || 7}-day trip from ${from || 'Delhi'} to ${to || 'Goa'}${stops ? ` with stops in ${stops}` : ''}.

Generate a detailed travel flow with the following requirements:
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

4. Node types should vary: 'city', 'attraction', 'activity', 'restaurant', 'accommodation'
5. Position nodes vertically with x coordinates varying slightly for visual appeal
6. Create a comprehensive day-by-day itinerary with morning, afternoon, and evening activities

Generate the complete travel flow in JSON format.`;

    const result = await generateObject({
      model: openai('gpt-4o'),
      schema: AIResponseSchema,
      prompt,
    });

    return res.status(200).json({
      success: true,
      data: result.object
    });
  } catch (error) {
    console.error('Error generating travel flow:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to generate travel flow'
    });
  }
}
