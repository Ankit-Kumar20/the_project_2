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
    info: z.string().optional()
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

    const prompt = `You are an AI travel planner. The user wants to go on a ${days || 7}-day trip from ${from || 'Delhi'} to ${to || 'Goa'}${stops ? ` with stops in ${stops}` : ''}. Generate a travel flow in JSON format following the given schema.`;

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
