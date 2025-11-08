# JSON Restructuring Flow - How the Chatbot Works

## Overview

The chatbot uses a **complete JSON restructuring approach** where the LLM receives the entire graph JSON from the database, modifies it, and returns a complete new JSON structure that replaces the old one.

## Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│  1. User opens trip canvas                                  │
│     Graph loaded from database: { nodes: [...], edges: [...]}│
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  2. User sends query to chatbot                             │
│     Example: "Add a stop in Milan on day 3"                 │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  3. ChatWidget sends COMPLETE current graph to API          │
│     POST /api/chatbot/graph-command                         │
│     Body: {                                                 │
│       query: "Add a stop in Milan on day 3",               │
│       nodes: [...ALL current nodes...],                     │
│       edges: [...ALL current edges...],                     │
│       conversationHistory: [...]                            │
│     }                                                        │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  4. API passes OLD GRAPH JSON to LLM (GPT-4o)              │
│                                                             │
│     Prompt includes:                                        │
│     - Complete current graph JSON                           │
│     - User query                                            │
│     - Instructions to return COMPLETE new graph             │
│                                                             │
│     ```json                                                 │
│     CURRENT GRAPH:                                          │
│     {                                                       │
│       "nodes": [                                            │
│         {"id": "1", "data": {"label": "Paris"}, ...},      │
│         {"id": "2", "data": {"label": "Rome"}, ...}        │
│       ],                                                    │
│       "edges": [...]                                        │
│     }                                                       │
│     ```                                                     │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  5. LLM RESTRUCTURES the complete graph                     │
│                                                             │
│     - Reads entire old graph structure                      │
│     - Applies user's requested modifications                │
│     - Generates COMPLETE NEW graph JSON                     │
│     - Includes ALL nodes and edges (modified + unchanged)   │
│                                                             │
│     NEW GRAPH:                                              │
│     {                                                       │
│       "nodes": [                                            │
│         {"id": "1", "data": {"label": "Paris"}, ...},      │
│         {"id": "2", "data": {"label": "Rome"}, ...},       │
│         {"id": "3", "data": {"label": "Milan"}, ...} ← NEW │
│       ],                                                    │
│       "edges": [...]                                        │
│     }                                                       │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  6. LLM returns response                                    │
│     {                                                       │
│       "message": "I've added Milan as day 3...",           │
│       "graphChanged": true,                                 │
│       "graph": {                                            │
│         "nodes": [...COMPLETE array with Milan added...],  │
│         "edges": [...COMPLETE array...]                     │
│       }                                                     │
│     }                                                       │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  7. ChatWidget receives COMPLETE new graph                  │
│     - Displays message to user                              │
│     - If graphChanged === true:                             │
│       → Calls onGraphUpdate(newNodes, newEdges)             │
│       → REPLACES entire graph state                         │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  8. Canvas updates with NEW complete graph                  │
│     - setNodes(result.graph.nodes) ← COMPLETE replacement  │
│     - setEdges(result.graph.edges) ← COMPLETE replacement  │
│     - Adds to history for undo/redo                         │
│     - Triggers debounced save                               │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  9. Auto-save to database (after 1.5s debounce)            │
│     PATCH /api/trips/[tripId]                              │
│     Body: {                                                 │
│       nodes: [...NEW COMPLETE nodes array...],             │
│       edges: [...NEW COMPLETE edges array...]              │
│     }                                                       │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  10. Database REPLACES old JSON with new JSON               │
│      UPDATE trips                                           │
│      SET tripData = '{"nodes":[...],"edges":[...]}',       │
│          updatedAt = NOW()                                  │
│      WHERE id = tripId                                      │
│                                                             │
│      OLD JSON → COMPLETELY REPLACED → NEW JSON             │
└─────────────────────────────────────────────────────────────┘
```

## Key Points

### ✅ Complete Replacement Approach
- **Not incremental commands** - LLM doesn't generate "add node" commands
- **Full JSON restructuring** - LLM receives full graph, returns full graph
- **Database replacement** - New JSON completely replaces old JSON in database

### ✅ LLM Responsibilities
1. **Read** the complete current graph JSON
2. **Understand** the user's modification request
3. **Apply** modifications to create new graph structure
4. **Return** COMPLETE new graph with ALL nodes and edges

### ✅ Preserves Unchanged Data
- LLM includes all nodes that weren't modified
- LLM includes all edges that weren't affected
- All node properties (activities, accommodation, etc.) preserved
- Only requested changes are applied

### ✅ Benefits
- **Simpler logic** - No complex command execution on frontend
- **LLM control** - AI has full control over graph structure
- **Database consistency** - Always full, valid graph in database
- **Easier debugging** - Clear before/after JSON comparison

## Example: Adding a Node

### Before (Old JSON in DB):
```json
{
  "nodes": [
    {
      "id": "1",
      "type": "custom",
      "data": { "label": "Paris", "day": 1 },
      "position": { "x": 250, "y": 150 }
    },
    {
      "id": "2",
      "type": "custom",
      "data": { "label": "Rome", "day": 2 },
      "position": { "x": 250, "y": 300 }
    }
  ],
  "edges": [
    {
      "id": "e1-2",
      "source": "1",
      "target": "2",
      "label": "Flight"
    }
  ]
}
```

### User Query:
```
"Add Milan on day 3"
```

### After (New JSON from LLM → Saved to DB):
```json
{
  "nodes": [
    {
      "id": "1",
      "type": "custom",
      "data": { "label": "Paris", "day": 1 },
      "position": { "x": 250, "y": 150 }
    },
    {
      "id": "2",
      "type": "custom",
      "data": { "label": "Rome", "day": 2 },
      "position": { "x": 250, "y": 300 }
    },
    {
      "id": "3",                                    ← NEW
      "type": "custom",                             ← NEW
      "data": {                                     ← NEW
        "label": "Milan",                           ← NEW
        "day": 3,                                   ← NEW
        "googleMapsLink": "https://..."             ← NEW
      },                                            ← NEW
      "position": { "x": 300, "y": 450 }            ← NEW
    }                                               ← NEW
  ],
  "edges": [
    {
      "id": "e1-2",
      "source": "1",
      "target": "2",
      "label": "Flight"
    }
  ]
}
```

### What Happened:
1. ✅ LLM kept Paris (node 1) - unchanged
2. ✅ LLM kept Rome (node 2) - unchanged
3. ✅ LLM added Milan (node 3) - new
4. ✅ LLM kept edge e1-2 - unchanged
5. ✅ Complete new JSON saved to database
6. ✅ Old JSON completely replaced

## Example: Removing a Node

### User Query:
```
"Remove Rome"
```

### After (New JSON from LLM):
```json
{
  "nodes": [
    {
      "id": "1",
      "type": "custom",
      "data": { "label": "Paris", "day": 1 },
      "position": { "x": 250, "y": 150 }
    },
    {
      "id": "3",
      "type": "custom",
      "data": { "label": "Milan", "day": 3 },
      "position": { "x": 300, "y": 450 }
    }
  ],
  "edges": []  ← Edge e1-2 removed because it connected to Rome
}
```

### What Happened:
1. ✅ LLM removed node 2 (Rome)
2. ✅ LLM removed edge e1-2 (connected to Rome)
3. ✅ LLM kept Paris and Milan
4. ✅ Complete new JSON saved to database

## Example: Question-Only Query

### User Query:
```
"What are the best restaurants in Paris?"
```

### LLM Response:
```json
{
  "message": "Paris has many excellent restaurants including...",
  "graphChanged": false
  // No "graph" field - nothing changes
}
```

### What Happened:
1. ✅ LLM answered the question
2. ✅ graphChanged = false
3. ✅ No graph replacement
4. ✅ No database save triggered

## Code Implementation

### API Endpoint (`pages/api/chatbot/graph-command.ts`)
```typescript
// Send COMPLETE old graph JSON to LLM
const currentGraphJSON = JSON.stringify({ 
  nodes: nodes || [], 
  edges: edges || [] 
}, null, 2);

