# Waveform Configuration Guide

Complete guide to customizing waveform appearance, types, and positioning in Audiogram.

## 🎨 Overview

Audiogram provides comprehensive waveform configuration including:

- **5 Waveform Types**: Bars, Line, Area, Dots, Wave
- **Color Customization**: Primary, secondary, and background colors
- **Advanced Settings**: Spacing, line width, dot size, smoothing
- **Positioning Control**: X/Y position, width, height
- **Real-time Preview**: See changes immediately

## 🚀 Getting Started

### Accessing Waveform Controls

1. **Select "Auto-Generate" mode** for timed captions
2. **Waveform Configuration appears** automatically
3. **Two tabs available**:
   - **Position**: Control placement and size
   - **Style**: Choose type, colors, and advanced settings

## 📍 Waveform Positioning

### Position Controls

```
Position Tab
┌─────────────────────────────────────┐
│ X Position: [████████████] 50%      │
│ Y Position: [████████████] 50%      │
│ Width: [████████████] 80%           │
│ Height: [████████████] 20%          │
└─────────────────────────────────────┘
```

**X Position**: 0% = Left edge, 100% = Right edge
**Y Position**: 0% = Top edge, 100% = Bottom edge
**Width**: 20% - 100% of screen width
**Height**: 10% - 50% of screen height

### Positioning Examples

**Top Center (News Style)**:
- X: 50%, Y: 20%
- Width: 80%, Height: 15%

**Center (Music Video)**:
- X: 50%, Y: 50%
- Width: 60%, Height: 30%

**Bottom (Podcast)**:
- X: 50%, Y: 80%
- Width: 80%, Height: 20%

**Left Side (Minimal)**:
- X: 25%, Y: 50%
- Width: 30%, Height: 40%

## 🎨 Waveform Types

### 1. Bars (Default)

**Description**: Traditional vertical bars representing audio levels
**Best For**: Most content types, podcasts, interviews
**Customizable**: Bar spacing

```
Bars Waveform
┌─────────────────────────────────────┐
│ ▁▂▃▅▆▇█▇▆▅▃▂▁▂▃▅▆▇█▇▆▅▃▂▁▂▃▅▆▇█▇▆▅▃▂▁ │
└─────────────────────────────────────┘
```

**Settings**:
- **Bar Spacing**: 0-10px (space between bars)
- **Color**: Primary color for bars

### 2. Line

**Description**: Continuous line connecting audio data points
**Best For**: Smooth, flowing visualizations
**Customizable**: Line width

```
Line Waveform
┌─────────────────────────────────────┐
│     ╱╲    ╱╲  ╱╲    ╱╲  ╱╲    ╱╲    │
│    ╱  ╲  ╱  ╲╱  ╲  ╱  ╲╱  ╲  ╱  ╲   │
│   ╱    ╲╱    ╲    ╲╱    ╲    ╲╱    ╲  │
└─────────────────────────────────────┘
```

**Settings**:
- **Line Width**: 1-10px (thickness of line)
- **Color**: Primary color for line

### 3. Area

**Description**: Filled area under the waveform with top line
**Best For**: Visual impact, music videos
**Customizable**: Fill color, line color

```
Area Waveform
┌─────────────────────────────────────┐
│     ╱╲    ╱╲  ╱╲    ╱╲  ╱╲    ╱╲    │
│    ╱  ╲  ╱  ╲╱  ╲  ╱  ╲╱  ╲  ╱  ╲   │
│   ╱    ╲╱    ╲    ╲╱    ╲    ╲╱    ╲  │
│  ╱██████████████████████████████████╲ │
└─────────────────────────────────────┘
```

**Settings**:
- **Primary Color**: Fill color
- **Secondary Color**: Top line color

### 4. Dots

**Description**: Individual dots at audio data points
**Best For**: Minimal, clean designs
**Customizable**: Dot size

```
Dots Waveform
┌─────────────────────────────────────┐
│   •   •   • •   •   • •   •   • •   │
│  •   •   •   •   •   •   •   •   •  │
│ •   •   •   •   •   •   •   •   •   │
└─────────────────────────────────────┘
```

**Settings**:
- **Dot Size**: 1-20px (size of each dot)
- **Color**: Primary color for dots

### 5. Wave

