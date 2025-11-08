import 'dotenv/config';
import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import type { NextApiRequest, NextApiResponse } from 'next';

const NodeSchema = z.object({
    id: z.string(),
    type: z.string().optional().default('custom'),
    data: z.object({
        label: z.string(),
        info: z.string().optional(),
        day: z.number().optional(),
        googleMapsLink: z.string().optional(),
    }).passthrough(),
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
    animated: z.boolean().optional()
});

const GraphSchema = z.object({
    nodes: z.array(NodeSchema),
    edges: z.array(EdgeSchema)
});

const ResponseSchema = z.object({
    message: z.string(),
    graphChanged: z.boolean(),
    graph: GraphSchema.optional()
});

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { query, nodes, edges, conversationHistory } = req.body;

        if (!query || !query.trim()) {
            return res.status(400).json({ error: 'Query is required' });
        }

        const currentGraphJSON = JSON.stringify({ nodes: nodes || [], edges: edges || [] }, null, 2);

        const graphContext = `
CURRENT GRAPH JSON (This is the complete graph structure from the database):
\`\`\`json
${currentGraphJSON}
\`\`\`

Summary:
- Total Nodes: ${nodes?.length || 0}
- Total Edges: ${edges?.length || 0}
- Nodes: ${nodes?.map((n: any) => `"${n.data.label}" (ID: ${n.id}, Day: ${n.data.day || 'N/A'})`).join(', ') || 'None'}
- Edges: ${edges?.map((e: any) => `${e.source} → ${e.target}${e.label ? ` (${e.label})` : ''}`).join(', ') || 'None'}
`;

        const conversationContext = conversationHistory && conversationHistory.length > 0
            ? `\nRecent Conversation:\n${conversationHistory.slice(-5).map((msg: any) => `${msg.role}: ${msg.text}`).join('\n')}`
            : '';

        const prompt = `You are an AI assistant that helps users manipulate a travel itinerary graph/flowchart stored in a database as JSON.

${graphContext}
${conversationContext}

User Query: "${query}"

IMPORTANT: You will receive the COMPLETE graph JSON from the database and must return a COMPLETE restructured graph JSON that will REPLACE the old one in the database.

YOUR TASK:
1. Analyze the user's request
2. Take the current graph JSON shown above
3. Apply the requested modifications to create a NEW complete graph JSON
4. Return the COMPLETE restructured graph (with all nodes and edges)

GRAPH MANIPULATION GUIDELINES:

**Adding Nodes:**
- **CRITICAL: Node ID MUST MATCH the day number** (day 1 → id "1", day 2 → id "2", day 3 → id "3")
- If adding a new day, assign next sequential day number and matching ID
- Calculate position for NEW nodes only: { x: 250-400 (vary for visual appeal), y: day * 150 }
- **PRESERVE existing node positions - do NOT recalculate positions for existing nodes**
- Always include: id, type: "custom", data: { label, day, googleMapsLink }, position
- Generate Google Maps link: "https://www.google.com/maps/search/?api=1&query=PLACE_NAME"

**Removing Nodes:**
- Remove the node from nodes array
- Remove ALL edges connected to that node (where source or target = node.id)
- **CRITICAL: RENUMBER ALL REMAINING NODES so IDs MATCH their day numbers**
- **Adjust day numbers to be sequential starting from 1**
- **PRESERVE existing node positions - do NOT recalculate positions when updating day numbers**
- Update ALL edge source/target references to use the NEW node IDs
- Example: If nodes [day 1, day 2, day 3] and you remove day 2, remaining nodes should be [day 1, day 2 (was day 3)] with IDs ["1", "2"]

**Adding Edges:**
- Generate unique ID: "e" + source + "-" + target
- Include: id, source (node ID), target (node ID), label (optional, e.g., "3h drive")
- Set type: "smoothstep", animated: false

**Updating Nodes:**
- Find node by ID or label match
- Update properties while keeping existing structure
- Keep the same node ID unless reordering is required

**Question-Only Queries:**
- If user asks a question without requesting modifications (e.g., "What should I do in Paris?")
- Set graphChanged: false
- Don't include graph in response
- Provide helpful answer in message

RESPONSE FORMAT:
{
  "message": "Helpful response explaining what you did or answering the question",
  "graphChanged": true/false,
  "graph": {
    "nodes": [...complete array of ALL nodes...],
    "edges": [...complete array of ALL edges...]
  }
}

IMPORTANT RULES:
1. If graphChanged is true, you MUST return the COMPLETE graph with ALL nodes and edges
2. The returned graph will REPLACE the entire graph in the database
3. Keep all existing nodes/edges that weren't modified
4. **CRITICAL: Node ID MUST ALWAYS EQUAL the day number** (day 1 = id "1", day 2 = id "2", day 3 = id "3")
5. **When removing nodes, RENUMBER days sequentially from 1 and update IDs to match**
6. **Update ALL edge source/target references when node IDs are changed**
7. Always validate that edges reference existing node IDs
8. For new nodes, calculate position based on day: { x: 250-400, y: day * 150 }
9. Preserve all node data properties (activities, accommodation, etc.) when not modifying them
10. Edge IDs should follow pattern "e{source}-{target}" using the final node IDs
11. **PRESERVE existing node positions - NEVER recalculate positions for nodes that already exist in the graph**
12. **Only calculate positions for NEW nodes being added - keep existing nodes at their current x,y coordinates**

EXAMPLE OF NODE REMOVAL WITH DAY/ID RENUMBERING:

BEFORE (Old Graph):
{
  "nodes": [
    {"id": "1", "data": {"label": "Paris", "day": 1}, "position": {"x": 250, "y": 150}},
    {"id": "2", "data": {"label": "Rome", "day": 2}, "position": {"x": 300, "y": 300}},
    {"id": "3", "data": {"label": "Milan", "day": 3}, "position": {"x": 250, "y": 450}}
  ],
  "edges": [
    {"id": "e1-2", "source": "1", "target": "2"},
    {"id": "e2-3", "source": "2", "target": "3"}
  ]
}

User removes "Rome" (day 2, id "2")

AFTER (New Graph - DAYS AND IDs RENUMBERED):
{
  "nodes": [
    {"id": "1", "data": {"label": "Paris", "day": 1}, "position": {"x": 250, "y": 150}},
    {"id": "2", "data": {"label": "Milan", "day": 2}, "position": {"x": 250, "y": 450}}
  ],
  "edges": [
    {"id": "e1-2", "source": "1", "target": "2"}
  ]
}

What changed:
- Rome removed
- Milan: day changed from 3 → 2, id changed from "3" → "2", **position PRESERVED at {x: 250, y: 450}**
- Edge updated to connect "1" to new "2"
- Days are now sequential: 1, 2 (no gap)
- IDs match days: day 1 = id "1", day 2 = id "2"
- **Node positions NOT recalculated - they stay where the user placed them**

Now analyze the user's query and return the appropriate response.`;

        const result = await generateObject({
            model: openai('gpt-4o'),
            schema: ResponseSchema,
            prompt,
        });

        console.log('✅ Chatbot processed query:', query);
        console.log('📊 Graph changed:', result.object.graphChanged);
        if (result.object.graphChanged) {
            console.log('📍 New graph has', result.object.graph?.nodes.length, 'nodes and', result.object.graph?.edges.length, 'edges');
        }

        return res.status(200).json({
            success: true,
            data: result.object
        });

    } catch (error) {
        console.error('Error processing chatbot query:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to process query'
        });
    }
}
