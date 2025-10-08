# AssemblyAI Setup Guide

Complete guide to setting up AssemblyAI transcription for Audiogram.

## Why AssemblyAI?

✅ **Affordable** - $0.015/min (~60% cheaper than OpenAI)  
✅ **Accurate** - Word-level timestamps  
✅ **Free Credits** - $50 free to start  
✅ **Fast** - Real-time transcription  
✅ **Easy** - Simple API integration  

## Quick Setup

### 1. Get API Key

1. Visit [AssemblyAI.com](https://www.assemblyai.com/)
2. Click "Get Started Free"
3. Sign up with email
4. Verify email address
5. Get API key from dashboard

**You'll receive $50 in free credits!**

### 2. Configure Locally

```bash
# Copy environment template
cp env.example .env

# Edit .env file
nano .env  # or use your favorite editor

# Add your API key
ASSEMBLYAI_API_KEY=your_actual_api_key_here
```

### 3. Install and Run

```bash
# Install dependencies
npm install

# Start server
npm start

# Open browser
open http://localhost:8888
```

### 4. Test Transcription

1. Upload an audio file
2. Select "Auto-Generate (Transcribe)"
3. Click "Generate Captions"
4. Wait for transcription
5. Edit captions as needed
6. Click "Generate" to create video

## Docker Setup

### Method 1: Environment Variable (Simple)

```bash
# Build image
docker build -t audiogram .

# Run with API key
docker run -p 8888:8888 \
  -e ASSEMBLYAI_API_KEY=your_key_here \
  audiogram
```

### Method 2: .env File (Recommended)

```bash
# Create .env file (already done from step 2)
# Make sure .env contains:
# ASSEMBLYAI_API_KEY=your_key_here

# Run with env file
docker run -p 8888:8888 \
  --env-file .env \
  audiogram
```

### Method 3: Docker Compose (Best)

```bash
# Use included docker-compose.yml
docker-compose up -d

# Check logs
docker-compose logs -f

# Stop
docker-compose down
```

**See `DOCKER-API-KEY-GUIDE.md` for comprehensive Docker security guide.**

## Cost Calculator

Calculate your estimated costs:

| Use Case | Audio Length | Cost |
|----------|-------------|------|
| Short clip | 30 seconds | $0.0075 |
| Podcast episode | 30 minutes | $0.45 |
| Interview | 1 hour | $0.90 |
| Audiobook chapter | 2 hours | $1.80 |
| Full audiobook | 10 hours | $9.00 |

**Free credits:** With $50 free credits, you can transcribe:
- ~55 hours of audio
- ~110 podcast episodes (30 min each)
- ~3,300 short clips (1 min each)

## Features

AssemblyAI provides:

- **Word-level timestamps** - Precise caption timing
- **Automatic punctuation** - Professional formatting
- **Speaker diarization** - Multiple speakers (if needed)
- **Content moderation** - Filter sensitive content (optional)
- **Custom vocabulary** - Improve accuracy for specific terms
- **Multiple languages** - Support for 28+ languages

## API Key Management

### Security Best Practices

✅ **DO:**
- Store key in `.env` file
- Add `.env` to `.gitignore`
- Use different keys for dev/prod
- Rotate keys every 90 days
- Use environment variables in Docker

❌ **DON'T:**
- Commit keys to Git
- Hardcode in source code
- Share keys publicly
- Use same key everywhere
- Store in Dockerfile

### Where Keys Are Used

The API key is only used in:
- `lib/transcribe.js` - Reads from `process.env.ASSEMBLYAI_API_KEY`
- Never stored in database
- Never logged to console
- Never sent to client

### Rotating Keys

To rotate your API key:

1. Generate new key in [AssemblyAI Dashboard](https://www.assemblyai.com/dashboard)
2. Update `.env` file with new key
3. Restart application
4. Delete old key from AssemblyAI dashboard

For Docker:

```bash
# Update .env with new key
nano .env

# Restart container
docker-compose restart

# Or for docker run
docker stop audiogram
docker rm audiogram
docker run -p 8888:8888 --env-file .env audiogram
```

## Troubleshooting

### "Transcription not available"

**Cause:** API key not set or invalid

**Solution:**
```bash
# Check if .env exists
cat .env | grep ASSEMBLYAI

# Verify API key format (should be long alphanumeric string)
# Get new key from https://www.assemblyai.com/dashboard
```

### "Error: Audio file not found"

**Cause:** Audio file upload failed

**Solution:**
- Check audio file format (MP3, WAV supported)
- Ensure file size is under limit
- Check server logs for errors

### "Transcription failed"

**Cause:** API error or network issue

**Solution:**
1. Check internet connection
2. Verify API key is valid
3. Check API usage limits
4. View detailed error in server logs

### Docker Container Can't Transcribe

**Cause:** API key not passed to container

**Solution:**
```bash
# Verify env var is set
docker exec audiogram env | grep ASSEMBLYAI

# If empty, restart with proper env:
docker run -p 8888:8888 \
  -e ASSEMBLYAI_API_KEY=your_key \
  audiogram
```

## Monitoring Usage

### Check Usage in Dashboard

1. Visit [AssemblyAI Dashboard](https://www.assemblyai.com/dashboard)
2. View "Usage" tab
3. See:
   - Audio minutes transcribed
   - API calls made
   - Remaining credits
   - Cost breakdown

### Set Up Alerts

In AssemblyAI dashboard:
1. Go to Settings
2. Set usage alerts
3. Get notified at 50%, 75%, 90% usage

## Upgrading Plan

When free credits run out:

1. Visit [AssemblyAI Pricing](https://www.assemblyai.com/pricing)
2. Choose plan (Pay-as-you-go or Enterprise)
3. Add payment method
4. No code changes needed!

## Performance Tips

### Optimize Transcription Speed

1. **Use smaller audio segments** - Break long files
2. **Pre-convert to MP3** - Faster upload
3. **Check file size** - Smaller = faster

### Reduce Costs

1. **Only transcribe what you need** - Trim audio first
2. **Cache transcriptions** - Save results for reuse
3. **Use bulk API** - Better rates for high volume

## FAQ

**Q: Is the $50 credit free?**  
A: Yes! New accounts get $50 in free credits. No credit card required.

**Q: What happens when credits run out?**  
A: Add payment method to continue. Pay-as-you-go pricing applies.

**Q: Can I use for commercial projects?**  
A: Yes! AssemblyAI's terms allow commercial use.

**Q: How accurate is it?**  
A: ~95% accuracy for clear audio. Varies with audio quality, accents, background noise.

**Q: Can I transcribe multiple languages?**  
A: Yes! Change `language_code` in `lib/transcribe.js`. Supports 28+ languages.

**Q: Is my audio data kept?**  
A: AssemblyAI doesn't store audio after processing. See their [privacy policy](https://www.assemblyai.com/legal/privacy-policy).

**Q: Can I use offline?**  
A: No, AssemblyAI requires internet. For offline, see `WHISPER-ALTERNATIVES.md`.

## Support

- **AssemblyAI Docs:** https://www.assemblyai.com/docs
- **API Status:** https://status.assemblyai.com
- **Community:** https://discord.gg/assemblyai
- **Support:** support@assemblyai.com

## Alternative Services

If AssemblyAI doesn't meet your needs, see `WHISPER-ALTERNATIVES.md` for:
- OpenAI Whisper API (more expensive)
- Deepgram (faster)
- Local Whisper (free, offline)
- Rev.ai
- Google Speech-to-Text

## Summary

✅ Sign up at AssemblyAI.com  
✅ Get API key from dashboard  
✅ Add to `.env` file  
✅ Never commit `.env` to Git  
✅ For Docker, pass via `-e` flag  
✅ $50 free credits = ~55 hours of transcription  

**You're ready to generate auto-captions!** 🎉

