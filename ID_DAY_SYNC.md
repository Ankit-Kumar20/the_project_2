# Node ID & Day Number Synchronization - Final Implementation

## The Rule

**Node IDs MUST ALWAYS equal their day numbers:**
- Day 1 → ID "1"
- Day 2 → ID "2"  
- Day 3 → ID "3"
- And so on...

---

## Quick Example

### Before Removal:
```json
{
  "nodes": [
    {"id": "1", "data": {"label": "Paris", "day": 1}, "position": {"y": 150}},
    {"id": "2", "data": {"label": "Rome", "day": 2}, "position": {"y": 300}},
    {"id": "3", "data": {"label": "Milan", "day": 3}, "position": {"y": 450}}
  ]
}
```

Pattern: `day 1 = ID "1"`, `day 2 = ID "2"`, `day 3 = ID "3"` ✅

---

### User Action: `"Remove Rome"`

---

### After Removal (Day/ID Synchronized):
```json
{
  "nodes": [
    {"id": "1", "data": {"label": "Paris", "day": 1}, "position": {"y": 150}},
    {"id": "2", "data": {"label": "Milan", "day": 2}, "position": {"y": 300}}
  ]
}
```

**Changes to Milan:**
- Day: 3 → **2**
- ID: "3" → **"2"**
- Position Y: 450 → **300** (day 2 * 150)

Pattern: `day 1 = ID "1"`, `day 2 = ID "2"` ✅

---

## LLM Instructions (In Prompt)

### Adding Nodes:
```
CRITICAL: Node ID MUST MATCH the day number
- Day 1 → id "1"
- Day 2 → id "2"  
- Day 3 → id "3"
```

### Removing Nodes:
```
CRITICAL: RENUMBER ALL REMAINING NODES so IDs MATCH their day numbers
- Adjust day numbers to be sequential starting from 1
- Update node IDs to match the new day numbers
- Update edge references
- Update position.y based on new day (day * 150)
```

---

## Example in LLM Prompt

```
BEFORE (Old Graph):
{
  "nodes": [
    {"id": "1", "data": {"label": "Paris", "day": 1}, "position": {"x": 250, "y": 150}},
    {"id": "2", "data": {"label": "Rome", "day": 2}, "position": {"x": 300, "y": 300}},
    {"id": "3", "data": {"label": "Milan", "day": 3}, "position": {"x": 250, "y": 450}}
  ]
}

User removes "Rome" (day 2, id "2")

AFTER (New Graph - DAYS AND IDs RENUMBERED):
{
  "nodes": [
    {"id": "1", "data": {"label": "Paris", "day": 1}, "position": {"x": 250, "y": 150}},
    {"id": "2", "data": {"label": "Milan", "day": 2}, "position": {"x": 250, "y": 300}}
  ]
}

What changed:
- Rome removed
- Milan: day 3 → 2, id "3" → "2", position.y 450 → 300
- Days sequential: 1, 2 (no gap)
- IDs match days: day 1 = id "1", day 2 = id "2"
```

---

## Benefits

✅ **Clear Relationship** - ID instantly shows which day  
✅ **Easy to Understand** - Day 3 is always node "3"  
✅ **No Confusion** - One number represents both day and ID  
✅ **Predictable** - Always starts from 1, always sequential  
✅ **Clean Database** - No gaps, no mismatches  

---

## Testing Checklist

- [ ] Add node on day 4 → Should get ID "4"
- [ ] Remove day 2 → Day 3 becomes day 2 with ID "2"
- [ ] Remove day 1 → All subsequent days shift down
- [ ] Check position.y updates with day changes
- [ ] Verify edge references update correctly
- [ ] Confirm no gaps in day/ID sequence

---

## Summary

**The golden rule:** `node.id === node.data.day.toString()`

Every node's ID must equal its day number, always!
