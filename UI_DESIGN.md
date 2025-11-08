# UI Design - Black & White Wireframe Style

## 🎨 Design System

### Color Palette
- **Background**: `#fafafa` (light gray)
- **Node Background**: `#ffffff` (white)
- **Text**: `#000000` (black)
- **Borders**: `#000000` (black, 1.5px)
- **Secondary Text**: `#666666` (gray)
- **Grid**: `#e0e0e0` (light gray)

### Typography
- **Font Family**: `-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`
- **Node Title**: 14px, weight 600
- **Day Label**: 11px, weight 400, color #666
- **Button Text**: 11px, weight 500

## 📦 Component Styles

### Node Component
```
┌──────────────────────┐
│   Location Name      │ ← 14px, bold, black
│   Day 1              │ ← 11px, gray
│  ┌────────────────┐  │
│  │ 📍 View on Maps│  │ ← Button with border
│  └────────────────┘  │
└──────────────────────┘
```

**Properties:**
- White background (#fff)
- Black border (1.5px solid)
- Minimal padding (14px 18px)
- Small border radius (4px)
- No shadows
- Clean typography

### Button (View on Maps)
- **Default State**: White bg, black text, black border
- **Hover State**: Black bg, white text (inverted)
- Smooth transition (0.2s)

### Edges (Connection Lines)
- Black color (#000)
- 1.5px stroke width
- Smooth step style
- No animation
- Labels with white background

### Background
- Light gray (#fafafa)
- Subtle grid dots (#e0e0e0)
- 16px grid spacing
- Minimal visual noise

### MiniMap
- White nodes with black borders
- Light mask color
- Matches main canvas style

## 🎯 Design Philosophy

### Minimalism
- No gradients
- No shadows
- No unnecessary decorations
- Focus on content

### Clarity
- High contrast (black on white)
- Clear hierarchy
- Readable typography
- Clean spacing

### Professionalism
- Wireframe aesthetic
- Blueprint-like appearance
- Technical documentation feel
- Modern and clean

## 📱 Responsive Behavior

- Nodes scale naturally
- Text remains readable at all sizes
- Borders maintain consistency
- Buttons stay accessible

## ♿ Accessibility

- **High Contrast**: Black text on white background (WCAG AAA)
- **Clear Focus**: Visible button states
- **Readable Text**: Minimum 11px font size
- **Touch Targets**: Adequate button padding

## 🔄 Interactive States

### Node Hover
- No change (keeps wireframe clean)

### Button Hover
- Inverts colors (black bg, white text)
- Visual feedback without being distracting

### Selected Node
- Uses ReactFlow default selection
- Blue outline (from ReactFlow)

## 🎨 Visual Hierarchy

1. **Location Name** - Most prominent (bold, 14px)
2. **Day Number** - Secondary (gray, 11px)
3. **Maps Button** - Action item (bordered button)
4. **Edges** - Connections (thin black lines)
5. **Background** - Subtle context (light gray)

## 💡 Benefits of This Style

✅ **Clean & Professional** - Wireframe look is modern and technical  
✅ **Print-Friendly** - Works well in black & white  
✅ **High Contrast** - Easy to read and scan  
✅ **Minimalist** - No visual clutter  
✅ **Scalable** - Looks good at any zoom level  
✅ **Accessible** - WCAG compliant contrast ratios  
✅ **Timeless** - Won't look dated  

## 🎬 Before vs After

### Before (Purple Gradient)
- Colorful purple gradient background
- White text
- Drop shadows
- Animated edges
- Modern but busy

### After (Black & White Wireframe)
- Pure white background
- Black text and borders
- No shadows
- Static clean edges
- Technical and minimal

## 🔧 Customization Options

To adjust the style, modify these values in `canvas.tsx`:

```typescript
// Node border thickness
border: "1.5px solid #000"  // Change 1.5px

// Background color
background: "#fafafa"  // Change to your preference

// Text colors
color: "#000"  // Main text
color: "#666"  // Secondary text

// Grid spacing
gap={16}  // Change grid density
```
