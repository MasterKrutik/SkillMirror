# 🎬 Animation & Interactive Effects Guide

## Overview
This document details all the custom animations and interactive effects added to the NUCareer portal.

---

## 🎨 CSS Animations

### 1. **fadeInUp** - Fade In + Slide Up
```css
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```
**Duration**: 0.6s
**Timing**: ease-out
**Used on**: Cards, buttons, sections on initial load
**Effect**: Elements smoothly fade in while moving upward

---

### 2. **slideInLeft** - Slide In From Left
```css
@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
```
**Duration**: 0.6s
**Timing**: ease-out
**Used on**: Left-aligned cards, form sections
**Effect**: Elements slide in from left side

---

### 3. **slideInRight** - Slide In From Right
```css
@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
```
**Duration**: 0.6s
**Timing**: ease-out
**Used on**: Right-aligned content, chatbot, sidebars
**Effect**: Elements slide in from right side

---

### 4. **pulse-glow** - Glowing Pulse Effect
```css
@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 0 20px rgba(99, 102, 241, 0.3);
  }
  50% {
    box-shadow: 0 0 30px rgba(99, 102, 241, 0.6);
  }
}
```
**Duration**: 2s
**Iteration**: Infinite
**Used on**: Important buttons, chatbot widget
**Effect**: Subtle glowing pulse that draws attention

---

### 5. **bounce-subtle** - Subtle Bounce
```css
@keyframes bounce-subtle {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}
```
**Duration**: 2s
**Timing**: ease-in-out
**Iteration**: Infinite
**Used on**: Chat widget button, call-to-action elements
**Effect**: Gentle up-and-down bobbing motion

---

### 6. **gradientShift** - Animated Gradient
```css
@keyframes gradientShift {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}
```
**Duration**: 3s-6s
**Iteration**: Infinite
**Used on**: Background gradients
**Effect**: Gradient colors shift smoothly

---

## 🎯 Hover Effects

### **Card Hover Effects**
```css
.card-gradient {
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-8px);        /* Lift up */
    box-shadow: 0 20px 40px rgba(...);  /* Enhanced shadow */
    border-color: rgb(99, 102, 241);    /* Highlight border */
  }
}
```

**Effects:**
- ⬆️ Translate Y by -8px (card lifts up)
- 🌟 Shadow enhancement (depth increase)
- 🎨 Border color change (visual highlight)
- ⏱️ Smooth 0.3s transition

### **Button Hover Effects**
```css
.btn-primary {
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
  }
  
  &:active {
    transform: translateY(0);
  }
}
```

**Effects:**
- ⬆️ Subtle lift on hover
- 🌟 Shadow glow on hover
- 🎪 Press down effect on click
- ⏱️ 0.3s smooth transition

### **Link Hover Effects**
```css
.link {
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 0;
    height: 2px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    transition: width 0.3s ease;
  }
  
  &:hover::after {
    width: 100%;
  }
}
```

**Effects:**
- 📏 Sliding underline from left to right
- 🎨 Gradient underline color
- ⏱️ 0.3s smooth animation

---

## 🌀 Loading States

### **Bouncing Dots Animation**
```jsx
<div className='flex gap-2'>
  <div className='w-2 h-2 bg-indigo-500 rounded-full animate-bounce'></div>
  <div className='w-2 h-2 bg-indigo-500 rounded-full animate-bounce' style={{animationDelay: '0.1s'}}></div>
  <div className='w-2 h-2 bg-indigo-500 rounded-full animate-bounce' style={{animationDelay: '0.2s'}}></div>
</div>
```

**Effect**: Three dots bounce up and down with staggered timing
**Used on**: Chat loading, form submission
**Visual**: Shows active processing state

---

## ⏰ Staggered Animations

### **Pattern 1: List Items**
```jsx
{items.map((item, idx) => (
  <div 
    key={idx}
    className='animate-slideInLeft'
    style={{animationDelay: `${idx * 0.1}s`}}
  >
    {item}
  </div>
))}
```

**Delay**: Each item delays by 0.1s more
**Effect**: Wave-like animation across list
**Used on**: Cards, gallery items, mentor cards

### **Pattern 2: Staggered Fades**
```jsx
{items.map((item, idx) => (
  <div 
    key={idx}
    className='animate-fadeInUp'
    style={{animationDelay: `${idx * 0.05}s`}}
  >
    {item}
  </div>
))}
```

**Delay**: Each item delays by 0.05s
**Effect**: Smoother cascade effect
**Used on**: Quick-reveal items

---

## 🎪 Specific Animation Applications

