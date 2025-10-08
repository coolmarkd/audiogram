var d3 = require("d3");

// Timed captions editor module
module.exports = function() {

  var segments = [],
      captionMode = "static",
      onUpdate = null,
      previewInterval = null,
      previewTime = 0,
      previewPlaying = false,
      speakerNames = {}, // Map of speaker labels to custom names
      speakerRecognitionEnabled = true, // Whether speaker recognition is enabled
      disfluenciesEnabled = false, // Whether to transcribe disfluencies
      speakerCountType = "auto", // "auto", "minimum", or "exact"
      speakerCountValue = 2, // Number of speakers
      keyterms = [], // Array of keyterms for transcription accuracy
      captionFormatting = {
        global: {
          x: 50,
          y: 85,
          fontSize: 42,
          color: "#ffffff",
          backgroundColor: "#000000",
          backgroundOpacity: 70,
          strokeColor: "#000000",
          strokeWidth: 2
        },
        speakers: {}
      },
      waveformPositioning = {
        x: 50,
        y: 50,
        width: 80,
        height: 20
      },
      waveformConfig = {
        type: "bars",
        color: "#ffffff",
        colorSecondary: "#cccccc",
        backgroundColor: "#000000",
        backgroundOpacity: 0,
        spacing: 1,
        lineWidth: 2,
        dotSize: 3,
        smoothing: 0
      };

  function init(updateCallback) {
    onUpdate = updateCallback;
    
    // Set up event listeners for caption mode toggle
    d3.selectAll("input[name='captionMode']").on("change", function() {
      captionMode = this.value;
      updateUI();
      if (onUpdate) onUpdate();
      
      // Trigger preview redraw when caption mode changes
      if (window.preview && window.preview.redraw) {
        window.preview.redraw();
      }
    });

    // Set up speaker recognition toggle
    d3.select("#enable-speaker-recognition").on("change", function() {
      speakerRecognitionEnabled = this.checked;
      updateSpeakerRecognitionUI();
      if (onUpdate) onUpdate();
    });

    // Set up disfluencies toggle
    d3.select("#enable-disfluencies").on("change", function() {
      disfluenciesEnabled = this.checked;
      if (onUpdate) onUpdate();
    });

    // Set up speaker count type selector
    d3.select("#speaker-count-type").on("change", function() {
      speakerCountType = this.value;
      updateSpeakerCountUI();
      if (onUpdate) onUpdate();
    });

    // Set up speaker count value input
    d3.select("#speaker-count-value").on("input", function() {
      speakerCountValue = +this.value;
      if (onUpdate) onUpdate();
    });

    // Set up keyterms controls
    setupKeytermsControls();

    // Set up formatting tabs
    d3.selectAll(".formatting-tab").on("click", function() {
      var tab = d3.select(this).attr("data-tab");
      switchFormattingTab(tab);
    });

    // Set up caption formatting controls
    setupCaptionFormattingControls();

    // Set up waveform positioning controls
    setupWaveformPositioningControls();

    // Set up waveform configuration controls
    setupWaveformConfigControls();

    // Set up preview update triggers
    setupPreviewUpdateTriggers();

    // Set up transcribe button
    d3.select("#transcribe-btn").on("click", function() {
      d3.event.preventDefault();
      if (onUpdate) onUpdate("transcribe");
    });

    updateUI();
    updateSpeakerRecognitionUI();
    updateSpeakerCountUI();
    
    // Initialize preview
    initPreview();
  }

  function updateUI() {
    var isAuto = captionMode === "auto";
    
    // Show/hide appropriate UI elements
    d3.select("#row-caption").classed("hidden", isAuto);
    d3.select("#captions-editor").classed("hidden", !isAuto);
    
    // Clear static caption when switching to auto mode
    if (isAuto) {
      d3.select("#input-caption").property("value", "");
      // Also clear the preview caption
      if (window.preview) {
        window.preview.caption("");
      }
    }
    
    //if (isAuto) {
      updateSpeakerRecognitionUI();
      updateSpeakerCountUI(); // Also update speaker count UI
    //}
  }

  function updateSpeakerRecognitionUI() {
    var isAuto = captionMode === "auto";
    var speakerEditor = d3.select("#speaker-names-editor");
    var formattingEditor = d3.select("#caption-formatting-editor");
    var waveformEditor = d3.select("#waveform-positioning-editor");
    var speakerCountOptions = d3.select("#speaker-count-options");
    var keytermsSection = d3.select("#keyterms-section");
    
    if (isAuto) {
      formattingEditor.classed("hidden", false);
      waveformEditor.classed("hidden", false);
      keytermsSection.classed("hidden", false);
      speakerCountOptions.classed("hidden", false); // Always show speaker count options in auto mode
      
      if (speakerRecognitionEnabled) {
        speakerEditor.classed("hidden", false);
      } else {
        speakerEditor.classed("hidden", true);
      }
    } else {
      speakerEditor.classed("hidden", true);
      formattingEditor.classed("hidden", true);
      waveformEditor.classed("hidden", true);
      speakerCountOptions.classed("hidden", true);
      keytermsSection.classed("hidden", true);
    }
    
    // Always update speaker count UI after speaker recognition UI changes
    updateSpeakerCountUI();
  }

  function updateSpeakerCountUI() {
    var speakerCountInput = d3.select("#speaker-count-input");
    var speakerCountNote = d3.select("#speaker-count-note");
    
    if (speakerCountType === "auto") {
      speakerCountInput.classed("hidden", true);
    } else {
      speakerCountInput.classed("hidden", false);
      
      if (speakerCountType === "minimum") {
        speakerCountNote.text("Set the minimum number of speakers to detect");
      } else if (speakerCountType === "exact") {
        speakerCountNote.text("Set the exact number of speakers to detect");
      }
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
    
    // Show preview section if we have segments
    var previewSection = document.getElementById('caption-preview-section');
    if (previewSection && segments.length > 0) {
      previewSection.classList.remove('hidden');
    }
    
    // Update main canvas preview
    if (window.preview && window.preview.redraw) {
      window.preview.redraw();
    }
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

  function isDisfluenciesEnabled() {
    return disfluenciesEnabled;
  }

  function getSpeakerCountType() {
    return speakerCountType;
  }

  function getSpeakerCountValue() {
    return speakerCountValue;
  }

  function getKeyterms() {
    return keyterms;
  }

  function switchFormattingTab(tab) {
    // Update tab buttons
    d3.selectAll(".formatting-tab").classed("active", false);
    d3.select(".formatting-tab[data-tab='" + tab + "']").classed("active", true);
    
    // Update panels
    d3.selectAll(".formatting-panel").classed("active", false);
    d3.select("#" + tab + "-formatting").classed("active", true);
  }

  function setupCaptionFormattingControls() {
    // Global caption formatting
    d3.select("#caption-x").on("input", function() {
      captionFormatting.global.x = +this.value;
      d3.select("#caption-x-value").text(this.value + "%");
      if (onUpdate) onUpdate();
    });

    d3.select("#caption-y").on("input", function() {
      captionFormatting.global.y = +this.value;
      d3.select("#caption-y-value").text(this.value + "%");
      if (onUpdate) onUpdate();
    });

    d3.select("#caption-font-size").on("input", function() {
      captionFormatting.global.fontSize = +this.value;
      d3.select("#caption-font-size-value").text(this.value + "px");
      if (onUpdate) onUpdate();
    });

    d3.select("#caption-color").on("change", function() {
      captionFormatting.global.color = this.value;
      if (onUpdate) onUpdate();
    });

    d3.select("#caption-bg-color").on("change", function() {
      captionFormatting.global.backgroundColor = this.value;
      if (onUpdate) onUpdate();
    });

    d3.select("#caption-bg-opacity").on("input", function() {
      captionFormatting.global.backgroundOpacity = +this.value;
      d3.select("#caption-bg-opacity-value").text(this.value + "%");
      if (onUpdate) onUpdate();
    });

    d3.select("#caption-stroke-color").on("change", function() {
      captionFormatting.global.strokeColor = this.value;
      if (onUpdate) onUpdate();
    });

    d3.select("#caption-stroke-width").on("input", function() {
      captionFormatting.global.strokeWidth = +this.value;
      d3.select("#caption-stroke-width-value").text(this.value + "px");
      if (onUpdate) onUpdate();
    });
  }

  function setupWaveformPositioningControls() {
    d3.select("#waveform-x").on("input", function() {
      waveformPositioning.x = +this.value;
      d3.select("#waveform-x-value").text(this.value + "%");
      if (onUpdate) onUpdate();
    });

    d3.select("#waveform-y").on("input", function() {
      waveformPositioning.y = +this.value;
      d3.select("#waveform-y-value").text(this.value + "%");
      if (onUpdate) onUpdate();
    });

    d3.select("#waveform-width").on("input", function() {
      waveformPositioning.width = +this.value;
      d3.select("#waveform-width-value").text(this.value + "%");
      if (onUpdate) onUpdate();
    });

    d3.select("#waveform-height").on("input", function() {
      waveformPositioning.height = +this.value;
      d3.select("#waveform-height-value").text(this.value + "%");
      if (onUpdate) onUpdate();
    });
  }

  function setupWaveformConfigControls() {
    // Set up waveform tabs
    d3.selectAll(".waveform-tab").on("click", function() {
      var tab = d3.select(this).attr("data-tab");
      switchWaveformTab(tab);
    });

    // Waveform type
    d3.select("#waveform-type").on("change", function() {
      waveformConfig.type = this.value;
      if (onUpdate) onUpdate();
    });

    // Colors
    d3.select("#waveform-color").on("change", function() {
      waveformConfig.color = this.value;
      if (onUpdate) onUpdate();
    });

    d3.select("#waveform-color-secondary").on("change", function() {
      waveformConfig.colorSecondary = this.value;
      if (onUpdate) onUpdate();
    });

    d3.select("#waveform-bg-color").on("change", function() {
      waveformConfig.backgroundColor = this.value;
      if (onUpdate) onUpdate();
    });

    d3.select("#waveform-bg-opacity").on("input", function() {
      waveformConfig.backgroundOpacity = +this.value;
      d3.select("#waveform-bg-opacity-value").text(this.value + "%");
      if (onUpdate) onUpdate();
    });

    // Advanced controls
    d3.select("#waveform-spacing").on("input", function() {
      waveformConfig.spacing = +this.value;
      d3.select("#waveform-spacing-value").text(this.value + "px");
      if (onUpdate) onUpdate();
    });

    d3.select("#waveform-line-width").on("input", function() {
      waveformConfig.lineWidth = +this.value;
      d3.select("#waveform-line-width-value").text(this.value + "px");
      if (onUpdate) onUpdate();
    });

    d3.select("#waveform-dot-size").on("input", function() {
      waveformConfig.dotSize = +this.value;
      d3.select("#waveform-dot-size-value").text(this.value + "px");
      if (onUpdate) onUpdate();
    });

    d3.select("#waveform-smoothing").on("input", function() {
      waveformConfig.smoothing = +this.value;
      d3.select("#waveform-smoothing-value").text(this.value + "%");
      if (onUpdate) onUpdate();
    });
  }

  function setupKeytermsControls() {
    // Set up keyterms textarea
    d3.select("#keyterms-text").on("input", function() {
      updateKeytermsFromText();
      updateKeytermsCount();
      if (onUpdate) onUpdate();
    });

    // Set up upload button
    d3.select("#keyterms-upload-btn").on("click", function() {
      d3.select("#keyterms-file-input").node().click();
    });

    // Set up file input
    d3.select("#keyterms-file-input").on("change", function() {
      var file = this.files[0];
      if (file) {
        var reader = new FileReader();
        reader.onload = function(e) {
          d3.select("#keyterms-text").property("value", e.target.result);
          updateKeytermsFromText();
          updateKeytermsCount();
          if (onUpdate) onUpdate();
        };
        reader.readAsText(file);
      }
    });

    // Set up export button
    d3.select("#keyterms-export-btn").on("click", function() {
      exportKeytermsToFile();
    });

    // Set up clear button
    d3.select("#keyterms-clear-btn").on("click", function() {
      d3.select("#keyterms-text").property("value", "");
      updateKeytermsFromText();
      updateKeytermsCount();
      if (onUpdate) onUpdate();
    });

    // Initialize keyterms count
    updateKeytermsCount();
  }

  function updateKeytermsFromText() {
    var text = d3.select("#keyterms-text").property("value");
    keyterms = text.split('\n')
      .map(function(line) { return line.trim(); })
      .filter(function(line) { return line.length > 0; });
  }

  function updateKeytermsCount() {
    var count = keyterms.length;
    var countElement = d3.select("#keyterms-count");
    var countContainer = d3.select(".keyterms-count");
    
    countElement.text(count);
    
    // Update styling based on count
    countContainer.classed("warning", count > 200 && count <= 1000);
    countContainer.classed("error", count > 1000);
  }

  function exportKeytermsToFile() {
    var text = d3.select("#keyterms-text").property("value");
    if (!text.trim()) {
      alert("No keyterms to export");
      return;
    }

    var blob = new Blob([text], { type: 'text/plain' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'keyterms.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function setupPreviewUpdateTriggers() {
    // Trigger main canvas preview redraw when any caption-related setting changes
    var updateMainPreview = function() {
      if (window.preview && window.preview.redraw) {
        window.preview.redraw();
      }
    };

    // Add update triggers to all relevant controls
    d3.selectAll("#caption-formatting-editor input, #caption-formatting-editor select").on("input", updateMainPreview);
    d3.selectAll("#waveform-positioning-editor input, #waveform-positioning-editor select").on("input", updateMainPreview);
    d3.selectAll("#waveform-style input, #waveform-style select").on("input", updateMainPreview);
    d3.select("#enable-speaker-recognition").on("change", updateMainPreview);
    d3.select("#speaker-count-type").on("change", updateMainPreview);
    d3.select("#speaker-count-value").on("input", updateMainPreview);
  }

  function switchWaveformTab(tab) {
    // Update tab buttons
    d3.selectAll(".waveform-tab").classed("active", false);
    d3.select(".waveform-tab[data-tab='" + tab + "']").classed("active", true);
    
    // Update panels
    d3.selectAll(".waveform-panel").classed("active", false);
    d3.select("#waveform-" + tab).classed("active", true);
  }

  function renderSpeakerFormattingEditor() {
    var uniqueSpeakers = getUniqueSpeakers();
    var container = d3.select("#speaker-formatting-list");
    container.html("");

    uniqueSpeakers.forEach(function(speaker) {
      var speakerName = speakerNames[speaker] || speaker;
      
      // Initialize speaker formatting if not exists
      if (!captionFormatting.speakers[speaker]) {
        captionFormatting.speakers[speaker] = {
          x: captionFormatting.global.x,
          y: captionFormatting.global.y,
          fontSize: captionFormatting.global.fontSize,
          color: captionFormatting.global.color,
          backgroundColor: captionFormatting.global.backgroundColor,
          backgroundOpacity: captionFormatting.global.backgroundOpacity
        };
      }

      var item = container.append("div")
        .attr("class", "speaker-formatting-item");

      item.append("h5").text(speakerName);

      // Position controls
      var positionGroup = item.append("div").attr("class", "formatting-group");
      positionGroup.append("label").text("Position");
      var positionControls = positionGroup.append("div").attr("class", "position-controls");

      var xRow = positionControls.append("div").attr("class", "control-row");
      xRow.append("label").text("X Position:");
      var xSlider = xRow.append("input")
        .attr("type", "range")
        .attr("min", 0)
        .attr("max", 100)
        .attr("value", captionFormatting.speakers[speaker].x)
        .attr("step", 1);
      var xValue = xRow.append("span").text(captionFormatting.speakers[speaker].x + "%");

      xSlider.on("input", function() {
        captionFormatting.speakers[speaker].x = +this.value;
        xValue.text(this.value + "%");
        if (onUpdate) onUpdate();
      });

      var yRow = positionControls.append("div").attr("class", "control-row");
      yRow.append("label").text("Y Position:");
      var ySlider = yRow.append("input")
        .attr("type", "range")
        .attr("min", 0)
        .attr("max", 100)
        .attr("value", captionFormatting.speakers[speaker].y)
        .attr("step", 1);
      var yValue = yRow.append("span").text(captionFormatting.speakers[speaker].y + "%");

      ySlider.on("input", function() {
        captionFormatting.speakers[speaker].y = +this.value;
        yValue.text(this.value + "%");
        if (onUpdate) onUpdate();
      });

      // Font controls
      var fontGroup = item.append("div").attr("class", "formatting-group");
      fontGroup.append("label").text("Font");
      var fontControls = fontGroup.append("div").attr("class", "font-controls");

      var sizeRow = fontControls.append("div").attr("class", "control-row");
      sizeRow.append("label").text("Size:");
      var sizeSlider = sizeRow.append("input")
        .attr("type", "range")
        .attr("min", 12)
        .attr("max", 72)
        .attr("value", captionFormatting.speakers[speaker].fontSize)
        .attr("step", 2);
      var sizeValue = sizeRow.append("span").text(captionFormatting.speakers[speaker].fontSize + "px");

      sizeSlider.on("input", function() {
        captionFormatting.speakers[speaker].fontSize = +this.value;
        sizeValue.text(this.value + "px");
        if (onUpdate) onUpdate();
      });

      var colorRow = fontControls.append("div").attr("class", "control-row");
      colorRow.append("label").text("Color:");
      var colorInput = colorRow.append("input")
        .attr("type", "color")
        .attr("value", captionFormatting.speakers[speaker].color);

      colorInput.on("change", function() {
        captionFormatting.speakers[speaker].color = this.value;
        if (onUpdate) onUpdate();
      });

      var bgRow = fontControls.append("div").attr("class", "control-row");
      bgRow.append("label").text("Background:");
      var bgColorInput = bgRow.append("input")
        .attr("type", "color")
        .attr("value", captionFormatting.speakers[speaker].backgroundColor);
      var bgOpacitySlider = bgRow.append("input")
        .attr("type", "range")
        .attr("min", 0)
        .attr("max", 100)
        .attr("value", captionFormatting.speakers[speaker].backgroundOpacity)
        .attr("step", 5);
      var bgOpacityValue = bgRow.append("span").text(captionFormatting.speakers[speaker].backgroundOpacity + "%");

      bgColorInput.on("change", function() {
        captionFormatting.speakers[speaker].backgroundColor = this.value;
        if (onUpdate) onUpdate();
      });

      bgOpacitySlider.on("input", function() {
        captionFormatting.speakers[speaker].backgroundOpacity = +this.value;
        bgOpacityValue.text(this.value + "%");
        if (onUpdate) onUpdate();
      });
    });
  }

  function getCaptionFormatting() {
    return captionFormatting;
  }

  function getWaveformPositioning() {
    return waveformPositioning;
  }

  function getWaveformConfig() {
    return waveformConfig;
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
      .on("blur", function(speaker) {
        var newName = d3.select(this).property("value");
        setSpeakerName(speaker, newName);
        renderSpeakerFormattingEditor(); // Update formatting editor with new names
      });

    // Also render speaker formatting editor
    renderSpeakerFormattingEditor();
  }

  function initPreview() {
    var previewSection = document.getElementById('caption-preview-section');
    var playBtn = document.getElementById('preview-play');
    var pauseBtn = document.getElementById('preview-pause');
    var stopBtn = document.getElementById('preview-stop');
    var timeDisplay = document.getElementById('preview-time');
    var previewCaption = document.getElementById('preview-caption');

    if (!previewSection || !playBtn) return;

    // Show preview section when we have segments
    if (segments.length > 0) {
      previewSection.classList.remove('hidden');
    }

    // Play button
    playBtn.addEventListener('click', function() {
      startPreview();
    });

    // Pause button
    pauseBtn.addEventListener('click', function() {
      pausePreview();
    });

    // Stop button
    stopBtn.addEventListener('click', function() {
      stopPreview();
    });

    // Update preview when formatting changes
    var formattingInputs = document.querySelectorAll('#caption-formatting-editor input, #caption-formatting-editor select');
    formattingInputs.forEach(function(input) {
      input.addEventListener('input', function() {
        if (previewPlaying) {
          updatePreviewCaption();
        }
      });
    });
  }

  function startPreview() {
    if (segments.length === 0) return;

    previewPlaying = true;
    previewTime = 0;
    
    document.getElementById('preview-play').classList.add('hidden');
    document.getElementById('preview-pause').classList.remove('hidden');
    
    updatePreviewCaption();
    
    previewInterval = setInterval(function() {
      previewTime += 0.1;
      updatePreviewCaption();
      updatePreviewTime();
      
      // Stop at end of last segment
      var lastSegment = segments[segments.length - 1];
      if (previewTime > lastSegment.end) {
        stopPreview();
      }
    }, 100);
  }

  function pausePreview() {
    previewPlaying = false;
    clearInterval(previewInterval);
    
    document.getElementById('preview-play').classList.remove('hidden');
    document.getElementById('preview-pause').classList.add('hidden');
  }

  function stopPreview() {
    previewPlaying = false;
    previewTime = 0;
    clearInterval(previewInterval);
    
    document.getElementById('preview-play').classList.remove('hidden');
    document.getElementById('preview-pause').classList.add('hidden');
    
    var previewCaption = document.getElementById('preview-caption');
    if (previewCaption) {
      previewCaption.style.display = 'none';
    }
    
    updatePreviewTime();
  }

  function updatePreviewCaption() {
    var previewCaption = document.getElementById('preview-caption');
    if (!previewCaption) return;

    // Find ALL current segments (support multiple speakers)
    var currentSegments = [];
    for (var i = 0; i < segments.length; i++) {
      if (previewTime >= segments[i].start && previewTime <= segments[i].end) {
        currentSegments.push(segments[i]);
      }
    }

    if (currentSegments.length > 0) {
      // For now, show the first segment in the preview
      // TODO: In the future, we could create multiple preview elements for multiple speakers
      var currentSegment = currentSegments[0];
      
      previewCaption.style.display = 'block';
      
      // Build caption text with speaker name if enabled (matching renderer logic)
      var captionText = currentSegment.text;
      if (speakerRecognitionEnabled && currentSegment.speaker) {
        var speakerName = speakerNames[currentSegment.speaker] || currentSegment.speaker;
        captionText = speakerName + ": " + currentSegment.text;
      }
      
      previewCaption.textContent = captionText;
      
      // Apply formatting
      var formatting = getCaptionFormatting();
      var globalFormatting = formatting.global;
      var speakerFormatting = currentSegment.speaker ? formatting.speakers[currentSegment.speaker] : null;
      
      // Use speaker-specific formatting if available, otherwise global
      var finalFormatting = speakerFormatting || globalFormatting;
      
      previewCaption.style.left = finalFormatting.x + '%';
      previewCaption.style.top = finalFormatting.y + '%';
      previewCaption.style.fontSize = finalFormatting.fontSize + 'px';
      previewCaption.style.color = finalFormatting.color;
      previewCaption.style.backgroundColor = finalFormatting.backgroundColor;
      previewCaption.style.opacity = (finalFormatting.backgroundOpacity / 100);
      
      // Apply stroke if enabled
      if (finalFormatting.strokeWidth > 0) {
        previewCaption.style.webkitTextStroke = finalFormatting.strokeWidth + 'px ' + finalFormatting.strokeColor;
        previewCaption.style.textStroke = finalFormatting.strokeWidth + 'px ' + finalFormatting.strokeColor;
      } else {
        previewCaption.style.webkitTextStroke = 'none';
        previewCaption.style.textStroke = 'none';
      }
    } else {
      previewCaption.style.display = 'none';
    }
  }

  function updatePreviewTime() {
    var timeDisplay = document.getElementById('preview-time');
    if (timeDisplay) {
      timeDisplay.textContent = previewTime.toFixed(1) + 's';
    }
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
    isSpeakerRecognitionEnabled: isSpeakerRecognitionEnabled,
    isDisfluenciesEnabled: isDisfluenciesEnabled,
    getSpeakerCountType: getSpeakerCountType,
    getSpeakerCountValue: getSpeakerCountValue,
    getKeyterms: getKeyterms,
    getCaptionFormatting: getCaptionFormatting,
    getWaveformPositioning: getWaveformPositioning,
    getWaveformConfig: getWaveformConfig,
    initPreview: initPreview,
    startPreview: startPreview,
    pausePreview: pausePreview,
    stopPreview: stopPreview
  };

};