**Description**: Sine wave influenced by audio data
**Best For**: Music content, dynamic effects
**Customizable**: Line width, smoothing

```
Wave Waveform
┌─────────────────────────────────────┐
│  ╱╲  ╱╲    ╱╲  ╱╲    ╱╲  ╱╲    ╱╲   │
│ ╱  ╲╱  ╲  ╱  ╲╱  ╲  ╱  ╲╱  ╲  ╱  ╲  │
│╱    ╲    ╲╱    ╲    ╲╱    ╲    ╲╱   │
└─────────────────────────────────────┘
```

**Settings**:
- **Line Width**: 1-10px (thickness of wave lines)
- **Smoothing**: 0-100% (reduces noise)

## 🎨 Color Customization

### Color Controls

```
Colors
┌─────────────────────────────────────┐
│ Primary Color: [■] #ffffff          │
│ Secondary Color: [■] #cccccc        │
│ Background: [■] #000000 0%          │
└─────────────────────────────────────┘
```

**Primary Color**: Main waveform color
**Secondary Color**: Used for area waveforms (top line)
**Background**: Optional background with opacity

### Color Examples

**Classic White**:
- Primary: #ffffff
- Secondary: #cccccc
- Background: #000000 20%

**Brand Colors**:
- Primary: #007bff (blue)
- Secondary: #0056b3 (darker blue)
- Background: #f8f9fa 10%

**High Contrast**:
- Primary: #00ff00 (green)
- Secondary: #00cc00 (darker green)
- Background: #000000 30%

## ⚙️ Advanced Settings

### Advanced Controls

```
Advanced
┌─────────────────────────────────────┐
│ Bar Spacing: [████████████] 1px     │
│ Line Width: [████████████] 2px      │
│ Dot Size: [████████████] 3px        │
│ Smoothing: [████████████] 0%        │
└─────────────────────────────────────┘
```

**Bar Spacing**: Space between bars (0-10px)
**Line Width**: Thickness of lines (1-10px)
**Dot Size**: Size of dots (1-20px)
**Smoothing**: Reduces noise in waveform (0-100%)

### Smoothing Effect

Smoothing reduces noise and creates smoother waveforms:

- **0%**: Raw audio data (most detailed)
- **25%**: Light smoothing
- **50%**: Moderate smoothing
- **75%**: Heavy smoothing
- **100%**: Maximum smoothing (least detailed)

## 🎯 Use Cases & Examples

### Podcast Interview

