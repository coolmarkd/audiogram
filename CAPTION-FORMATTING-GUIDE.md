# Caption Formatting Guide

Complete guide to customizing caption appearance, positioning, and waveform layout in Audiogram.

## 🎨 Overview

Audiogram now provides comprehensive formatting controls for:

- **Caption Positioning**: Move captions anywhere on screen
- **Font Customization**: Size, color, and background styling
- **Per-Speaker Styling**: Different formatting for each speaker
- **Waveform Positioning**: Reposition and resize the audio waveform
- **Theme Integration**: Works with existing theme system

## 🚀 Getting Started

### Accessing Formatting Controls

1. **Select "Auto-Generate" mode** for timed captions
2. **Formatting controls appear** automatically
3. **Two tabs available**:
   - **Global**: Apply formatting to all captions
   - **Per Speaker**: Customize each speaker individually

### Waveform Positioning

- **Separate controls** for waveform positioning
- **Independent** of caption formatting
- **Real-time preview** of changes

## 📍 Caption Positioning

### Global Positioning

Control where all captions appear on screen:

```
Position Controls
┌─────────────────────────────────────┐
│ X Position: [████████████] 50%      │
│ Y Position: [████████████] 85%      │
└─────────────────────────────────────┘
```

**X Position**: 0% = Left edge, 100% = Right edge
**Y Position**: 0% = Top edge, 100% = Bottom edge

### Per-Speaker Positioning

Each speaker can have different positions:

```
Host Formatting
┌─────────────────────────────────────┐
│ Position                            │
│ X Position: [████████████] 30%      │
│ Y Position: [████████████] 80%      │
│                                     │
│ Font                                │
│ Size: [████████████] 36px           │
│ Color: [■] #4CAF50                  │
└─────────────────────────────────────┘

Guest Formatting  
┌─────────────────────────────────────┐
│ Position                            │
│ X Position: [████████████] 70%      │
│ Y Position: [████████████] 80%      │
│                                     │
│ Font                                │
│ Size: [████████████] 36px           │
│ Color: [■] #2196F3                  │
└─────────────────────────────────────┘
```

## 🎨 Font Customization

### Global Font Settings

```
Font Controls
┌─────────────────────────────────────┐
│ Size: [████████████] 42px           │
│ Color: [■] #ffffff                  │
│ Background: [■] #000000 70%         │
└─────────────────────────────────────┘
```

**Font Size**: 12px - 72px
**Text Color**: Any hex color
**Background**: Color + opacity (0-100%)

### Per-Speaker Font Settings

Each speaker can have:
- **Different font sizes**
- **Unique colors**
- **Custom backgrounds**
- **Individual positioning**

## 🌊 Waveform Configuration

### Waveform Controls

The waveform configuration is split into two tabs:

**Position Tab:**
```
Waveform Position
┌─────────────────────────────────────┐
│ X Position: [████████████] 50%      │
│ Y Position: [████████████] 50%      │
│ Width: [████████████] 80%           │
│ Height: [████████████] 20%          │
└─────────────────────────────────────┘
```

**Style Tab:**
```
Waveform Type
┌─────────────────────────────────────┐
│ Style: [Bars ▼]                     │
└─────────────────────────────────────┘

Colors
┌─────────────────────────────────────┐
│ Primary Color: [■] #ffffff          │
│ Secondary Color: [■] #cccccc        │
│ Background: [■] #000000 0%          │
└─────────────────────────────────────┘

Advanced
┌─────────────────────────────────────┐
│ Bar Spacing: [████████████] 1px     │
│ Line Width: [████████████] 2px      │
│ Dot Size: [████████████] 3px        │
│ Smoothing: [████████████] 0%        │
└─────────────────────────────────────┘
```

### Waveform Types

**Bars**: Traditional vertical bars (default)
- Adjustable spacing between bars
- Good for most content types

**Line**: Continuous line connecting data points
- Adjustable line width
- Smooth, flowing appearance

