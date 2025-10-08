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

This will install the `openai` package along with other dependencies.

### 2. Set up AssemblyAI API Key

The transcription feature uses AssemblyAI's API. You'll need an API key:

1. Get an API key from [AssemblyAI](https://www.assemblyai.com/)
   - Sign up for free account
   - Get $50 in free credits
2. Copy `env.example` to `.env`:
   ```bash
   cp env.example .env
   ```
3. Edit `.env` and add your API key:
   ```
   ASSEMBLYAI_API_KEY=your-actual-api-key-here
   ```

**Cost:** Approximately $0.00025 per second (~$0.015 per minute, ~$0.90 per hour).

**Note:** Much cheaper than OpenAI! Plus you get $50 in free credits to start.

**Docker Users:** See `DOCKER-API-KEY-GUIDE.md` for secure API key handling in containers.

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
3. AssemblyAI API processes audio and returns word-level timestamps:
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

- Depends on audio length and AssemblyAI API response time
- Typical: 10-30 seconds for 1 minute of audio
- Uses AssemblyAI's API (requires API key)
- Word-level timestamps for precise caption timing

### Cost

- AssemblyAI API: ~$0.015 per minute of audio
- Example: 10-minute podcast = ~$0.15
- Example: 1-hour interview = ~$0.90
- **Free credits:** $50 free when you sign up!

### Alternative Options

**Want different options?** See `WHISPER-ALTERNATIVES.md` for:
- Free local Whisper processing (no API required)
- OpenAI Whisper (more expensive: $0.36/hour)
- Deepgram (fastest, $0.0043/min)
- Other transcription services

## Troubleshooting

### API Key Issues

If transcription fails:

1. **Check API key**: Make sure `ASSEMBLYAI_API_KEY` is set in `.env`
2. **Verify API key**: Test at https://www.assemblyai.com/dashboard
3. **Check balance**: Ensure your AssemblyAI account has credits
4. **Install assemblyai package**:
   ```bash
   npm install assemblyai
   ```
5. **Docker users**: See `DOCKER-API-KEY-GUIDE.md` for proper configuration

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

