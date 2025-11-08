# Database Persistence for Chatbot Changes

## Overview

All changes made by the chatbot are automatically saved to the database with a debounced auto-save mechanism. Users can refresh the page or return later to see their chatbot-modified itineraries.

## Implementation Details

### 1. API Endpoint: `/api/trips/[id]`

**PATCH Method** - Updates trip data in the database

**Request:**
```typescript
{
  nodes: Node[],  // Array of graph nodes
  edges: Edge[]   // Array of graph edges
}
```

**Response:**
```typescript
{
  success: true,
  message: "Trip updated successfully"
}
```

**Authentication:** Requires valid session, users can only update their own trips

### 2. Auto-Save Mechanism

**Debounced Save (1.5 seconds)**
- Changes are debounced to avoid excessive database writes
- Each chatbot modification triggers a save after 1.5 seconds of inactivity
- Undo/redo operations also trigger auto-save

**Implementation in `canvas.tsx`:**
```typescript
const debouncedSave = useCallback((nodesToSave: Node[], edgesToSave: Edge[]) => {
    if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
        saveTripData(nodesToSave, edgesToSave);
    }, 1500);
}, [saveTripData]);
```

### 3. Save Status Indicator

**Visual Feedback:**
- **Saving...** - Shows spinning icon while saving to database
- **Saved** - Shows green checkmark when successfully saved
- Located in top-right corner of canvas

**States:**
- `isSaving: boolean` - Currently saving to database
- `lastSaved: Date | null` - Timestamp of last successful save

### 4. Data Flow

```
User Query → Chatbot API → Graph Commands → Update Graph State
                                                      ↓
                                              Debounced Save
                                                      ↓
                                              PATCH /api/trips/[id]
                                                      ↓
                                              Update Database
                                                      ↓
                                              Show "Saved" Status
```

## Database Schema

**trips table:**
```sql
trips {
  id: text (primary key)
  userId: text (foreign key)
  name: varchar(255)
  destinations: text
  tripData: text  -- JSON stringified {nodes, edges}
  createdAt: timestamp
  updatedAt: timestamp  -- Updated on each save
  ...
}
```

## Features

✅ **Automatic Persistence** - All chatbot changes saved automatically  
✅ **Debounced Saves** - Prevents excessive database writes  
✅ **Undo/Redo Persistence** - Undo/redo states are also saved  
✅ **Visual Feedback** - Save status indicator shows current state  
✅ **Error Handling** - Gracefully handles save failures  
✅ **User Isolation** - Users can only modify their own trips  

## Testing the Feature

### Test Scenario 1: Add a Node
1. Open a trip in canvas view
2. Open the chatbot
3. Type: "Add a stop in Florence on day 4"
4. Wait for "Saving..." indicator
5. See "Saved" checkmark appear
6. Refresh the page
7. ✅ Florence node should still be there

### Test Scenario 2: Remove a Node
1. Type: "Remove Florence"
2. Wait for "Saved" indicator
3. Refresh the page
4. ✅ Florence should be gone

### Test Scenario 3: Undo/Redo
1. Type: "Add Milan on day 5"
2. Click Undo button
3. Wait for "Saved" indicator
4. Refresh the page
5. ✅ Milan should not be there

### Test Scenario 4: Multiple Changes
1. Type: "Add Rome on day 3"
2. Wait 1 second
3. Type: "Connect Paris to Rome with a flight"
4. Wait for "Saved" indicator (both changes batched)
5. Refresh the page
6. ✅ Both Rome and the connection should persist

## Error Handling

**Network Errors:**
- Console logs error but doesn't block UI
- User can continue working
- Changes remain in local state

**Authentication Errors:**
- Automatically redirects to login
- Changes are lost (user not authenticated)

**Validation Errors:**
- Logs error to console
- Shows appropriate error message
- Prevents invalid data from being saved

## Performance Optimization

1. **Debouncing** - Reduces API calls by batching rapid changes
2. **Minimal Payload** - Only sends nodes and edges (not entire trip object)
3. **Optimistic Updates** - UI updates immediately, save happens in background
4. **Session Validation** - Authentication checked once per save

## Future Enhancements

- [ ] Offline support with local storage fallback
- [ ] Conflict resolution for concurrent edits
- [ ] Change history/audit log
- [ ] Manual save button for user control
- [ ] Save progress bar for large graphs
- [ ] Retry logic for failed saves

## Code References

**Files Modified:**
- `pages/api/trips/[id].ts` - Added PATCH handler
- `pages/canvas.tsx` - Added auto-save logic and status indicator
- `lib/graph-commands.ts` - Graph manipulation functions
- `components/ChatWidget.tsx` - Chatbot integration

**Key Functions:**
- `saveTripData()` - Saves to database via PATCH request
- `debouncedSave()` - Debounces save operations
- `handlePatch()` - Server-side save handler
