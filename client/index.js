var d3 = require("d3"),
    $ = require("jquery"),
    preview = require("./preview.js"),
    video = require("./video.js"),
    audio = require("./audio.js"),
    captionsEditor = require("./captions.js")();

// Global configuration object
var config = {
  baseUrl: window.location.origin
};

// Display git commit hash if available (for debugging)
console.log("Audiogram application starting...");
console.log("Base URL:", config.baseUrl);

// Load configuration from server
d3.json("/config.json", function(err, serverConfig) {
  if (!err && serverConfig) {
    console.log("Received server config:", serverConfig);
    config.baseUrl = serverConfig.protocol + "://" + serverConfig.host;
    console.log("Set baseUrl to:", config.baseUrl);
  } else {
    console.error("Error loading config.json:", err);
    console.log("Using fallback baseUrl:", config.baseUrl);
  }
  
  // Fetch and display git commit hash using the correct base URL
  d3.json(config.baseUrl + "/git-info", function(err, gitInfo) {
    if (!err && gitInfo) {
      console.log("Git commit hash:", gitInfo.gitCommitHash);
      console.log("Build timestamp:", gitInfo.timestamp);
    } else {
      console.log("Git commit hash: Not available");
    }
  });
  
  // Now load themes with the correct base URL
  loadThemes();
});

