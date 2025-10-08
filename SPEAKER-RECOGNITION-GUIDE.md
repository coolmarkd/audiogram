# Speaker Recognition Guide

Complete guide to using speaker recognition and speaker name editing in Audiogram.

## 🎯 What is Speaker Recognition?

Speaker recognition (also called speaker diarization) automatically identifies different speakers in your audio and assigns them labels like "Speaker A", "Speaker B", etc. This is perfect for:

- **Podcasts** - Host vs Guest
- **Interviews** - Interviewer vs Interviewee
- **Meetings** - Multiple participants
- **Panel discussions** - Multiple speakers
- **Phone calls** - Caller vs Receiver

## 🚀 How It Works

### 1. Optional Speaker Detection

Speaker recognition is **optional** and can be toggled on/off:

**When Enabled:**
- AssemblyAI automatically identifies different voices
- Assigns speaker labels (Speaker A, Speaker B, etc.)
- Tracks which speaker says what
- Provides word-level timestamps with speaker information

**When Disabled:**
- Standard transcription without speaker identification
- Perfect for single-speaker content
- Faster processing and lower cost

### 2. Speaker Name Customization

You can customize speaker names:
- **Speaker A** → **Host**
- **Speaker B** → **Guest** 
- **Speaker C** → **Moderator**
- **Speaker D** → **Expert**

### 3. Visual Display

In the final video:
- Speaker names appear above captions
- Each speaker gets a unique color
- Names are displayed in the color you choose

## 📝 Step-by-Step Usage

### Step 1: Upload Audio

1. Select your audio file (MP3, WAV, etc.)
2. Choose "Auto-Generate (Transcribe)" mode
3. **Optional**: Toggle "Enable Speaker Recognition" on/off
4. Click "Generate Captions"

### Step 2: Wait for Transcription

AssemblyAI will:
- Process your audio (10-30 seconds per minute)
- **If speaker recognition enabled**: Identify speakers automatically
- Generate timed captions (with speaker labels if enabled)

### Step 3: Customize Speaker Names (if enabled)

**If speaker recognition is enabled**, after transcription you'll see:

```
Speaker Names
┌─────────────────────────────────────┐
│ Speaker A: [Host        ]           │
│ Speaker B: [Guest       ]           │
│ Speaker C: [Moderator   ]           │
└─────────────────────────────────────┘
```

Edit the names to match your speakers:
- Click in the text field
- Type the actual name
- Changes apply immediately

**If speaker recognition is disabled**, this section won't appear.

### Step 4: Edit Captions

Each caption segment shows:
- **Timestamp**: 0:05 → 0:08
- **Speaker**: Dropdown to change speaker (if speaker recognition enabled)
- **Text**: Editable caption text
- **Delete**: Remove unwanted segments

### Step 5: Generate Video

Click "Generate" to create your video with:
- Timed captions
- Speaker names in colors (if speaker recognition enabled)
- Professional subtitle styling

## 🎨 Speaker Colors

Each speaker gets a unique color:

