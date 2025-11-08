# Node ID & Day Number Synchronization

## Overview

The LLM is instructed to ensure **node IDs always match their day numbers**. When nodes are removed or days are renumbered, both the day number and node ID are updated together to maintain synchronization.

---

## The Rule

**All nodes in the database must ALWAYS follow this pattern:**
- **Node ID = Day Number** (day 1 → id "1", day 2 → id "2", day 3 → id "3")
- Days start from 1 and are sequential: 1, 2, 3, 4, etc.
- IDs start from "1" and match the day sequence
- NO gaps in day numbers or IDs

---

## Example: Removing a Node

### Initial State (3 nodes):

**Graph in Database:**
```json
{
  "nodes": [
    {"id": "1", "data": {"label": "Paris", "day": 1}, "position": {"x": 250, "y": 150}},
    {"id": "2", "data": {"label": "Rome", "day": 2}, "position": {"x": 300, "y": 300}},
    {"id": "3", "data": {"label": "Milan", "day": 3}, "position": {"x": 250, "y": 450}}
  ],
  "edges": [
    {"id": "e1-2", "source": "1", "target": "2", "label": "Flight"},
    {"id": "e2-3", "source": "2", "target": "3", "label": "Train"}
  ]
}
```

**Pattern:**
- Day 1 → ID "1" (Paris)
- Day 2 → ID "2" (Rome)
- Day 3 → ID "3" (Milan)

**Visual:**
```
[Day 1, ID 1: Paris] → [Day 2, ID 2: Rome] → [Day 3, ID 3: Milan]
```

---

### User Action: Remove Rome

**User Query:** `"Remove Rome"`

**LLM Processing:**
1. Identifies node "2" (Rome, day 2) for removal
2. Removes node "2" from nodes array
3. Removes edges connected to node "2" (e1-2 and e2-3)
4. **RENUMBERS days: Milan changes from day 3 → day 2**
5. **Updates ID to match new day: Milan ID changes from "3" → "2"**
6. **Updates position.y: Milan changes from 450 → 300 (day 2 * 150)**
7. **Updates edge references if needed**

---

### Result (After Reordering):

**New Graph in Database:**
```json
{
  "nodes": [
    {"id": "1", "data": {"label": "Paris", "day": 1}, "position": {"x": 250, "y": 150}},
    {"id": "2", "data": {"label": "Milan", "day": 2}, "position": {"x": 250, "y": 300}}
  ],
  "edges": []
}
```

**Pattern After Removal:**
- Day 1 → ID "1" (Paris) - unchanged
- Day 2 → ID "2" (Milan) - was day 3, ID "3"

**Visual:**
```
[Day 1, ID 1: Paris]  [Day 2, ID 2: Milan]
```

**What Changed:**
- ✅ Rome removed (was day 2, ID "2")
- ✅ Milan day renumbered: 3 → 2
- ✅ Milan ID renumbered: "3" → "2"
- ✅ Milan position.y updated: 450 → 300
- ✅ Days sequential: 1, 2 (no gap)
- ✅ IDs match days: day 1 = ID "1", day 2 = ID "2"
- ✅ Edges removed (both connected to Rome)

---

## Example: Remove First Node

### Initial State:
```json
{
  "nodes": [
    {"id": "1", "data": {"label": "London"}},
    {"id": "2", "data": {"label": "Paris"}},
    {"id": "3", "data": {"label": "Rome"}},
    {"id": "4", "data": {"label": "Milan"}}
  ],
  "edges": [
    {"id": "e1-2", "source": "1", "target": "2"},
    {"id": "e2-3", "source": "2", "target": "3"},
    {"id": "e3-4", "source": "3", "target": "4"}
  ]
}
```

### User Query: `"Remove London"`

### Result (After Reordering):
```json
{
  "nodes": [
    {"id": "1", "data": {"label": "Paris"}},      ← Was "2", now "1"
    {"id": "2", "data": {"label": "Rome"}},       ← Was "3", now "2"
    {"id": "3", "data": {"label": "Milan"}}       ← Was "4", now "3"
  ],
  "edges": [
    {"id": "e1-2", "source": "1", "target": "2"}, ← Updated: Paris(1) → Rome(2)
    {"id": "e2-3", "source": "2", "target": "3"}  ← Updated: Rome(2) → Milan(3)
  ]
}
```

**All nodes shifted down by 1!**

---

## Example: Remove Middle Node

### Initial State:
```json
{
  "nodes": [
    {"id": "1", "data": {"label": "Amsterdam"}},
    {"id": "2", "data": {"label": "Brussels"}},
    {"id": "3", "data": {"label": "Paris"}},
    {"id": "4", "data": {"label": "Lyon"}}
  ],
  "edges": [
    {"id": "e1-2", "source": "1", "target": "2"},
    {"id": "e2-3", "source": "2", "target": "3"},
    {"id": "e3-4", "source": "3", "target": "4"}
  ]
}
```

