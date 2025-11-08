# Testing Google Maps Integration

## ✅ What Was Fixed

1. **Forced all nodes to use `custom` type** - This ensures the CustomNode component renders (which has the Google Maps button)
2. **Added fallback node types** - Set `default`, `input`, and `output` types to all use CustomNode
3. **Post-processing in API** - The API now ensures all generated nodes have `type: 'custom'`
4. **Post-processing in Canvas** - The canvas also ensures loaded nodes have the correct type
5. **Added debug logging** - Console will show when nodes render and if they have Google Maps links

## 🧪 How to Test

### Test 1: Check Initial Canvas
1. Start the dev server: `npm run dev`
2. Navigate to `/canvas`
3. You should see 3 nodes (Delhi, Taj Mahal, Jaipur) with **"📍 View on Maps"** buttons
4. Click any button - it should open Google Maps in a new tab

### Test 2: Generate New Trip
1. Go to home page and login
2. Click **"New Trip"** button
3. Fill in the form:
   - **From**: Delhi
   - **To**: Goa
   - **Days**: 5
   - **Stops**: Mumbai
4. Click **"Generate Trip"**
5. Wait for the flow to generate
6. Each node should display:
   - Location name (heading)
   - Day number (e.g., "Day 1")
   - **📍 View on Maps** button (clickable)

### Test 3: Check Browser Console
1. Open browser DevTools (F12)
2. Go to Console tab
3. You should see logs like:
   ```
   CustomNode rendered: { label: "Delhi", hasGoogleMapsLink: true, googleMapsLink: "https://..." }
   ```
4. When you click a Maps button:
   ```
   Google Maps link clicked: https://www.google.com/maps/search/?api=1&query=...
   ```

## 🔍 Troubleshooting

### If buttons don't appear:

1. **Check console for node data**:
   - Look for `CustomNode rendered:` logs
   - Verify `hasGoogleMapsLink: true`
   - Check if `googleMapsLink` has a valid URL

2. **Verify node structure**:
   ```javascript
   {
     type: "custom",  // Must be "custom"
     data: {
       label: "Location Name",
       googleMapsLink: "https://www.google.com/maps/...",  // Must exist
       day: 1
     }
   }
   ```

3. **Check API response**:
   - Open Network tab in DevTools
   - Find `/api/generate-travel-flow` request
   - Check response JSON - all nodes should have `googleMapsLink`

4. **Clear cache and rebuild**:
   ```bash
   npm run build
   npm run dev
   ```

## 📋 Expected Behavior

### Node Appearance:
```
┌─────────────────────────┐
│   Delhi Departure       │
│   Day 1                 │
│  ┌──────────────────┐   │
│  │ 📍 View on Maps  │   │
│  └──────────────────┘   │
└─────────────────────────┘
```

### On Click:
- Opens new browser tab
- Shows location on Google Maps
- Can view directions, reviews, photos
- Can explore nearby places

## 🎯 Success Criteria

✅ All nodes use CustomNode component  
✅ All nodes display location name and day  
✅ All nodes show "📍 View on Maps" button  
✅ Clicking button opens Google Maps  
✅ Maps shows correct location  
✅ Links work on both desktop and mobile  

## 🐛 Common Issues

### Issue: Nodes look plain (white background, no purple gradient)
**Solution**: Nodes aren't using CustomNode. Check that `type: "custom"` is set.

### Issue: No Maps button visible
**Solution**: Node data doesn't have `googleMapsLink`. Check API response.

### Issue: Button appears but link doesn't work
**Solution**: URL might be malformed. Check console for the actual URL.

### Issue: Old data cached
**Solution**: Hard refresh (Ctrl+Shift+R) or clear browser cache.