| Speaker | Default Color | Example |
|---------|---------------|---------|
| Speaker A | Green (#4CAF50) | Host |
| Speaker B | Blue (#2196F3) | Guest |
| Speaker C | Orange (#FF9800) | Moderator |
| Speaker D | Purple (#9C27B0) | Expert |
| Speaker E | Red (#F44336) | Audience |

### Customizing Colors

Edit `settings/themes.json`:

```json
{
  "speakerColors": {
    "Speaker A": "#4CAF50",  // Green
    "Speaker B": "#2196F3",  // Blue
    "Speaker C": "#FF9800",  // Orange
    "Speaker D": "#9C27B0",  // Purple
    "Speaker E": "#F44336"   // Red
  }
}
```

## 💡 Tips for Best Results

### When to Enable Speaker Recognition
- ✅ **Multiple speakers** (interviews, podcasts, meetings)
- ✅ **Clear speaker separation** (not overlapping)
- ✅ **2-5 speakers** work best
- ❌ **Single speaker** content (no benefit)
- ❌ **Heavy background noise** (may confuse detection)
- ❌ **Overlapping speech** (speakers talking simultaneously)

### Audio Quality
- **Clear audio** = better speaker detection
- **Minimize background noise**
- **Separate speakers** (not overlapping)
- **Good microphone quality**

### Speaker Changes
- **Natural pauses** help detection
- **Clear speaker transitions**
- **Avoid rapid back-and-forth**

## 🔧 Advanced Features

### Changing Speaker Assignments

If AssemblyAI assigns the wrong speaker:

1. **Select the caption segment**
2. **Click the speaker dropdown**
3. **Choose the correct speaker**
4. **All segments update automatically**

### Merging Speakers

If two speakers are detected as separate:

1. **Change all segments** of one speaker to the other
2. **Delete the unused speaker** from the names editor
3. **Customize the remaining speaker name**

### Splitting Speakers

If one person is detected as multiple speakers:

1. **Manually assign segments** to the correct speaker
2. **Use the speaker dropdown** for each segment
3. **Customize speaker names** as needed

## 📊 Example Workflow

### Podcast Interview

```
1. Upload: interview.mp3
2. Transcribe: "Generate Captions"
3. Results:
   - Speaker A: "Welcome to the show"
   - Speaker B: "Thanks for having me"
   - Speaker A: "Let's start with your background"
4. Customize:
   - Speaker A → "Host"
   - Speaker B → "Guest"
5. Edit: Fix any transcription errors
6. Generate: Create video with colored speaker names
```

### Panel Discussion

```
1. Upload: panel.mp3
2. Transcribe: "Generate Captions"
3. Results:
   - Speaker A: "First question"
   - Speaker B: "I think..."
   - Speaker C: "Building on that..."
4. Customize:
   - Speaker A → "Moderator"
   - Speaker B → "Expert 1"
   - Speaker C → "Expert 2"
5. Generate: Multi-speaker video
```

## 🎬 Final Video Output

Your generated video will show:

```
┌─────────────────────────────────────┐
│                                     │
│  [Waveform visualization]           │
│                                     │
│                                     │
│                                     │
│                                     │
│  Host:                              │
│  Welcome to the show                │
│  ┌─────────────────────────────────┐ │
│  │                                 │ │
│  │ Guest:                          │ │
│  │ Thanks for having me            │ │
│  └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

- **Speaker names** in custom colors
- **Caption text** in white
- **Semi-transparent background**
- **Timed appearance/disappearance**

## 🐛 Troubleshooting

### "No speakers detected"

**Cause:** Single speaker or poor audio quality

**Solution:**
- Check audio has multiple speakers
- Improve audio quality
- Try different audio file

### "Wrong speaker assigned"

**Cause:** Similar voices or overlapping speech

**Solution:**
- Manually reassign using dropdown
- Edit speaker names
- Split/merge speakers as needed

### "Speaker colors not showing"

**Cause:** Theme doesn't have speaker colors

**Solution:**
- Add `speakerColors` to theme
- Check theme configuration
- Use default theme

### "Too many speakers detected"

**Cause:** Background noise or echo

**Solution:**
- Clean up audio first
- Manually merge similar speakers
- Use fewer speaker colors

## 📈 Accuracy Tips

### For Best Speaker Detection:

1. **High-quality audio** (48kHz, stereo)
2. **Clear speaker separation** (not overlapping)
3. **Consistent microphone levels**
4. **Minimal background noise**
5. **Natural speech patterns**

### For Best Transcription:

1. **Clear pronunciation**
2. **Appropriate speaking speed**
3. **Minimal accents** (if possible)
4. **Good audio levels** (not too quiet/loud)
5. **English language** (optimized)

## 💰 Cost Information

Speaker recognition is **included at no extra cost**:

- **Regular transcription**: $0.015/minute
- **With speaker recognition**: $0.015/minute (same price!)
- **No additional charges** for speaker features

## 🔄 Workflow Examples

### Quick Podcast

```
1. Upload podcast.mp3
2. Enable "Speaker Recognition" (checkbox)
3. Click "Generate Captions"
4. Wait 30 seconds
5. Edit: "Speaker A" → "Host", "Speaker B" → "Guest"
6. Click "Generate"
7. Done! 🎉
```

### Single Speaker Content

```
1. Upload speech.mp3
2. Disable "Speaker Recognition" (uncheck)
3. Click "Generate Captions"
4. Wait 20 seconds
5. Edit caption text if needed
6. Click "Generate"
7. Done! 🎉
```

### Complex Panel

```
1. Upload panel.mp3
2. Click "Generate Captions"
3. Wait 2 minutes
4. Edit names: A→Moderator, B→Expert1, C→Expert2, D→Expert3
5. Fix any wrong speaker assignments
6. Edit caption text
7. Click "Generate"
8. Professional multi-speaker video! 🎉
```

## 🎯 Use Cases

### Perfect For (Speaker Recognition Enabled):
- ✅ Podcast interviews
- ✅ Conference presentations with multiple speakers
- ✅ Meeting recordings
- ✅ Panel discussions
- ✅ Q&A sessions
- ✅ Multi-speaker educational content

### Perfect For (Speaker Recognition Disabled):
- ✅ Single speaker presentations
- ✅ Monologues
- ✅ Solo podcasts
- ✅ Speeches
- ✅ Narration
- ✅ Music with vocals

### Not Ideal For:
- ❌ Very noisy environments
- ❌ Non-English audio
- ❌ Heavily accented speech
- ❌ Overlapping speech (when speaker recognition enabled)

## 📚 Related Documentation

- **AUTO-CAPTIONS.md** - Complete auto-caption guide
- **ASSEMBLYAI-SETUP.md** - AssemblyAI configuration
- **THEMES.md** - Customizing speaker colors
- **DOCKER-API-KEY-GUIDE.md** - Docker setup

## 🆘 Support

If you need help:

1. **Check this guide** for common issues
2. **Try different audio** to test
3. **Contact support** with specific error messages
4. **Check AssemblyAI status** for service issues

## ✨ Summary

Speaker recognition makes your videos more professional by:

- ✅ **Automatically identifying speakers**
- ✅ **Allowing custom speaker names**
- ✅ **Displaying names in colors**
- ✅ **No additional cost**
- ✅ **Easy to use and edit**

**Perfect for podcasts, interviews, and multi-speaker content!** 🎉