function loadThemes() {
  console.log("loadThemes called with baseUrl:", config.baseUrl);
  d3.json(config.baseUrl + "/settings/themes.json", function(err, themes){
    console.log("Themes loaded:", err, themes);

    var errorMessage;

  // Themes are missing or invalid
  if (err || !d3.keys(themes).filter(function(d){ return d !== "default"; }).length) {
    if (err instanceof SyntaxError) {
      errorMessage = "Error in settings/themes.json:<br/><code>" + err.toString() + "</code>";
    } else if (err instanceof ProgressEvent) {
      errorMessage = "Error: no settings/themes.json.";
    } else if (err) {
      errorMessage = "Error: couldn't load settings/themes.json.";
    } else {
      errorMessage = "No themes found in settings/themes.json.";
    }
    d3.select("#loading-bars").remove();
    d3.select("#loading-message").html(errorMessage);
    if (err) {
      throw err;
    }
    return;
  }

  for (var key in themes) {
    themes[key] = $.extend({}, themes.default, themes[key]);
  }

  preloadImages(themes);

});

function submitted() {
  if (d3.event && d3.event.preventDefault) {
    d3.event.preventDefault();
  }

  var theme = preview.theme(),
      caption = preview.caption(),
      selection = preview.selection(),
      file = preview.file(),
      captionMode = captionsEditor.getMode(),
      timedCaptions = null;

  if (!file) {
    d3.select("#row-audio").classed("error", true);
    return setClass("error", "No audio file selected.");
  }

  if (theme.maxDuration && selection.duration > theme.maxDuration) {
    return setClass("error", "Your Audiogram must be under " + theme.maxDuration + " seconds.");
  }

  if (!theme || !theme.width || !theme.height) {
    return setClass("error", "No valid theme detected.");
  }

  // Get timed captions if in auto mode
  if (captionMode === "auto") {
    timedCaptions = captionsEditor.getSegments();
    if (!timedCaptions || timedCaptions.length === 0) {
      return setClass("error", "Please generate captions first.");
    }
  }

  video.kill();
  audio.pause();

  var formData = new FormData();

  formData.append("audio", file);
  if (selection.start || selection.end) {
    formData.append("start", selection.start);
    formData.append("end", selection.end);
  }
  formData.append("theme", JSON.stringify($.extend({}, theme, { backgroundImageFile: null })));
  formData.append("captionMode", captionMode);
  
  if (captionMode === "static") {
    formData.append("caption", caption);
  } else {
    formData.append("timedCaptions", JSON.stringify(timedCaptions));
    formData.append("speakerNames", JSON.stringify(captionsEditor.getSpeakerNames()));
    formData.append("speakerRecognitionEnabled", captionsEditor.isSpeakerRecognitionEnabled());
    formData.append("captionFormatting", JSON.stringify(captionsEditor.getCaptionFormatting()));
    formData.append("waveformPositioning", JSON.stringify(captionsEditor.getWaveformPositioning()));
    formData.append("waveformConfig", JSON.stringify(captionsEditor.getWaveformConfig()));
  }

  setClass("loading");
  d3.select("#loading-message").text("Uploading audio...");
  
  // Hide regenerate button during generation
  d3.select("#regenerate").classed("hidden", true);

	$.ajax({
		url: config.baseUrl + "/submit/",
		type: "POST",
		data: formData,
		contentType: false,
    dataType: "json",
		cache: false,
		processData: false,
		success: function(data){
      poll(data.id, 0);
		},
    error: error

  });

}

function poll(id) {

  setTimeout(function(){
    $.ajax({
      url: config.baseUrl + "/status/" + id + "/",
      error: function(xhr, status, errorMsg) {
        console.error("Status polling error:", status, errorMsg);
        error("Failed to check video status: " + errorMsg);
      },
      dataType: "json",
      success: function(result){
        console.log("Status poll result:", result);
        
        if (result && result.status && result.status === "ready" && result.url) {
          console.log("Video ready, URL:", result.url);
          
          // Get theme name safely
          var themeName = "Audiogram"; // fallback
          try {
            if (preview && preview.theme && typeof preview.theme === 'function') {
              var currentTheme = preview.theme();
              if (currentTheme && currentTheme.name) {
                themeName = currentTheme.name;
              }
            }
          } catch (e) {
            console.warn("Could not get theme name:", e);
          }
          
          console.log("Using theme name:", themeName);
          video.update(result.url, themeName);
          setClass("rendered");
          
          // Show regenerate button
          d3.select("#regenerate").classed("hidden", false);
          
          // Debug: Check if UI elements are visible
          setTimeout(function() {
            var videoElement = document.getElementById("video");
            var downloadElement = document.getElementById("download");
            var bodyElement = document.body;
            
            console.log("UI State Debug:");
            console.log("- Body classes:", bodyElement.className);
            console.log("- Video element:", videoElement);
            console.log("- Video display style:", videoElement ? window.getComputedStyle(videoElement).display : "not found");
            console.log("- Download element:", downloadElement);
            console.log("- Download display style:", downloadElement ? window.getComputedStyle(downloadElement).display : "not found");
            console.log("- Download href:", downloadElement ? downloadElement.href : "not found");
            console.log("- Video source:", videoElement ? videoElement.querySelector("source").src : "not found");
          }, 100);
        } else if (result.status === "error") {
          console.error("Video generation error:", result.error);
          error(result.error);
        } else {
          d3.select("#loading-message").text(statusMessage(result));
          poll(id);
        }
      }
    });

  }, 2500);

}

function error(msg) {

  if (msg.responseText) {
    msg = msg.responseText;
  }

  if (typeof msg !== "string") {
    msg = JSON.stringify(msg);
  }

  if (!msg) {
    msg = "Unknown error";
  }

  d3.select("#loading-message").text("Loading...");
  setClass("error", msg);

}

// Once images are downloaded, set up listeners
function initialize(err, themesWithImages) {
  console.log("initialize function called with:", err, themesWithImages);

  // Populate dropdown menu
  d3.select("#input-theme")
    .on("change", updateTheme)
    .selectAll("option")
    .data(themesWithImages)
    .enter()
    .append("option")
      .text(function(d){
        return d.name;
      });

  // Get initial theme
  d3.select("#input-theme").each(updateTheme);

  // Get initial caption (e.g. back button)
  d3.select("#input-caption").on("change keyup", updateCaption).each(updateCaption);

  // Space bar listener for audio play/pause
  d3.select(document).on("keypress", function(){
    if (!d3.select("body").classed("rendered") && d3.event.key === " " && !d3.matcher("input, textarea, button, select").call(d3.event.target)) {
      audio.toggle();
    }
  });

  // Button listeners
  d3.selectAll("#play, #pause").on("click", function(){
    if (d3.event && d3.event.preventDefault) {
      d3.event.preventDefault();
    }
    audio.toggle();
  });

  d3.select("#restart").on("click", function(){
    if (d3.event && d3.event.preventDefault) {
      d3.event.preventDefault();
    }
    audio.restart();
  });

  // If there's an initial piece of audio (e.g. back button) load it
  d3.select("#input-audio").on("change", updateAudioFile).each(updateAudioFile);

  d3.select("#return").on("click", function(){
    if (d3.event && d3.event.preventDefault) {
      d3.event.preventDefault();
    }
    video.kill();
    setClass(null);
  });

  d3.select("#submit").on("click", submitted);
  d3.select("#regenerate").on("click", function() {
    if (d3.event && d3.event.preventDefault) {
      d3.event.preventDefault();
    }
    regenerateVideo();
  });

  // Initialize captions editor
  console.log("About to initialize captions editor");
  captionsEditor.init(function(action) {
    console.log("Captions editor callback called with action:", action);
    if (action === "transcribe") {
      transcribeAudio();
    }
  });
  console.log("Captions editor init called");
  
  // Make captionsEditor and preview globally accessible
  window.captionsEditor = captionsEditor;
  window.preview = preview;

}

function regenerateVideo() {
  if (d3.event && d3.event.preventDefault) {
    d3.event.preventDefault();
  }

  var theme = preview.theme(),
      caption = preview.caption(),
      selection = preview.selection(),
      file = preview.file(),
      captionMode = captionsEditor.getMode(),
      timedCaptions = null;

  if (!file) {
    d3.select("#row-audio").classed("error", true);
    return setClass("error", "No audio file selected.");
  }

  if (theme.maxDuration && selection.duration > theme.maxDuration) {
    return setClass("error", "Your Audiogram must be under " + theme.maxDuration + " seconds.");
  }

  if (!theme || !theme.width || !theme.height) {
    return setClass("error", "No valid theme detected.");
  }

  // Get timed captions if in auto mode
  if (captionMode === "auto") {
    timedCaptions = captionsEditor.getSegments();
    if (!timedCaptions || timedCaptions.length === 0) {
      return setClass("error", "Please generate captions first.");
    }
  }

  video.kill();
  audio.pause();

  var formData = new FormData();

  formData.append("audio", file);
  if (selection.start || selection.end) {
    formData.append("start", selection.start);
    formData.append("end", selection.end);
  }
  formData.append("theme", JSON.stringify($.extend({}, theme, { backgroundImageFile: null })));
  formData.append("captionMode", captionMode);
  formData.append("regenerate", "true"); // Flag to indicate this is a regeneration
  
  if (captionMode === "static") {
    formData.append("caption", caption);
  } else {
    formData.append("timedCaptions", JSON.stringify(timedCaptions));
    formData.append("speakerNames", JSON.stringify(captionsEditor.getSpeakerNames()));
    formData.append("speakerRecognitionEnabled", captionsEditor.isSpeakerRecognitionEnabled());
    formData.append("captionFormatting", JSON.stringify(captionsEditor.getCaptionFormatting()));
    formData.append("waveformPositioning", JSON.stringify(captionsEditor.getWaveformPositioning()));
    formData.append("waveformConfig", JSON.stringify(captionsEditor.getWaveformConfig()));
  }

  setClass("loading");
  d3.select("#loading-message").text("Regenerating video...");
  
  // Hide regenerate button during regeneration
  d3.select("#regenerate").classed("hidden", true);

  $.ajax({
    url: config.baseUrl + "/submit/",
    type: "POST",
    data: formData,
    contentType: false,
    dataType: "json",
    cache: false,
    processData: false,
    success: function(data){
      poll(data.id, 0);
    },
    error: error
  });
}

function transcribeAudio() {
  var file = preview.file();
  
  if (!file) {
    return setClass("error", "No audio file selected.");
  }

  setClass("loading");
  d3.select("#loading-message").text("Transcribing audio...");

  // First, upload the audio if not already uploaded
  var formData = new FormData();
  formData.append("audio", file);
  formData.append("theme", JSON.stringify(preview.theme()));
  formData.append("speakerRecognitionEnabled", captionsEditor.isSpeakerRecognitionEnabled());
  formData.append("disfluenciesEnabled", captionsEditor.isDisfluenciesEnabled());
  formData.append("speakerCountType", captionsEditor.getSpeakerCountType());
  formData.append("speakerCountValue", captionsEditor.getSpeakerCountValue());
  formData.append("keyterms", JSON.stringify(captionsEditor.getKeyterms()));
  formData.append("speechModel", captionsEditor.getSpeechModel());

  $.ajax({
    url: config.baseUrl + "/submit/",
    type: "POST",
    data: formData,
    contentType: false,
    dataType: "json",
    cache: false,
    processData: false,
    success: function(data) {
      // Now transcribe
      $.ajax({
        url: config.baseUrl + "/transcribe/" + data.id + "/",
        type: "POST",
        dataType: "json",
        success: function(result) {
          if (result && result.segments) {
            captionsEditor.setSegments(result.segments);
            setClass(null);
            d3.select("#loading-message").text("Loading...");
          } else {
            error("No transcription results");
          }
        },
        error: function(err) {
          error("Transcription failed: " + (err.responseJSON?.error || err.statusText));
        }
      });
    },
    error: error
  });
}

function updateAudioFile() {

  d3.select("#row-audio").classed("error", false);

  audio.pause();
  video.kill();

  // Skip if empty
  if (!this.files || !this.files[0]) {
    d3.select("#minimap").classed("hidden", true);
    preview.file(null);
    setClass(null);
    return true;
  }

  d3.select("#loading-message").text("Analyzing...");

  setClass("loading");

  preview.loadAudio(this.files[0], function(err){

    if (err) {
      d3.select("#row-audio").classed("error", true);
      setClass("error", "Error decoding audio file");
    } else {
      setClass(null);
    }

    d3.selectAll("#minimap, #submit").classed("hidden", !!err);

  });

}

function updateCaption() {
  preview.caption(this.value);
}

function updateTheme() {
  var selectedTheme = d3.select(this.options[this.selectedIndex]).datum();
  preview.theme(selectedTheme);
  
  // Load speaker colors from theme if captions editor is available
  if (window.captionsEditor && selectedTheme) {
    window.captionsEditor.loadSpeakerColorsFromTheme(selectedTheme);
  }
}

function preloadImages(themes) {

  // preload images
  var imageQueue = d3.queue();

  d3.entries(themes).forEach(function(theme){

    if (!theme.value.name) {
      theme.value.name = theme.key;
    }

    if (theme.key !== "default") {
      imageQueue.defer(getImage, theme.value);
    }

  });

  imageQueue.awaitAll(initialize);

  function getImage(theme, cb) {

    if (!theme.backgroundImage) {
      return cb(null, theme);
    }

    theme.backgroundImageFile = new Image();
    theme.backgroundImageFile.onload = function(){
      return cb(null, theme);
    };
    theme.backgroundImageFile.onerror = function(e){
      console.warn(e);
      return cb(null, theme);
    };

    theme.backgroundImageFile.src = config.baseUrl + "/settings/backgrounds/" + theme.backgroundImage;

  }

}

function setClass(cl, msg) {
  console.log("setClass called with:", cl, msg);
  d3.select("body").attr("class", cl || null);
  d3.select("#error").text(msg || "");
  console.log("Body class set to:", document.body.className);
}

function statusMessage(result) {

  switch (result.status) {
    case "queued":
      return "Waiting for other jobs to finish, #" + (result.position + 1) + " in queue";
    case "audio-download":
      return "Downloading audio for processing";
    case "trim":
      return "Trimming audio";
    case "probing":
      return "Probing audio file";
    case "waveform":
      return "Analyzing waveform";
    case "renderer":
      return "Initializing renderer";
    case "frames":
      var msg = "Generating frames";
      if (result.numFrames) {
        msg += ", " + Math.round(100 * (result.framesComplete || 0) / result.numFrames) + "% complete";
      }
      return msg;
    case "combine":
      return "Combining frames with audio";
    case "ready":
      return "Cleaning up";
    default:
      return JSON.stringify(result);
  }

}
}