**Area**: Filled area under the waveform
- Primary color for fill
- Secondary color for top line
- Great for visual impact

**Dots**: Individual dots at data points
- Adjustable dot size
- Minimal, clean look

**Wave**: Sine wave influenced by audio data
- Multiple overlapping waves
- Dynamic, flowing effect
- Perfect for music content

### Waveform Colors

**Primary Color**: Main waveform color
**Secondary Color**: Used for area waveforms (top line)
**Background**: Optional background with opacity control

### Advanced Settings

**Bar Spacing**: Space between bars (0-10px)
**Line Width**: Thickness of lines (1-10px)
**Dot Size**: Size of dots (1-20px)
**Smoothing**: Reduces noise in waveform (0-100%)

### Waveform Examples

**News Style (Top)**:
- Position: X: 50%, Y: 20%, Width: 80%, Height: 15%
- Type: Bars, Color: White, Background: Black 20%

**Music Video (Center)**:
- Position: X: 50%, Y: 50%, Width: 60%, Height: 30%
- Type: Wave, Color: Brand color, Smoothing: 30%

**Podcast (Bottom)**:
- Position: X: 50%, Y: 80%, Width: 80%, Height: 20%
- Type: Area, Primary: Blue, Secondary: Light blue

**Minimal (Side)**:
- Position: X: 25%, Y: 50%, Width: 30%, Height: 40%
- Type: Dots, Color: Gray, Dot size: 2px

## 🎯 Use Cases & Examples

### Podcast Interview