### **Home Page**
- Header: `animate-fadeInUp` (0s delay)
- Feature cards: `animate-slideInLeft`, `animate-fadeInUp`, `animate-slideInRight` (0s, 0.1s, 0s)
- Chatbot: `animate-fadeInUp` (0.2s delay)
- Quick access buttons: Individual delays from 0s-0.3s

### **Dashboard**
- Title: `animate-fadeInUp`
- Stats cards: `animate-fadeInUp` with 0s-0.3s delays
- Feature cards: `animate-slideInLeft` with 0s-0.2s delays
- Chat widget: `animate-bounce-subtle` + `animate-slideInRight`

### **Community Hub**
- Title: `animate-fadeInUp`
- Tab buttons: Instant (no animation)
- FAQs section: `animate-fadeInUp`
- Polls: `animate-fadeInUp` with delays
- Resume cards: `animate-slideInLeft` with 0.05s increments

### **Interview Page**
- Interview cards: `animate-slideInLeft` with 0.1s delays
- Schedule section: `animate-slideInRight`
- Tips section: `animate-fadeInUp` with 0.1s delays

### **Mock Interview**
- Persona buttons: Instant
- Interview card: `animate-slideInRight`
- Feedback: `animate-fadeInUp`
- Score display: Animated SVG stroke

### **Alumni Dashboard**
- Mentor cards: `animate-slideInLeft` with 0.1s delays
- Success stories: No animation (static card)
- Chat: `animate-slideInLeft`
- Sidebar: `animate-slideInRight`

### **Resume Upload**
- Title: `animate-fadeInUp`
- Upload area: No animation (form)
- Tips sidebar: `animate-slideInRight`
- Results: `animate-fadeInUp`

---

## 🎨 Interactive Effects Details

### **Score Circles (SVG)**
```jsx
<svg className='...' style={{filter: 'drop-shadow(0 0 10px rgba(...))'}}>
  <circle cx='64' cy='64' r='56' fill='none' stroke='#e5e7eb' strokeWidth='4'/>
  <circle 
    cx='64' cy='64' r='56' fill='none' stroke='url(#scoreGradient)' strokeWidth='4'
    strokeDasharray={`${score * 351.86 / 100} 351.86`}
    strokeLinecap='round'
    style={{transition: 'stroke-dasharray 0.5s ease'}}
  />
</svg>
```

**Effect**: Animated circle fill based on score percentage
**Animation**: Smooth 0.5s transition when score changes
**Visual**: Professional progress indicator

### **Progress Bars**
```jsx
<div className='w-full bg-indigo-100 rounded-full h-2 overflow-hidden'>
  <div 
    className='bg-gradient-to-r from-indigo-500 to-purple-500 h-full transition-all duration-500'
    style={{width: `${percentage}%`}}
  ></div>
</div>
```

**Effect**: Smooth width animation
**Duration**: 0.5s transition
**Visual**: Gradient-filled progress bar

---

## 🎯 Timing Guidelines

| Duration | Use Case |
|----------|----------|
| 0.2s | Quick feedback (button press) |
| 0.3s | Hover effects |
| 0.5s | Progress/score updates |
| 0.6s | Page load animations |
| 1s | Element transitions |
| 2s | Infinite subtle animations |
| 3s+ | Looping background effects |

---

## 📊 Performance Tips

1. **Use CSS animations** - Better performance than JS
2. **Limit simultaneous animations** - Stagger with delays
3. **Use `transform` & `opacity`** - GPU accelerated
4. **Avoid expensive properties** - width, height, position
5. **Debounce hover effects** - Prevent animation overflow

---

## ✅ Animation Checklist

- ✨ Load animations on page enter
- 🎬 Hover animations on interactive elements
- ⏱️ Staggered animations for lists
- 🌟 Success/loading animations
- 💫 Smooth transitions (0.2s-0.6s)
- 🎯 Purposeful animations (not distracting)
- ♿ Respect prefers-reduced-motion
- 📱 Smooth on mobile devices

---

## 🚀 Browser Compatibility

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ⚠️ IE 11 (not supported - use polyfills)

---

## 🎨 Customization Guide

To adjust animation timing:
```css
.animate-fadeInUp {
  animation: fadeInUp 0.6s ease-out;
  /* Change 0.6s to desired duration */
}
```

To add delays to staggered items:
```jsx
style={{animationDelay: `${idx * 0.1}s`}}
/* Change 0.1s to desired interval */
```

To modify animation easing:
```css
/* Options: ease, ease-in, ease-out, ease-in-out, linear */
animation: fadeInUp 0.6s ease-out;
```

---

**Created**: November 15, 2025
**Animation Framework**: CSS3 + Tailwind Utilities
**Performance**: GPU Accelerated
**Status**: ✅ Production Ready