// Prompt instructs LLM to return COMPLETE new graph
const prompt = `
CURRENT GRAPH JSON (from database):
${currentGraphJSON}

User Query: "${query}"

Return COMPLETE restructured graph JSON that will REPLACE the old one.
`;

// LLM returns complete new graph
const result = await generateObject({
  model: openai('gpt-4o'),
  schema: ResponseSchema,  // Includes complete graph structure
  prompt,
});
```

### ChatWidget (`components/ChatWidget.tsx`)
```typescript
// If graph changed, replace entire graph
if (result.data.graphChanged && result.data.graph) {
  onGraphUpdate(
    result.data.graph.nodes,  // COMPLETE new nodes array
    result.data.graph.edges   // COMPLETE new edges array
  );
}
```

### Canvas (`pages/canvas.tsx`)
```typescript
onGraphUpdate={(newNodes, newEdges) => {
  setHistory(prev => [...prev, { nodes, edges }]);  // Save old for undo
  setNodes(newNodes);    // REPLACE all nodes
  setEdges(newEdges);    // REPLACE all edges
  debouncedSave(newNodes, newEdges);  // Save to DB
}}
```

### Database Save (`pages/api/trips/[id].ts`)
```typescript
// PATCH handler - replaces entire tripData JSON
const tripData = JSON.stringify({ nodes, edges });

await db.update(trips)
  .set({ 
    tripData,           // COMPLETE replacement
    updatedAt: new Date()
  })
  .where(eq(trips.id, id));
```

## Advantages of This Approach

1. **Simplicity** - No complex command execution logic
2. **LLM Power** - AI fully controls graph restructuring
3. **Consistency** - Always complete, valid graph in database
4. **Debugging** - Easy to see before/after JSON
5. **Flexibility** - LLM can make complex multi-step changes
6. **Safety** - Full validation on complete graph structure

## Validation

The LLM response is validated using Zod schemas:

```typescript
const ResponseSchema = z.object({
  message: z.string(),
  graphChanged: z.boolean(),
  graph: z.object({
    nodes: z.array(NodeSchema),
    edges: z.array(EdgeSchema)
  }).optional()
});
```

This ensures the LLM always returns a valid, complete graph structure.

---

**Summary:** The old graph JSON is loaded from the database, passed to the LLM, restructured based on the user's query, and the complete new JSON is saved back to the database, replacing the old one entirely.
