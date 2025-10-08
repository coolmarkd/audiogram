var path = require("path"),
    fs = require("fs"),
    logger = require("./logger/");

// Whisper transcription service
// Returns timed caption segments from audio file

let whisperInstance = null;

function getWhisper() {
  if (!whisperInstance) {
    try {
      const { whisper } = require("whisper-node");
      whisperInstance = whisper;
    } catch (err) {
      logger.debug("Whisper not available:", err.message);
      return null;
    }
  }
  return whisperInstance;
}

function transcribe(audioPath, options, callback) {
  
  options = options || {};
  
  var whisperFn = getWhisper();
  
  if (!whisperFn) {
    return callback(new Error("Whisper transcription not available. Install with: npm install whisper-node"));
  }

  // Check if audio file exists
  if (!fs.existsSync(audioPath)) {
    return callback(new Error("Audio file not found: " + audioPath));
  }

  logger.debug("Starting transcription for:", audioPath);

  // Whisper configuration
  var whisperOptions = {
    modelName: "base.en",        // Good balance of speed and accuracy
    autoDownloadModelName: "base.en",
    whisperOptions: {
      word_timestamps: true,      // Get word-level timestamps
      max_len: 1,                // Max segment length in characters (for subtitle blocks)
      language: "en"
    }
  };

  // Run transcription
  whisperFn(audioPath, whisperOptions)
    .then(function(output) {
      
      logger.debug("Whisper raw output:", JSON.stringify(output, null, 2));
      
      // Parse Whisper output into timed caption segments
      var segments = parseWhisperOutput(output, options);
      
      logger.debug("Parsed segments:", segments.length);
      
      callback(null, segments);
      
    })
    .catch(function(err) {
      logger.debug("Whisper transcription error:", err);
      callback(err);
    });
}

function parseWhisperOutput(output, options) {
  
  var maxDuration = options.maxSegmentDuration || 3.0; // Max 3 seconds per caption block
  var segments = [];
  
  if (!output || !Array.isArray(output)) {
    return segments;
  }

  // Whisper returns array of segments with text and timestamps
  output.forEach(function(item) {
    
    // Handle different output formats
    var text = item.text || item.speech || "";
    var start = parseFloat(item.start || item.timestamps?.from || 0);
    var end = parseFloat(item.end || item.timestamps?.to || start + 2);
    
    text = text.trim();
    
    if (!text) {
      return;
    }

    // If segment is too long, split it
    if (end - start > maxDuration) {
      var words = text.split(/\s+/);
      var wordsPerSegment = Math.ceil(words.length / Math.ceil((end - start) / maxDuration));
      var currentStart = start;
      var segmentDuration = (end - start) / Math.ceil(words.length / wordsPerSegment);
      
      for (var i = 0; i < words.length; i += wordsPerSegment) {
        var segmentWords = words.slice(i, i + wordsPerSegment);
        var segmentEnd = Math.min(currentStart + segmentDuration, end);
        
        segments.push({
          start: Math.round(currentStart * 100) / 100,
          end: Math.round(segmentEnd * 100) / 100,
          text: segmentWords.join(" ")
        });
        
        currentStart = segmentEnd;
      }
    } else {
      segments.push({
        start: Math.round(start * 100) / 100,
        end: Math.round(end * 100) / 100,
        text: text
      });
    }
  });

  return segments;
}

// Check if Whisper is available
function isAvailable(callback) {
  var whisperFn = getWhisper();
  callback(null, whisperFn !== null);
}

module.exports = {
  transcribe: transcribe,
  isAvailable: isAvailable
};

