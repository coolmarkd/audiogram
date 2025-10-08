# Auto-Captions Feature

This document describes the automatic caption generation feature for Audiogram using local Whisper transcription.

## Overview

The auto-captions feature allows you to automatically generate timed captions from audio files using speech-to-text transcription. Users can choose between:

- **Static Caption**: A single caption displayed throughout the video (existing functionality)
- **Auto-Generate**: Timed captions generated via speech transcription with manual editing capability

## Installation

### 1. Install Dependencies

First, install the required npm packages:

```bash
npm install
```

This will install `whisper-node` along with other dependencies.

### 2. Whisper Model Download

The first time you use the transcription feature, Whisper will automatically download the `base.en` model (~150MB). This only happens once.

## Usage

### Basic Workflow

1. **Upload Audio File**: Select your audio file as usual
2. **Choose Caption Mode**: Select either "Static Caption" or "Auto-Generate (Transcribe)"
3. **Generate Captions** (Auto mode only):
   - Click the "Generate Captions" button
   - Wait for transcription to complete (timing depends on audio length)
   - Edit the generated caption segments as needed
4. **Generate Video**: Click "Generate" to create your video with captions

### Caption Mode: Static

This is the default mode and works exactly as before:
- Single caption text
- Displayed throughout the entire video
- Positioned according to theme settings

### Caption Mode: Auto-Generate

This mode enables automatic transcription and timed captions:

1. **Transcription**: Audio is transcribed using Whisper
2. **Segment Generation**: Text is broken into 2-3 second caption blocks
3. **Manual Editing**: Edit each caption segment:
   - Modify text content
   - Delete unwanted segments
   - Timestamps are automatically assigned
4. **Video Generation**: Captions appear/disappear at specified times

### Caption Editor Features

When in Auto-Generate mode, you'll see:

- **Caption Segments List**: Each segment shows:
  - Timestamp range (start → end)
  - Editable text field
  - Delete button
- **Generate Captions Button**: Triggers transcription
- **Real-time Editing**: Changes are saved automatically

## Theme Configuration

### Subtitle Styling

Timed captions use different styling from static captions. Configure in `settings/themes.json`:

```json
{
  "subtitleBottom": 650,           // Distance from bottom (px)
  "subtitleFont": "400 42px 'Source Sans Pro'",  // Font styling
  "subtitleLineHeight": 42,        // Line height (px)
  "subtitleLineSpacing": 5,        // Space between lines (px)
  "subtitleLeft": 100,             // Left margin (px)
  "subtitleRight": 1180,           // Right margin (px)
  "subtitleBackgroundColor": "rgba(0,0,0,0.7)",  // Background color
  "subtitlePadding": 10,           // Padding around text (px)
  "subtitleColor": "#fff",         // Text color
  "subtitleAlign": "center"        // Text alignment
}
```

### Visual Differences

- **Static Captions**: Use `captionFont`, `captionTop`, `captionColor`, etc.
- **Timed Captions**: Use `subtitleFont`, `subtitleBottom`, `subtitleBackgroundColor`, etc.
- Timed captions automatically include a semi-transparent background for better readability

## Technical Details

### Transcription Process

1. Audio file is uploaded to server
2. Server calls `/transcribe/:id` endpoint
3. Whisper processes audio and returns segments:
   ```json
   {
     "segments": [
       { "start": 0.0, "end": 2.5, "text": "Hello world" },
       { "start": 2.5, "end": 5.8, "text": "This is a test" }
     ]
   }
   ```
4. Client displays segments in editor
5. On submit, segments are sent with video generation request

### Data Format

Timed captions are stored as JSON:

```json
[
  {
    "start": 0.0,    // Start time in seconds
    "end": 2.5,      // End time in seconds
    "text": "Caption text"
  },
  ...
]
```

### Rendering Logic

During frame generation:
1. Calculate current time: `frameNumber / framesPerSecond`
2. Find caption segment where `start <= currentTime < end`
3. Render found caption with subtitle styling
4. If no segment found, render no caption

## Performance Considerations

### Transcription Speed

- Depends on audio length and system resources
- Typical: 10-30 seconds for 1 minute of audio
- Uses local processing (no external API calls)

### Model Size

- `base.en` model: ~150MB download (one-time)
- Stored in `~/.cache/whisper/`
- Good balance of speed and accuracy

### Alternative Models

Edit `lib/transcribe.js` to use different models:

```javascript
modelName: "tiny.en",    // Faster, less accurate (~75MB)
modelName: "small.en",   // Slower, more accurate (~500MB)
modelName: "medium.en",  // Much slower, very accurate (~1.5GB)
```

## Troubleshooting

### Whisper Installation Issues

If transcription fails:

1. **Check Node.js version**: Requires Node.js 18+
2. **Install whisper-node manually**:
   ```bash
   npm install whisper-node
   ```
3. **Check system dependencies**: Whisper requires ffmpeg

### Transcription Errors

Common issues:

- **"Audio file not found"**: Audio wasn't uploaded properly
- **"Transcription failed"**: Check server logs for details
- **Empty results**: Audio may be silent or very quiet

### Caption Display Issues

If captions don't appear:

1. Check theme has subtitle styling properties
2. Verify `subtitleBottom` is within video height
3. Check browser console for errors

## API Reference

### Server Endpoints

#### POST `/transcribe/:id`

Transcribe an uploaded audio file.

**Request**: Empty body (audio file must be already uploaded)

**Response**:
```json
{
  "segments": [
    { "start": 0.0, "end": 2.5, "text": "..." }
  ]
}
```

#### POST `/submit/`

Submit job for video generation (existing endpoint, enhanced).

**Additional Fields**:
- `captionMode`: "static" or "auto"
- `timedCaptions`: JSON string of caption segments (if auto mode)

### Client API

#### captionsEditor Module

```javascript
captionsEditor.init(callback)      // Initialize editor
captionsEditor.setMode(mode)       // Set "static" or "auto"
captionsEditor.getMode()           // Get current mode
captionsEditor.setSegments(array)  // Load caption segments
captionsEditor.getSegments()       // Get current segments
captionsEditor.clear()             // Clear all segments
```

## Examples

### Custom Theme with Subtitle Styling

```json
{
  "MyTheme": {
    "backgroundColor": "#1a1a1a",
    "waveColor": "#00ff00",
    "captionFont": "600 56px 'Arial'",
    "captionTop": 50,
    "captionColor": "#ffffff",
    "subtitleFont": "500 38px 'Arial'",
    "subtitleBottom": 620,
    "subtitleBackgroundColor": "rgba(0,0,0,0.85)",
    "subtitleColor": "#00ff00",
    "subtitlePadding": 15
  }
}
```

### Programmatic Caption Editing

If you want to modify captions via JavaScript:

```javascript
// Get current segments
var segments = captionsEditor.getSegments();

// Modify
segments.forEach(function(seg) {
  seg.text = seg.text.toUpperCase();
});

// Set back
captionsEditor.setSegments(segments);
```

## Future Enhancements

Possible improvements:

- Support for multiple languages
- Manual timestamp adjustment
- Caption preview with audio sync
- Export/import caption files (SRT, VTT)
- Merge/split caption segments
- Auto-capitalization and punctuation correction

## Credits

- Whisper model by OpenAI
- whisper-node package for Node.js integration
- Built on top of Audiogram by WNYC

