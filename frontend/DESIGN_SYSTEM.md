# 🎨 NUCareer Design System

## Color Palette

### Primary Gradient
```
Start: #667eea (Indigo)
Mid:   #764ba2 (Purple)
End:   Varies by element
```

### Semantic Colors
```
Success: #10b981 (Emerald)
Warning: #f59e0b (Amber)
Error:   #ef4444 (Red)
Info:    #3b82f6 (Blue)
```

### Neutral Colors
```
Slate 50:   #f8fafc (Near white)
Slate 100:  #f1f5f9 (Light gray)
Slate 200:  #e2e8f0 (Gray)
Slate 600:  #475569 (Dark gray)
Slate 700:  #334155 (Darker gray)
Slate 800:  #1e293b (Very dark)
Slate 900:  #0f172a (Almost black)
```

### Background Colors
```
Primary:   linear-gradient(135deg, #667eea, #764ba2)
Secondary: linear-gradient(to br, rgba(255,255,255,0.95), rgba(248,250,252,0.95))
Light:     #f8fafc
Dark:      #0f172a
```

---

## Typography

### Font Stack
```css
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
```

### Font Sizes
```
H1: 2.25rem (36px) - font-bold
H2: 1.875rem (30px) - font-bold
H3: 1.5rem (24px) - font-bold
H4: 1.25rem (20px) - font-semibold
Body: 1rem (16px) - Regular
Small: 0.875rem (14px) - Regular
Micro: 0.75rem (12px) - Regular
```

### Font Weights
```
Regular: 400
Medium: 500
Semibold: 600
Bold: 700
```

### Line Heights
```
Tight: 1.25 (Headings)
Normal: 1.5 (Body text)
Relaxed: 1.75 (Large text)
Loose: 2 (Extra spacing)
```

---

## Spacing System

### Padding/Margin Units (in px)
```
xs:  4px  (0.25rem)
sm:  8px  (0.5rem)
md:  12px (0.75rem)
lg:  16px (1rem)
xl:  24px (1.5rem)
2xl: 32px (2rem)
3xl: 48px (3rem)
```

### Common Spacing
```
Card padding: 24-32px (1.5rem-2rem)
Section margin: 48px-64px (3rem-4rem)
Text margins: 12-16px (0.75rem-1rem)
Gap between items: 16-24px (1rem-1.5rem)
```

---

## Border Radius

```
sm:  0.375rem (6px) - Small icons
md:  0.5rem (8px) - Input fields
lg:  1rem (16px) - Cards, buttons
xl:  1.5rem (24px) - Large cards
2xl: 2rem (32px) - Modals, major components
full: 50% - Circles, badges
```

---

## Shadows (Elevation)

```
No shadow:     box-shadow: none;
Light:         box-shadow: 0 1px 2px 0 rgba(0,0,0,0.05);
Medium:        box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
Large:         box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
Extra Large:   box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
Premium:       box-shadow: 0 0 40px rgba(102,126,234,0.15);
```

### Elevation Levels
```
Floating:   Large shadow (chat widget)
Card:       Medium shadow (content cards)
Button:     Light shadow with hover enhancement
Modal:      Extra large shadow
Glow:       Color-tinted shadow for emphasis
```

---

## Component Styles

### Buttons
```
Primary Button:
- Background: Gradient (Indigo → Purple)
- Text: White
- Padding: 12px 24px
- Border radius: 8px
- Shadow: 0 4px 15px rgba(102,126,234,0.4)
- Hover: translateY(-2px), enhanced shadow
- Disabled: Opacity 50%

Secondary Button:
- Background: Transparent / Light
- Border: 2px
- Text: Indigo
- Hover: Background tint

Tertiary Button:
- Text only
- Hover: Color change
- Underline on hover (optional)
```

### Cards
```
Default Card:
- Background: White with glass effect
- Border: 1px solid rgba(99,102,241,0.2)
- Border radius: 16px
- Padding: 24px
- Shadow: Medium
- Backdrop filter: blur(10px)

Hover State:
- Shadow: Enhanced
- Border: rgba(99,102,241,0.3)
- Transform: translateY(-8px)
- Transition: 0.3s ease
```

### Input Fields
```
Base State:
- Border: 2px solid #e5e7eb
- Border radius: 8px
- Padding: 12px 16px
- Background: White
- Text color: #334155
- Placeholder: #cbd5e1

Focus State:
- Border color: #667eea
- Ring: 2px rgba(102,126,234,0.2)
- Transition: 0.2s ease

Error State:
- Border color: #ef4444
- Ring: 2px rgba(239,68,68,0.2)
```

