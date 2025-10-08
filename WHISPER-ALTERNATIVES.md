# Whisper Integration - Alternative Options

## Issue

The `whisper-node` package specified in the implementation has version compatibility issues. Here are several working alternatives for speech-to-text transcription.

## Option 1: Use External API (OpenAI Whisper API) - **RECOMMENDED**

### Pros
- No complex dependencies
- Most accurate transcription
- Easy to implement
- Works in Docker without build issues

### Cons
- Requires API key
- Costs money per minute of audio
- Sends audio to external service

### Implementation

```bash
npm install openai
```

**Update `lib/transcribe.js`:**

```javascript
const { Configuration, OpenAIApi } = require("openai");
const fs = require("fs");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

async function transcribe(audioPath, options, callback) {
  try {
    const response = await openai.createTranscription(
      fs.createReadStream(audioPath),
      "whisper-1",
      undefined,
      "verbose_json"
    );
    
    // Parse response to match our format
    const segments = parseOpenAIResponse(response.data);
    callback(null, segments);
  } catch (error) {
    callback(error);
  }
}

function parseOpenAIResponse(data) {
  if (!data.segments) return [];
  
  return data.segments.map(seg => ({
    start: seg.start,
    end: seg.end,
    text: seg.text.trim()
  }));
}

module.exports = { transcribe };
```

**Add to `.env`:**
```
OPENAI_API_KEY=your-api-key-here
```

**Pricing:** ~$0.006 per minute of audio

## Option 2: Use AssemblyAI API - **GOOD ALTERNATIVE**

### Pros
- Affordable pricing
- Good accuracy
- Simple API
- Automatic speaker detection

### Cons
- Requires API key
- External service

### Implementation

```bash
npm install assemblyai
```

**Update `lib/transcribe.js`:**

```javascript
const { AssemblyAI } = require('assemblyai');
const fs = require('fs');

const client = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY
});

async function transcribe(audioPath, options, callback) {
  try {
    const transcript = await client.transcripts.transcribe({
      audio: audioPath,
      word_boost: ['audio', 'podcast', 'transcription'],
      format_text: true
    });

    if (transcript.status === 'error') {
      return callback(new Error(transcript.error));
    }

    const segments = parseAssemblyAIResponse(transcript);
    callback(null, segments);
  } catch (error) {
    callback(error);
  }
}

function parseAssemblyAIResponse(transcript) {
  if (!transcript.words) return [];
  
  const segments = [];
  const maxDuration = 3.0;
  let currentSegment = null;
  
  transcript.words.forEach(word => {
    if (!currentSegment || (word.start / 1000) - currentSegment.start > maxDuration) {
      if (currentSegment) segments.push(currentSegment);
      currentSegment = {
        start: word.start / 1000,
        end: word.end / 1000,
        text: word.text
      };
    } else {
      currentSegment.end = word.end / 1000;
      currentSegment.text += ' ' + word.text;
    }
  });
  
  if (currentSegment) segments.push(currentSegment);
  return segments;
}

module.exports = { transcribe };
```

**Pricing:** ~$0.00025 per second (~$0.015 per minute)

## Option 3: Use Deepgram API - **FASTEST OPTION**

### Pros
- Extremely fast (real-time transcription)
- Good accuracy
- Affordable
- Lots of features (speaker diarization, etc.)

### Cons
- Requires API key

### Implementation

```bash
npm install @deepgram/sdk
```

**Update `lib/transcribe.js`:**

```javascript
const { createClient } = require("@deepgram/sdk");
const fs = require("fs");

const deepgram = createClient(process.env.DEEPGRAM_API_KEY);

async function transcribe(audioPath, options, callback) {
  try {
    const audioBuffer = fs.readFileSync(audioPath);
    
    const { result } = await deepgram.listen.prerecorded.transcribeFile(
      audioBuffer,
      {
        model: "nova-2",
        smart_format: true,
        punctuate: true,
        paragraphs: true,
        utterances: true
      }
    );
    
    const segments = parseDeepgramResponse(result);
    callback(null, segments);
  } catch (error) {
    callback(error);
  }
}

function parseDeepgramResponse(result) {
  if (!result.results?.utterances) return [];
  
  return result.results.utterances.map(utt => ({
    start: utt.start,
    end: utt.end,
    text: utt.transcript
  }));
}

module.exports = { transcribe };
```

**Pricing:** ~$0.0043 per minute

## Option 4: Local Whisper with Docker - **NO API KEYS**

If you want to keep everything local, use a pre-built Whisper Docker container:

### Implementation

**Create `lib/transcribe.js`:**

```javascript
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

function transcribe(audioPath, options, callback) {
  const outputPath = audioPath + '.json';
  
  // Use openai/whisper Docker image
  const docker = spawn('docker', [
    'run', '--rm',
    '-v', `${path.dirname(audioPath)}:/audio`,
    'openai/whisper:latest',
    '--model', 'base.en',
    '--output_format', 'json',
    '--output_dir', '/audio',
    `/audio/${path.basename(audioPath)}`
  ]);

  let stderr = '';
  
  docker.stderr.on('data', (data) => {
    stderr += data.toString();
  });

  docker.on('close', (code) => {
    if (code !== 0) {
      return callback(new Error('Transcription failed: ' + stderr));
    }
    
    try {
      const result = JSON.parse(fs.readFileSync(outputPath, 'utf8'));
      const segments = parseWhisperOutput(result);
      fs.unlinkSync(outputPath); // Clean up
      callback(null, segments);
    } catch (error) {
      callback(error);
    }
  });
}

function parseWhisperOutput(output) {
  if (!output.segments) return [];
  
  return output.segments.map(seg => ({
    start: seg.start,
    end: seg.end,
    text: seg.text.trim()
  }));
}

module.exports = { transcribe };
```

**Note:** Requires Docker to be available on the system.

## Option 5: Disable Transcription (Fallback)

If you want to deploy quickly without transcription:

**Update `lib/transcribe.js`:**

```javascript
function transcribe(audioPath, options, callback) {
  // Return empty segments with a message
  callback(null, [{
    start: 0,
    end: 10,
    text: "Transcription not available. Please configure a transcription service."
  }]);
}

function isAvailable(callback) {
  callback(null, false);
}

module.exports = { transcribe, isAvailable };
```

Then users can manually enter captions.

## Recommendation

**For immediate deployment:** Use **Option 1 (OpenAI Whisper API)**
- Most reliable
- Best accuracy
- Easiest to implement
- No build issues

**For cost-conscious:** Use **Option 2 (AssemblyAI)**
- Much cheaper than OpenAI
- Still very accurate
- Good API

**For speed:** Use **Option 3 (Deepgram)**
- Fastest transcription
- Good accuracy
- Reasonable price

**For privacy/local:** Use **Option 4 (Docker Whisper)**
- No external services
- Free (except compute)
- More complex setup

## Quick Fix for Current Build

To get your Docker build working immediately:

1. Remove whisper-node dependency (already done above)
2. Choose one of the API options
3. Update `lib/transcribe.js` with your chosen implementation
4. Add API key to environment variables
5. Rebuild Docker

Would you like me to implement one of these alternatives?

