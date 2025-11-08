# Google Maps Integration

## Overview

Each node in the travel flow diagram now includes a Google Maps link that allows users to view the exact location on Google Maps with a single click.

## How It Works

### 1. Data Structure

Each node contains:
```typescript
{
  label: "Taj Mahal, Agra",
  day: 2,
  googleMapsLink: "https://www.google.com/maps/search/?api=1&query=Taj+Mahal+Agra",
  coordinates: {
    lat: 27.1751,
    lng: 78.0421
  },
  // ... other properties
}
```

### 2. Google Maps URL Format

The system uses Google Maps Search API URL format:
```
https://www.google.com/maps/search/?api=1&query=PLACE_NAME
```

**Example URLs:**
- Delhi: `https://www.google.com/maps/search/?api=1&query=Delhi+India`
- Taj Mahal: `https://www.google.com/maps/search/?api=1&query=Taj+Mahal+Agra`
- Goa Beach: `https://www.google.com/maps/search/?api=1&query=Goa+Beach+India`

### 3. Visual Presentation

Each node displays:
- **Location name** (main heading)
- **Day number** (e.g., "Day 2")
- **📍 View on Maps** button (clickable link with map pin emoji)

### 4. User Interaction

When users click the "📍 View on Maps" button:
1. Opens Google Maps in a new browser tab
2. Searches for the specific location
3. Shows the location on the map with nearby places and directions

### 5. Benefits

- **Quick Navigation**: One click to see location on map
- **Trip Planning**: Users can explore nearby areas
- **Directions**: Easy access to driving/walking directions
- **Reviews**: See reviews and photos from Google Maps
- **Nearby Places**: Discover restaurants, hotels, attractions nearby

## Implementation Details

### Schema (API)
```typescript
const NodeSchema = z.object({
  // ... other fields
  data: z.object({
    googleMapsLink: z.string().optional(),
    coordinates: z.object({
      lat: z.number(),
      lng: z.number()
    }).optional()
  })
});
```

### Custom Node Component (Canvas)
```typescript
{data.googleMapsLink && (
  <a
    href={data.googleMapsLink}
    target="_blank"
    rel="noopener noreferrer"
    style={{
      display: "inline-flex",
      alignItems: "center",
      fontSize: "11px",
      color: "#fff",
      background: "rgba(255, 255, 255, 0.2)",
      padding: "4px 8px",
      borderRadius: "4px",
    }}
  >
    📍 View on Maps
  </a>
)}
```

### LLM Prompt Instructions
The AI is instructed to:
- Generate proper Google Maps URLs for each location
- URL-encode location names
- Provide approximate GPS coordinates
- Use real place names from Tavily search results

## Future Enhancements

Potential improvements:
1. **Embedded Maps**: Show mini map preview in node tooltip
2. **Route Planning**: Generate route between all locations
3. **Distance Calculator**: Show distance and time between stops
4. **Save to Google Maps**: Allow saving entire trip to Google Maps
5. **Street View**: Quick access to Street View for locations