### Badges
```
Success: Green background, green text
Warning: Amber background, amber text
Error:   Red background, red text
Info:    Blue background, blue text
Default: Indigo background, indigo text

Padding: 4px 12px
Border radius: 4px
Font size: 12px
Font weight: Semibold
```

---

## Layout Patterns

### Container Sizes
```
Small:    max-width: 32rem (512px)
Medium:   max-width: 48rem (768px)
Large:    max-width: 64rem (1024px)
XL:       max-width: 80rem (1280px)
Full:     max-width: 100%
```

### Grid Systems
```
Mobile (< 768px):
- 1 column for most content
- 2 columns for side-by-side

Tablet (768px - 1024px):
- 2 columns default
- 3 columns for cards

Desktop (> 1024px):
- 3-4 columns default
- 6 columns for dense layouts
```

### Spacing Rules
```
Horizontal padding: 16-32px
Vertical padding: 24-48px
Between sections: 48-64px
Between cards: 16-24px
Within card: 12-16px
```

---

## State Indicators

### Loading
- Animated dots (3 dots bouncing)
- Spinner animation (rotating)
- Skeleton screens (shimmer effect)
- Progress bars (animated fill)

### Success
- Green checkmark (✓)
- Success badge
- Confirmation message
- Toast notification

### Error
- Red exclamation (!)
- Error badge
- Error message
- Toast notification

### Disabled
- Opacity: 50%
- Cursor: not-allowed
- Color: Gray-400
- No hover effects

---

## Gradient Usage

### Primary Gradient
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```
Used on: Buttons, headers, main backgrounds

### Text Gradient
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;
background-clip: text;
```
Used on: Page titles, headers

### Subtle Gradient
```css
background: linear-gradient(to br, rgba(255,255,255,0.95), rgba(248,250,252,0.95));
```
Used on: Card backgrounds

### Directional Gradients
- 135deg (↗): Most common
- to right: Horizontal
- to bottom: Vertical
- to br: Bottom-right (diagonal)

---

## Responsive Breakpoints

```
Mobile:  < 640px
Tablet:  640px - 1024px
Desktop: > 1024px

Common widths:
- sm: 640px
- md: 768px
- lg: 1024px
- xl: 1280px
- 2xl: 1536px
```

### Mobile First Strategy
```
Base: Mobile styles
@md: 768px and up (tablets)
@lg: 1024px and up (desktops)
@xl: 1280px and up (large desktops)
```

---

## Accessibility

### Color Contrast
```
AAA (Recommended):
- Large text (18.66px+): 4.5:1 ratio
- Normal text: 7:1 ratio
- UI components: 4.5:1 ratio
```

### Focus States
```
Visible focus outline: 2px solid with 4px offset
Color: Indigo (#667eea)
High contrast for visibility
```

### Font Sizes
```
Minimum readable: 14px (12px for small text)
Headings: 1.25x-2.25x larger than body
Line spacing: 1.5x minimum
```

---

## Animation Timing

### Durations
```
Quick interactions:  200ms
Standard fade/slide: 300ms
Page transitions:    600ms
Loading loops:       2000ms
```

### Easing Functions
```
Quick reactions:     ease-out
Natural movement:    cubic-bezier(0.34, 1.56, 0.64, 1)
Page loads:          ease-out
Continuous loops:    ease-in-out
```

---

## Icon System

### Icon Sizes
```
Small:   16px
Medium:  24px
Large:   32px
XL:      48px
2XL:     64px
```

### Icon Usage
- Navigation: 24px
- Buttons: 16-24px
- Cards: 32-48px
- Large displays: 48-64px

### Icon Colors
```
Primary:   #667eea
Secondary: #764ba2
Success:   #10b981
Warning:   #f59e0b
Error:     #ef4444
Default:   #475569 (gray)
Disabled:  #cbd5e1 (light gray)
```

---

## Breakpoint Utilities

```
hidden:        Display none by default
md:hidden:     Hide on tablet and above
lg:hidden:     Hide on desktop and above

md:block:      Show only on tablet and above
lg:grid:       Grid only on desktop and above

md:col-span-2: Take 2 cols on tablet
lg:col-span-3: Take 3 cols on desktop
```

---

## Implementation Checklist

- ✅ Color palette applied
- ✅ Typography hierarchy established
- ✅ Spacing system consistent
- ✅ Border radius standardized
- ✅ Shadow system applied
- ✅ Responsive breakpoints set
- ✅ Hover states defined
- ✅ Focus states visible
- ✅ Loading states designed
- ✅ Error states handled
- ✅ Animations smooth
- ✅ Accessibility standards met

---

**Design System Version**: 1.0
**Last Updated**: November 15, 2025
**Framework**: Tailwind CSS + Custom CSS
**Status**: ✅ Active & Complete
