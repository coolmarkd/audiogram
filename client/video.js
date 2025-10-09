var d3 = require("d3");

var video = document.querySelector("video");

// Debug: Check if video element was found
if (!video) {
  console.error("Video element not found in DOM!");
  console.log("Available video elements:", document.querySelectorAll("video"));
  console.log("Document ready state:", document.readyState);
} else {
  console.log("Video element found:", video);
  console.log("Video element parent:", video.parentElement);
}

function kill() {

  // Pause the video if it's playing
  if (!video.paused && !video.ended && 0 < video.currentTime) {
    video.pause();
  }

  d3.select("body").classed("rendered", false);

}

function update(url, name) {

  var timestamp = d3.timeFormat(" - %Y-%m-%d at %-I.%M%p")(new Date).toLowerCase(),
      filename = (name || "Audiogram") + timestamp + ".mp4";

  console.log("Video update called with URL:", url);
  console.log("Download filename:", filename);
  console.log("Current body classes:", document.body.className);
  
  // Check if video element exists, try to find it again if not found
  if (!video) {
    console.warn("Video element not found initially, trying to find it again...");
    video = document.querySelector("video");
    if (!video) {
      console.error("Video element still not found!");
      return;
    }
    console.log("Video element found on retry:", video);
  }
  
  // Check if URL is valid
  if (!url || url === "undefined" || url === "null") {
    console.error("Invalid video URL:", url);
    return;
  }
  
  // Ensure the body has the 'rendered' class to show the video
  if (!document.body.classList.contains('rendered')) {
    console.log("Adding 'rendered' class to body");
    document.body.classList.add('rendered');
  }

  d3.select("#download")
    .attr("download", filename)
    .attr("href", url)
    .on("click", function(e) {
      // Fallback for download if the download attribute doesn't work
      if (!this.download || this.download === "") {
        e.preventDefault();
        console.log("Download attribute not working, opening in new tab");
        window.open(url, '_blank');
      }
    });

  var sourceElement = d3.select(video).select("source");
  if (sourceElement.empty()) {
    console.error("Video source element not found!");
    return;
  }
  sourceElement.attr("src", url);
  
  // Also set the src directly on the video element as a fallback
  video.src = url;
  console.log("Set video src to:", url);
    
  // Debug: Verify the elements were updated
  setTimeout(function() {
    var downloadElement = document.getElementById("download");
    var videoSource = video.querySelector("source");
    var videoElement = document.getElementById("video");
    
    console.log("Video Update Debug:");
    console.log("- Body classes:", document.body.className);
    console.log("- Video element display style:", videoElement ? window.getComputedStyle(videoElement).display : "not found");
    console.log("- Video element visibility:", videoElement ? window.getComputedStyle(videoElement).visibility : "not found");
    console.log("- Video element opacity:", videoElement ? window.getComputedStyle(videoElement).opacity : "not found");
    console.log("- Download element href:", downloadElement ? downloadElement.href : "not found");
    console.log("- Download element download attr:", downloadElement ? downloadElement.getAttribute("download") : "not found");
    console.log("- Download element display style:", downloadElement ? window.getComputedStyle(downloadElement).display : "not found");
    console.log("- Video source src:", videoSource ? videoSource.src : "not found");
    console.log("- Video element:", video);
    console.log("- Video readyState:", video.readyState);
    console.log("- Video element visible:", videoElement && window.getComputedStyle(videoElement).display !== "none");
    console.log("- All video elements in DOM:", document.querySelectorAll("video"));
    console.log("- All elements with id 'video':", document.querySelectorAll("#video"));
  }, 50);

  // Add error handling for video loading
  video.addEventListener('error', function(e) {
    console.error("Video loading error:", e);
    console.error("Video error details:", video.error);
  });

  video.addEventListener('loadeddata', function() {
    console.log("Video loaded successfully, duration:", video.duration);
  });

  video.addEventListener('canplay', function() {
    console.log("Video can play");
  });

  video.load();
  
  // Try to play, but don't fail if autoplay is blocked
  video.play().catch(function(error) {
    console.log("Autoplay blocked or failed:", error);
  });

}

module.exports = {
  kill: kill,
  update: update
}