### User Query: `"Remove Paris"`

### Result (After Reordering):
```json
{
  "nodes": [
    {"id": "1", "data": {"label": "Amsterdam"}},  ← Stays "1"
    {"id": "2", "data": {"label": "Brussels"}},   ← Stays "2"
    {"id": "3", "data": {"label": "Lyon"}}        ← Was "4", now "3"
  ],
  "edges": [
    {"id": "e1-2", "source": "1", "target": "2"}  ← Kept (not connected to Paris)
  ]
}
```

**Only nodes after the removed one are renumbered!**

---

## Example: Remove Last Node

### Initial State:
```json
{
  "nodes": [
    {"id": "1", "data": {"label": "Madrid"}},
    {"id": "2", "data": {"label": "Barcelona"}},
    {"id": "3", "data": {"label": "Valencia"}}
  ],
  "edges": [
    {"id": "e1-2", "source": "1", "target": "2"},
    {"id": "e2-3", "source": "2", "target": "3"}
  ]
}
```

### User Query: `"Remove Valencia"`

### Result (No Reordering Needed):
```json
{
  "nodes": [
    {"id": "1", "data": {"label": "Madrid"}},     ← Stays "1"
    {"id": "2", "data": {"label": "Barcelona"}}   ← Stays "2"
  ],
  "edges": [
    {"id": "e1-2", "source": "1", "target": "2"}  ← Kept
  ]
}
```

**No reordering needed - already sequential!**

---

## Adding Nodes (Sequential IDs)

### Initial State (2 nodes):
```json
{
  "nodes": [
    {"id": "1", "data": {"label": "Berlin"}},
    {"id": "2", "data": {"label": "Munich"}}
  ]
}
```

### User Query: `"Add Frankfurt on day 2"`

### Result:
```json
{
  "nodes": [
    {"id": "1", "data": {"label": "Berlin"}},
    {"id": "2", "data": {"label": "Munich"}},
    {"id": "3", "data": {"label": "Frankfurt"}} ← New node gets next sequential ID
  ]
}
```

---

## Edge ID Updates

### Rule for Edge IDs:
- Pattern: `"e{source}-{target}"`
- Must use the **final** node IDs (after reordering)

### Example:

**Before Removal:**
- Node IDs: "1", "2", "3"
- Edge: `{"id": "e1-3", "source": "1", "target": "3"}`

**After Removing Node "2":**
- Node IDs: "1", "2" (old "3" became "2")
- Edge: `{"id": "e1-2", "source": "1", "target": "2"}` ← Updated!

---

## LLM Instructions (In Prompt)

The LLM is explicitly instructed:

```
**CRITICAL: Node IDs MUST ALWAYS start from "1" and be sequential ("1", "2", "3", etc.)**

When removing nodes, REORDER all remaining node IDs to maintain sequential order starting from "1"

Update ALL edge source/target references when node IDs are reordered
```

**Example provided to LLM:**
```
BEFORE: nodes ["1", "2", "3"]
Remove "2"
AFTER: nodes ["1", "2"] where "2" is the old "3"
```

---

## Benefits

✅ **Clean Database** - No gaps in node IDs  
✅ **Predictable Structure** - Always starts from "1"  
✅ **Easier Debugging** - Sequential IDs are easier to track  
✅ **Consistent State** - Database always has clean structure  
✅ **No ID Conflicts** - Clear sequential pattern  

---

## Testing

### Test 1: Remove First Node
```
Initial: ["1: Paris", "2: Rome", "3: Milan"]
Remove: Paris
Expected: ["1: Rome", "2: Milan"]
```

### Test 2: Remove Middle Node
```
Initial: ["1: London", "2: Paris", "3: Rome", "4: Milan"]
Remove: Paris
Expected: ["1: London", "2: Rome", "3: Milan"]
```

### Test 3: Remove Last Node
```
Initial: ["1: Berlin", "2: Munich", "3: Frankfurt"]
Remove: Frankfurt
Expected: ["1: Berlin", "2: Munich"]
```

### Test 4: Remove Multiple Times
```
Initial: ["1: A", "2: B", "3: C", "4: D", "5: E"]
Remove B: ["1: A", "2: C", "3: D", "4: E"]
Remove D: ["1: A", "2: C", "3: E"]
Remove A: ["1: C", "2: E"]
```

---

## Summary

**The Rule:** Node IDs ALWAYS start from "1" and are sequential with NO gaps.

**When Removing Nodes:**
1. Remove the target node
2. Renumber all remaining nodes starting from "1"
3. Update all edge references to use new node IDs
4. Save clean, sequential structure to database

**Result:** Clean, predictable, gap-free node IDs in the database! ✅