**Configuration**:
- Type: Bars
- Position: X: 50%, Y: 80%, Width: 80%, Height: 20%
- Color: White (#ffffff)
- Spacing: 1px
- Smoothing: 10%

**Result**: Clean, professional bars at bottom

### Music Video

**Configuration**:
- Type: Wave
- Position: X: 50%, Y: 50%, Width: 60%, Height: 30%
- Color: Brand color (#ff6b6b)
- Line Width: 3px
- Smoothing: 30%

**Result**: Dynamic, flowing waves in center

### News Broadcast

**Configuration**:
- Type: Area
- Position: X: 50%, Y: 20%, Width: 80%, Height: 15%
- Primary: White (#ffffff)
- Secondary: Light gray (#cccccc)
- Background: Black 20%

**Result**: Professional area chart at top

### Educational Content

**Configuration**:
- Type: Line
- Position: X: 50%, Y: 40%, Width: 70%, Height: 25%
- Color: Blue (#1976d2)
- Line Width: 2px
- Smoothing: 15%

**Result**: Clean line visualization

### Minimal Design

**Configuration**:
- Type: Dots
- Position: X: 25%, Y: 50%, Width: 30%, Height: 40%
- Color: Gray (#666666)
- Dot Size: 2px
- Smoothing: 0%

**Result**: Subtle dot visualization

## 🔧 Technical Details

### Waveform Configuration Data

```javascript
{
  waveformConfig: {
    type: "bars",               // bars, line, area, dots, wave
    color: "#ffffff",           // Primary color
    colorSecondary: "#cccccc",  // Secondary color (for area)
    backgroundColor: "#000000", // Background color
    backgroundOpacity: 0,       // Background opacity (0-100%)
    spacing: 1,                 // Bar spacing (0-10px)
    lineWidth: 2,               // Line width (1-10px)
    dotSize: 3,                 // Dot size (1-20px)
    smoothing: 0                // Smoothing (0-100%)
  }
}
```

### Rendering Process

1. **Apply smoothing** if enabled
2. **Draw background** if opacity > 0
3. **Select waveform type** and render accordingly
4. **Apply colors** and styling
5. **Position** according to positioning settings

### Performance Considerations

**Smoothing**: Higher smoothing values require more processing
**Complex Types**: Wave type is more computationally intensive
**Large Waveforms**: Higher resolution waveforms use more memory

## 💡 Best Practices

### Type Selection

**Bars**: Best for most content, clear audio representation
**Line**: Good for smooth, flowing visualizations
**Area**: Great for visual impact and music content
**Dots**: Perfect for minimal, clean designs
**Wave**: Ideal for music and dynamic content

### Color Choices

**High Contrast**: Use contrasting colors for visibility
**Brand Consistency**: Match your brand colors
**Accessibility**: Ensure sufficient contrast ratios
**Background**: Use subtle backgrounds to avoid distraction

### Positioning

**Avoid Edges**: Keep 10% margin from screen edges
**Consider Content**: Don't cover important visual elements
**Balance**: Maintain visual balance with captions
**Consistency**: Use consistent positioning across videos

### Performance

**Smoothing**: Use moderate smoothing (10-30%) for best results
**Size**: Larger waveforms use more processing power
**Complexity**: Simpler types (bars, dots) are more efficient

## 🎬 Creative Examples

### Split-Screen Podcast

```
┌─────────────────────────────────────┐
│  [Waveform at top - Area style]     │
│                                     │
│                                     │
│  Host: Hello and welcome    Guest: Thanks for having me │
│  ┌─────────────────────┐   ┌─────────────────────┐     │
│  │                     │   │                     │     │
│  │                     │   │                     │     │
│  └─────────────────────┘   └─────────────────────┘     │
└─────────────────────────────────────┘
```

### Music Video

```
┌─────────────────────────────────────┐
│                                     │
│  [Dynamic Wave waves in center]     │
│                                     │
│                                     │
│  Artist: Song lyrics here           │
│  ┌─────────────────────────────────┐ │
│  │                                 │ │
│  └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### News Style

```
┌─────────────────────────────────────┐
│  [Area waveform at top]             │
│                                     │
│                                     │
│                                     │
│                                     │
│  Reporter: Breaking news tonight    │
│  ┌─────────────────────────────────┐ │
│  │                                 │ │
│  └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

## 🔄 Workflow

### Step-by-Step Configuration

1. **Upload audio** and select "Auto-Generate"
2. **Switch to "Position" tab** for placement
3. **Adjust X/Y position** and size
4. **Switch to "Style" tab** for appearance
5. **Choose waveform type** from dropdown
6. **Set colors** (primary, secondary, background)
7. **Adjust advanced settings** as needed
8. **Preview changes** in real-time
9. **Generate final video**

### Saving and Reusing

- **Configuration is saved** with each project
- **Export settings** for reuse across projects
- **Theme integration** maintains consistency
- **Preset creation** for common configurations

## 🐛 Troubleshooting

### Common Issues

**Waveform not appearing**:
- Check position values (0-100%)
- Verify width/height are within limits
- Ensure audio file is loaded

**Colors not applying**:
- Check color picker values
- Verify background opacity > 0% if using background
- Ensure sufficient contrast

**Performance issues**:
- Reduce smoothing percentage
- Use simpler waveform types
- Decrease waveform size

### Performance Tips

**Large projects**:
- Use moderate smoothing (10-30%)
- Choose efficient types (bars, dots)
- Optimize waveform size

**Real-time preview**:
- Changes update immediately
- No need to regenerate for preview
- Final render uses exact settings

## 📚 Related Documentation

- **CAPTION-FORMATTING-GUIDE.md** - Caption formatting
- **AUTO-CAPTIONS.md** - Auto-caption generation
- **SPEAKER-RECOGNITION-GUIDE.md** - Speaker identification
- **THEMES.md** - Theme system overview

## ✨ Summary

Waveform configuration provides:

- ✅ **5 different waveform types**
- ✅ **Complete color customization**
- ✅ **Advanced styling options**
- ✅ **Flexible positioning**
- ✅ **Real-time preview**
- ✅ **Professional results**

**Perfect for creating unique, branded video content!** 🎉
