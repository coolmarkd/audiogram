# Quick Start: Auto-Captions

## Installation

```bash
# 1. Install dependencies
npm install

# 2. Start the server
npm start

# 3. Open browser
# Navigate to http://localhost:8888
```

The Whisper model (~150MB) will download automatically on first use.

## Usage

### Option 1: Static Caption (Original)
1. Upload audio file
2. Keep "Static Caption" selected
3. Type your caption
4. Click "Generate"

### Option 2: Auto-Generated Captions (New!)
1. Upload audio file
2. Select "Auto-Generate (Transcribe)"
3. Click "Generate Captions" button
4. Wait for transcription (10-30 sec per minute of audio)
5. Edit caption text as needed
6. Click "Generate" to create video

## What You Get

**Auto-generated captions will:**
- Appear at the bottom of the video
- Have a semi-transparent black background
- Display for 2-3 seconds each
- Sync with the audio automatically

## Example Workflow

```
1. Upload: podcast-clip.mp3
2. Mode: Auto-Generate ✓
3. Click: "Generate Captions"
   → "Hello and welcome to the show"  [0:00 → 0:02]
   → "Today we're talking about..."   [0:02 → 0:05]
4. Edit: Fix any transcription errors
5. Generate: Create video with timed captions
```

## Tips

- **Audio Quality**: Clearer audio = better transcription
- **Background Noise**: Minimize for best results
- **Multiple Speakers**: Works, but may need editing
- **Edit Text**: Fix any mistakes before generating
- **Delete Segments**: Remove unwanted parts

## Troubleshooting

**"No audio file selected"**
→ Upload audio first

**"Transcription failed"**
→ Check audio file format (MP3 or WAV recommended)

**Captions don't appear in video**
→ Make sure you clicked "Generate Captions" first

**Need help?**
→ See AUTO-CAPTIONS.md for full documentation

## What's Next?

Check out the full documentation:
- `AUTO-CAPTIONS.md` - Complete user guide
- `IMPLEMENTATION-SUMMARY.md` - Technical details
- `THEMES.md` - Customize caption styling

