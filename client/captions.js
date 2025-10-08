var d3 = require("d3");

// Timed captions editor module
module.exports = function() {

  var segments = [],
      captionMode = "static",
      onUpdate = null;

  function init(updateCallback) {
    onUpdate = updateCallback;
    
    // Set up event listeners for caption mode toggle
    d3.selectAll("input[name='captionMode']").on("change", function() {
      captionMode = this.value;
      updateUI();
      if (onUpdate) onUpdate();
    });

    // Set up transcribe button
    d3.select("#transcribe-btn").on("click", function() {
      d3.event.preventDefault();
      if (onUpdate) onUpdate("transcribe");
    });

    updateUI();
  }

  function updateUI() {
    var isAuto = captionMode === "auto";
    
    // Show/hide appropriate UI elements
    d3.select("#row-caption").classed("hidden", isAuto);
    d3.select("#captions-editor").classed("hidden", !isAuto);
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
    renderSegments();
  }

  function getSegments() {
    // Collect current values from inputs
    var updated = [];
    d3.selectAll(".caption-segment").each(function(d, i) {
      var text = d3.select(this).select(".caption-text-input").property("value");
      if (segments[i]) {
        updated.push({
          start: segments[i].start,
          end: segments[i].end,
          text: text
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
    renderSegments();
  }

  return {
    init: init,
    setMode: setMode,
    getMode: getMode,
    setSegments: setSegments,
    getSegments: getSegments,
    clear: clear
  };

};

