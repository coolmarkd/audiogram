var d3 = require("d3");

// Timed captions editor module
module.exports = function() {

  var segments = [],
      captionMode = "static",
      onUpdate = null,
      speakerNames = {}, // Map of speaker labels to custom names
      speakerRecognitionEnabled = true; // Whether speaker recognition is enabled

  function init(updateCallback) {
    onUpdate = updateCallback;
    
    // Set up event listeners for caption mode toggle
    d3.selectAll("input[name='captionMode']").on("change", function() {
      captionMode = this.value;
      updateUI();
      if (onUpdate) onUpdate();
    });

    // Set up speaker recognition toggle
    d3.select("#enable-speaker-recognition").on("change", function() {
      speakerRecognitionEnabled = this.checked;
      updateSpeakerRecognitionUI();
      if (onUpdate) onUpdate();
    });

    // Set up transcribe button
    d3.select("#transcribe-btn").on("click", function() {
      d3.event.preventDefault();
      if (onUpdate) onUpdate("transcribe");
    });

    updateUI();
    updateSpeakerRecognitionUI();
  }

  function updateUI() {
    var isAuto = captionMode === "auto";
    
    // Show/hide appropriate UI elements
    d3.select("#row-caption").classed("hidden", isAuto);
    d3.select("#captions-editor").classed("hidden", !isAuto);
    if (isAuto) {
      updateSpeakerRecognitionUI();
    }
  }

  function updateSpeakerRecognitionUI() {
    var isAuto = captionMode === "auto";
    var speakerEditor = d3.select("#speaker-names-editor");
    
    if (isAuto && speakerRecognitionEnabled) {
      speakerEditor.classed("hidden", false);
    } else {
      speakerEditor.classed("hidden", true);
    }
  }

  function setMode(mode) {
    captionMode = mode;
    d3.select("input[name='captionMode'][value='" + mode + "']").property("checked", true);
    updateUI();
  }

  function getMode() {
    return captionMode;
  }

  function setSegments(newSegments) {
    segments = newSegments || [];
    
    // Extract unique speakers and set default names
    var uniqueSpeakers = {};
    segments.forEach(function(seg) {
      if (seg.speaker) {
        uniqueSpeakers[seg.speaker] = uniqueSpeakers[seg.speaker] || seg.speaker;
      }
    });
    
    // Initialize speaker names if not already set
    Object.keys(uniqueSpeakers).forEach(function(speaker) {
      if (!speakerNames[speaker]) {
        speakerNames[speaker] = speaker;
      }
    });
    
    renderSegments();
  }

  function getSegments() {
    // Collect current values from inputs
    var updated = [];
    d3.selectAll(".caption-segment").each(function(d, i) {
      var text = d3.select(this).select(".caption-text-input").property("value");
      var speakerSelect = d3.select(this).select(".speaker-select");
      var speaker = speakerSelect ? speakerSelect.property("value") : segments[i].speaker;
      
      if (segments[i]) {
        updated.push({
          start: segments[i].start,
          end: segments[i].end,
          text: text,
          speaker: speaker
        });
      }
    });
    return updated;
  }

  function renderSegments() {
    var container = d3.select("#captions-list");
    container.html("");

    if (!segments || segments.length === 0) {
      container.append("div")
        .attr("id", "captions-empty")
        .text("No captions yet. Click 'Generate Captions' to transcribe audio.");
      return;
    }

    // Render speaker names editor if speakers exist
    renderSpeakerNamesEditor();

    var segmentDivs = container.selectAll(".caption-segment")
      .data(segments)
      .enter()
      .append("div")
      .attr("class", "caption-segment");

    // Timestamp display
    segmentDivs.append("div")
      .attr("class", "caption-timestamp")
      .text(function(d) {
        return formatTime(d.start) + " → " + formatTime(d.end);
      });

    // Speaker selector (if speaker data exists)
    var speakerSelects = segmentDivs.append("select")
      .attr("class", "speaker-select")
      .style("display", function(d) { return d.speaker ? "block" : "none"; })
      .on("change", function() {
        if (onUpdate) onUpdate();
      });

    // Populate speaker options
    speakerSelects.selectAll("option")
      .data(function(d) {
        var speakers = Object.keys(speakerNames);
        return speakers.map(function(speaker) {
          return { value: speaker, text: speakerNames[speaker] };
        });
      })
      .enter()
      .append("option")
      .attr("value", function(d) { return d.value; })
      .text(function(d) { return d.text; });

    // Set selected speaker
    speakerSelects.property("value", function(d) { return d.speaker || ""; });

    // Text input
    segmentDivs.append("input")
      .attr("type", "text")
      .attr("class", "caption-text-input")
      .property("value", function(d) { return d.text; })
      .on("input", function() {
        if (onUpdate) onUpdate();
      });

    // Actions (delete button)
    var actions = segmentDivs.append("div")
      .attr("class", "caption-actions");

    actions.append("button")
      .attr("class", "delete-segment")
      .html('<i class="fa fa-trash"></i>')
      .on("click", function(d, i) {
        d3.event.preventDefault();
        deleteSegment(i);
      });
  }

  function deleteSegment(index) {
    segments.splice(index, 1);
    renderSegments();
    if (onUpdate) onUpdate();
  }

  function formatTime(seconds) {
    var mins = Math.floor(seconds / 60);
    var secs = Math.floor(seconds % 60);
    var ms = Math.floor((seconds % 1) * 10);
    return mins + ":" + pad(secs, 2) + "." + ms;
  }

  function pad(num, size) {
    var s = num + "";
    while (s.length < size) s = "0" + s;
    return s;
  }

  function clear() {
    segments = [];
    speakerNames = {};
    renderSegments();
  }

  function getSpeakerNames() {
    return speakerNames;
  }

  function setSpeakerName(speakerLabel, customName) {
    speakerNames[speakerLabel] = customName;
    renderSegments(); // Re-render to update speaker names
  }

  function getUniqueSpeakers() {
    if (!speakerRecognitionEnabled) {
      return [];
    }
    
    var speakers = {};
    segments.forEach(function(seg) {
      if (seg.speaker) {
        speakers[seg.speaker] = true;
      }
    });
    return Object.keys(speakers);
  }

  function isSpeakerRecognitionEnabled() {
    return speakerRecognitionEnabled;
  }

  function renderSpeakerNamesEditor() {
    var uniqueSpeakers = getUniqueSpeakers();
    var speakerEditor = d3.select("#speaker-names-editor");
    
    if (uniqueSpeakers.length === 0) {
      speakerEditor.classed("hidden", true);
      return;
    }
    
    speakerEditor.classed("hidden", false);
    
    var speakerList = speakerEditor.select("#speaker-names-list");
    speakerList.html("");
    
    var speakerItems = speakerList.selectAll(".speaker-name-item")
      .data(uniqueSpeakers)
      .enter()
      .append("div")
      .attr("class", "speaker-name-item");
    
    speakerItems.append("span")
      .attr("class", "speaker-label")
      .text(function(speaker) { return speaker + ":"; });
    
    speakerItems.append("input")
      .attr("type", "text")
      .attr("class", "speaker-name-input")
      .property("value", function(speaker) { return speakerNames[speaker] || speaker; })
      .on("input", function(speaker) {
        var newName = d3.select(this).property("value");
        setSpeakerName(speaker, newName);
      });
  }

  return {
    init: init,
    setMode: setMode,
    getMode: getMode,
    setSegments: setSegments,
    getSegments: getSegments,
    clear: clear,
    getSpeakerNames: getSpeakerNames,
    setSpeakerName: setSpeakerName,
    getUniqueSpeakers: getUniqueSpeakers,
    isSpeakerRecognitionEnabled: isSpeakerRecognitionEnabled
  };

};