**Host (Left Side)**:
- Position: X: 30%, Y: 80%
- Color: Green (#4CAF50)
- Size: 36px

**Guest (Right Side)**:
- Position: X: 70%, Y: 80%
- Color: Blue (#2196F3)
- Size: 36px

**Waveform**:
- Position: X: 50%, Y: 30%
- Size: 80% x 15%

### News Broadcast

**All Speakers (Bottom)**:
- Position: X: 50%, Y: 90%
- Color: White (#ffffff)
- Background: Black 80%

**Waveform**:
- Position: X: 50%, Y: 20%
- Size: 90% x 10%

### Educational Content

**Instructor (Center)**:
- Position: X: 50%, Y: 75%
- Color: Dark Blue (#1976D2)
- Size: 40px

**Waveform**:
- Position: X: 50%, Y: 40%
- Size: 70% x 25%

### Music Video

**Lyrics (Bottom)**:
- Position: X: 50%, Y: 85%
- Color: White (#ffffff)
- Background: Black 60%

**Waveform**:
- Position: X: 50%, Y: 60%
- Size: 60% x 30%

## 🔧 Technical Details

### Formatting Data Structure

```javascript
{
  captionFormatting: {
    global: {
      x: 50,                    // X position (0-100%)
      y: 85,                    // Y position (0-100%)
      fontSize: 42,             // Font size (12-72px)
      color: "#ffffff",         // Text color
      backgroundColor: "#000000", // Background color
      backgroundOpacity: 70     // Background opacity (0-100%)
    },
    speakers: {
      "Speaker A": {
        x: 30,                  // Custom X position
        y: 80,                  // Custom Y position
        fontSize: 36,           // Custom font size
        color: "#4CAF50",       // Custom color
        backgroundColor: "#000000",
        backgroundOpacity: 70
      },
      "Speaker B": {
        x: 70,                  // Different position
        y: 80,
        fontSize: 36,
        color: "#2196F3",       // Different color
        backgroundColor: "#000000",
        backgroundOpacity: 70
      }
    }
  },
  waveformPositioning: {
    x: 50,                      // Waveform X position (0-100%)
    y: 50,                      // Waveform Y position (0-100%)
    width: 80,                  // Waveform width (20-100%)
    height: 20                  // Waveform height (10-50%)
  },
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

### Theme Integration

Formatting works alongside existing themes:

- **Theme defaults** provide fallback values
- **Custom formatting** overrides theme settings
- **Speaker colors** from themes are preserved
- **Font families** from themes are maintained

### Rendering Process

1. **Check for custom formatting** per speaker
2. **Fall back to global formatting** if no speaker-specific
3. **Apply theme defaults** for missing values
4. **Render with custom positioning** and styling

## 💡 Best Practices

### Positioning

**Caption Placement**:
- **Bottom 80-90%**: Standard subtitle position
- **Avoid edges**: Keep 10% margin from screen edges
- **Consider content**: Don't cover important visual elements

**Waveform Placement**:
- **Top 20-30%**: News/documentary style
- **Center 40-60%**: Educational content
- **Bottom 70-80%**: Music/entertainment

### Color Choices

**High Contrast**:
- White text on dark backgrounds
- Dark text on light backgrounds
- Avoid similar colors (e.g., gray on gray)

**Accessibility**:
- Use colors with sufficient contrast
- Consider colorblind users
- Test on different displays

### Font Sizing

**Readability**:
- **36-48px**: Good for most content
- **24-32px**: Smaller screens or dense layouts
- **50-60px**: Large displays or accessibility needs

**Consistency**:
- Use same size for all speakers (unless intentional)
- Maintain proportional relationships

## 🎬 Creative Examples

### Split-Screen Interview

```
┌─────────────────────────────────────┐
│                                     │
│  [Waveform at top]                  │
│                                     │
│                                     │
│  Host: Hello and welcome    Guest: Thanks for having me │
│  ┌─────────────────────┐   ┌─────────────────────┐     │
│  │                     │   │                     │     │
│  │                     │   │                     │     │
│  └─────────────────────┘   └─────────────────────┘     │
└─────────────────────────────────────┘
```

### News Style

```
┌─────────────────────────────────────┐
│  [Waveform at top]                  │
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

### Educational Content

```
┌─────────────────────────────────────┐
│                                     │
│  [Waveform in center]               │
│                                     │
│                                     │
│  Instructor: Today we'll learn...   │
│  ┌─────────────────────────────────┐ │
│  │                                 │ │
│  └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

## 🔄 Workflow

### Step-by-Step Formatting

1. **Upload audio** and select "Auto-Generate"
2. **Generate captions** with transcription
3. **Switch to "Global" tab** for overall formatting
4. **Adjust position, size, colors** as needed
5. **Switch to "Per Speaker" tab** for individual customization
6. **Position waveform** using waveform controls
7. **Preview changes** in real-time
8. **Generate final video**

### Saving and Reusing

- **Formatting is saved** with each project
- **Export settings** for reuse across projects
- **Theme integration** maintains consistency
- **Preset creation** for common layouts

## 🐛 Troubleshooting

### Common Issues

**Captions not appearing**:
- Check position values (0-100%)
- Verify font size (12-72px)
- Ensure background opacity > 0%

**Waveform positioning**:
- Width/height must be within limits
- Position values are percentages
- Center point calculation is automatic

**Speaker formatting not working**:
- Ensure speaker recognition is enabled
- Check speaker names match exactly
- Verify per-speaker tab is selected

### Performance Tips

**Large projects**:
- Use consistent formatting across speakers
- Avoid extreme position values
- Test on target display sizes

**Real-time preview**:
- Changes update immediately
- No need to regenerate for preview
- Final render uses exact settings

## 📚 Related Documentation

- **AUTO-CAPTIONS.md** - Auto-caption generation
- **SPEAKER-RECOGNITION-GUIDE.md** - Speaker identification
- **THEMES.md** - Theme system overview
- **ASSEMBLYAI-SETUP.md** - Transcription setup

## ✨ Summary

Caption formatting provides:

- ✅ **Complete positioning control**
- ✅ **Per-speaker customization**
- ✅ **Waveform repositioning**
- ✅ **Theme integration**
- ✅ **Real-time preview**
- ✅ **Professional results**

**Perfect for creating unique, branded video content!** 🎉
