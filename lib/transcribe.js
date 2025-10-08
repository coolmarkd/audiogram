var path = require("path"),
    fs = require("fs"),
    logger = require("./logger/");

// AssemblyAI transcription service
// Returns timed caption segments from audio file

let assemblyaiClient = null;

function getAssemblyAI() {
  if (!assemblyaiClient) {
    try {
      const { AssemblyAI } = require("assemblyai");
      
      // Check for API key
      var apiKey = process.env.ASSEMBLYAI_API_KEY;
      if (!apiKey) {
        logger.debug("ASSEMBLYAI_API_KEY not set in environment");
        return null;
      }
      
      assemblyaiClient = new AssemblyAI({ apiKey: apiKey });
      logger.debug("AssemblyAI client initialized");
    } catch (err) {
      logger.debug("AssemblyAI not available:", err.message);
      return null;
    }
  }
  return assemblyaiClient;
}

async function transcribe(audioPath, requestData, callback) {
  
  requestData = requestData || {};
  
  var client = getAssemblyAI();
  
  if (!client) {
    return callback(new Error("Transcription not available. Please set ASSEMBLYAI_API_KEY environment variable or install assemblyai: npm install assemblyai"));
  }

  // Check if audio file exists
  if (!fs.existsSync(audioPath)) {
    return callback(new Error("Audio file not found: " + audioPath));
  }

  logger.debug("Starting AssemblyAI transcription for:", audioPath);

  try {
    // Check if speaker recognition is enabled
    var speakerRecognitionEnabled = requestData.speakerRecognitionEnabled !== "false";
    
    // Upload and transcribe the audio file
    var transcriptOptions = {
      audio: audioPath,
      speech_model: "best",
      language_code: "en",
      punctuate: true,
      format_text: true,
      disfluencies: requestData.disfluenciesEnabled || false
    };

    // Add keyterms if provided
    if (requestData.keyterms && requestData.keyterms.length > 0) {
      transcriptOptions.keyterms_prompt = requestData.keyterms;
    }
    
    // Add speaker diarization if enabled
    if (speakerRecognitionEnabled) {
      transcriptOptions.speaker_labels = true;
      
      // Configure speaker count based on settings
      var speakerCountType = requestData.speakerCountType || "auto";
      var speakerCountValue = requestData.speakerCountValue || 2;
      
      if (speakerCountType === "exact") {
        // Use speakers_expected for exact number
        transcriptOptions.speakers_expected = speakerCountValue;
      } else if (speakerCountType === "minimum") {
        // Use speaker_options for minimum number
        transcriptOptions.speaker_options = {
          min_speakers: speakerCountValue
        };
      }
      // For "auto", don't set any speaker count options
    }
    
    var transcript = await client.transcripts.transcribe(transcriptOptions);
    
    if (transcript.status === "error") {
      logger.debug("AssemblyAI transcription error:", transcript.error);
      return callback(new Error(transcript.error || "Transcription failed"));
    }
    
    logger.debug("AssemblyAI transcription completed");
    
    // Parse response into timed caption segments
    var segments = parseAssemblyAIResponse(transcript, requestData);
    
    logger.debug("Parsed segments:", segments.length);
    
    callback(null, segments);
    
  } catch (err) {
    logger.debug("AssemblyAI transcription error:", err.message);
    callback(err);
  }
}

function parseAssemblyAIResponse(transcript, requestData) {
  
  var maxDuration = requestData.maxSegmentDuration || 3.0; // Max 3 seconds per caption block
  var segments = [];
  
  if (!transcript || !transcript.words) {
    // Fallback: use full text if no words
    if (transcript && transcript.text) {
      return [{
        start: 0,
        end: 10,
        text: transcript.text
      }];
    }
    return segments;
  }

  // AssemblyAI returns word-level timestamps
  // Group words into caption segments based on maxDuration
  var currentSegment = null;
  
  transcript.words.forEach(function(word) {
    var wordStart = word.start / 1000; // Convert ms to seconds
    var wordEnd = word.end / 1000;
    var wordText = word.text;
    var speakerRecognitionEnabled = requestData.speakerRecognitionEnabled !== "false";
    var speaker = speakerRecognitionEnabled ? (word.speaker || "Speaker A") : null;
    
    if (!currentSegment) {
      // Start new segment
      currentSegment = {
        start: wordStart,
        end: wordEnd,
        text: wordText
      };
      if (speaker) currentSegment.speaker = speaker;
    } else if (wordStart - currentSegment.start < maxDuration && 
               (!speakerRecognitionEnabled || currentSegment.speaker === speaker)) {
      // Add to current segment (same speaker if enabled, within duration limit)
      currentSegment.end = wordEnd;
      currentSegment.text += " " + wordText;
    } else {
      // Save current segment and start new one (different speaker or too long)
      var segment = {
        start: Math.round(currentSegment.start * 100) / 100,
        end: Math.round(currentSegment.end * 100) / 100,
        text: currentSegment.text
      };
      if (currentSegment.speaker) segment.speaker = currentSegment.speaker;
      segments.push(segment);
      
      currentSegment = {
        start: wordStart,
        end: wordEnd,
        text: wordText
      };
      if (speaker) currentSegment.speaker = speaker;
    }
  });
  
  // Add last segment
  if (currentSegment) {
    var segment = {
      start: Math.round(currentSegment.start * 100) / 100,
      end: Math.round(currentSegment.end * 100) / 100,
      text: currentSegment.text
    };
    if (currentSegment.speaker) segment.speaker = currentSegment.speaker;
    segments.push(segment);
  }

  return segments;
}

// Check if transcription is available
function isAvailable(callback) {
  var client = getAssemblyAI();
  callback(null, client !== null);
}

module.exports = {
  transcribe: transcribe,
  isAvailable: isAvailable
};

