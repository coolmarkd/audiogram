var d3 = require("d3"),
    audio = require("./audio.js"),
    video = require("./video.js"),
    minimap = require("./minimap.js"),
    sampleWave = require("./sample-wave.js"),
    getRenderer = require("../renderer/"),
    getWaveform = require("./waveform.js");

var context = d3.select("canvas").node().getContext("2d");

var theme,
    caption,
    file,
    selection;

function _file(_) {
  return arguments.length ? (file = _) : file;
}

function _theme(_) {
  return arguments.length ? (theme = _, redraw()) : theme;
}

function _caption(_) {
  return arguments.length ? (caption = _, redraw()) : caption;
}

function _selection(_) {
  return arguments.length ? (selection = _) : selection;
}

minimap.onBrush(function(extent){

  var duration = audio.duration();

  selection = {
    duration: duration * (extent[1] - extent[0]),
    start: extent[0] ? extent[0] * duration : null,
    end: extent[1] < 1 ? extent[1] * duration : null
  };

  d3.select("#duration strong").text(Math.round(10 * selection.duration) / 10)
    .classed("red", theme && theme.maxDuration && theme.maxDuration < selection.duration);

});

// Resize video and preview canvas to maintain aspect ratio
function resize(width, height) {

  var widthFactor = 640 / width,
      heightFactor = 360 / height,
      factor = Math.min(widthFactor, heightFactor);

  d3.select("canvas")
    .attr("width", factor * width)
    .attr("height", factor * height);

  d3.select("#canvas")
    .style("width", (factor * width) + "px");

  d3.select("video")
    .attr("height", widthFactor * height);

  d3.select("#video")
    .attr("height", (widthFactor * height) + "px");

  context.setTransform(factor, 0, 0, factor, 0, 0);

}

function redraw() {

  resize(theme.width, theme.height);

  video.kill();

  var renderer = getRenderer(theme);

  renderer.backgroundImage(theme.backgroundImageFile || null);

  // Get current caption mode and data from captions editor
  var captionMode = window.captionsEditor ? window.captionsEditor.getMode() : "static";
  var captionToShow = null;
  var timedCaptions = null;
  var speakerNames = null;
  var speakerRecognitionEnabled = false;
  var captionFormatting = null;
  var waveformPositioning = null;
  var waveformConfig = null;
  
  if (captionMode === "auto" && window.captionsEditor) {
    // In auto mode, get timed captions and related data
    timedCaptions = window.captionsEditor.getSegments();
    speakerNames = window.captionsEditor.getSpeakerNames();
    speakerRecognitionEnabled = window.captionsEditor.isSpeakerRecognitionEnabled();
    captionFormatting = window.captionsEditor.getCaptionFormatting();
    waveformPositioning = window.captionsEditor.getWaveformPositioning();
    waveformConfig = window.captionsEditor.getWaveformConfig();
  } else {
    // In static mode, show static caption
    captionToShow = caption;
  }

  renderer.drawFrame(context, {
    caption: captionToShow,
    waveform: sampleWave,
    frame: 0,
    currentTime: 0, // For timed captions, show the first frame
    timedCaptions: timedCaptions,
    speakerNames: speakerNames,
    speakerRecognitionEnabled: speakerRecognitionEnabled,
    captionFormatting: captionFormatting,
    waveformPositioning: waveformPositioning,
    waveformConfig: waveformConfig
  });

}

function loadAudio(f, cb) {

  d3.queue()
    .defer(getWaveform, f)
    .defer(audio.src, f)
    .await(function(err, data){

      if (err) {
        return cb(err);
      }

      file = f;
      minimap.redraw(data.peaks);

      cb(err);

    });

}

module.exports = {
  caption: _caption,
  theme: _theme,
  file: _file,
  selection: _selection,
  loadAudio: loadAudio,
  redraw: redraw
};
