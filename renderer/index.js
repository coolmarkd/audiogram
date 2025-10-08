var d3 = require("d3"),
    patterns = require("./patterns.js"),
    textWrapper = require("./text-wrapper.js");

module.exports = function(t) {

  var renderer = {},
      backgroundImage,
      wrapText,
      wrapSubtitle,
      theme;

  renderer.backgroundImage = function(_) {
    if (!arguments.length) return backgroundImage;
    backgroundImage = _;
    return this;
  };

  renderer.theme = function(_) {
    if (!arguments.length) return theme;

    theme = _;

    // Default colors
    theme.backgroundColor = theme.backgroundColor || "#fff";
    theme.waveColor = theme.waveColor || theme.foregroundColor || "#000";
    theme.captionColor = theme.captionColor || theme.foregroundColor || "#000";

    // Default wave dimensions
    if (typeof theme.waveTop !== "number") theme.waveTop = 0;
    if (typeof theme.waveBottom !== "number") theme.waveBottom = theme.height;
    if (typeof theme.waveLeft !== "number") theme.waveLeft = 0;
    if (typeof theme.waveRight !== "number") theme.waveRight = theme.width;

    wrapText = textWrapper(theme);
    
    // Create subtitle wrapper with different styling
    var subtitleTheme = Object.assign({}, theme, {
      captionFont: theme.subtitleFont || theme.captionFont,
      captionLineHeight: theme.subtitleLineHeight || theme.captionLineHeight,
      captionLineSpacing: theme.subtitleLineSpacing || theme.captionLineSpacing,
      captionLeft: theme.subtitleLeft || theme.captionLeft,
      captionRight: theme.subtitleRight || theme.captionRight,
      captionTop: null,
      captionBottom: theme.subtitleBottom || theme.captionBottom,
      captionAlign: theme.subtitleAlign || "center",
      captionColor: theme.subtitleColor || "#fff"
    });
    wrapSubtitle = textWrapper(subtitleTheme);

    return this;
  };

  // Draw the frame
  renderer.drawFrame = function(context, options){

    context.patternQuality = "best";

    // Draw the background image and/or background color
    context.clearRect(0, 0, theme.width, theme.height);

    context.fillStyle = theme.backgroundColor;
    context.fillRect(0, 0, theme.width, theme.height);

    if (backgroundImage) {
      context.drawImage(backgroundImage, 0, 0, theme.width, theme.height);
    }

    patterns[theme.pattern || "wave"](context, options.waveform, theme);

    // Write the caption (static or timed)
    var captionText = options.caption;
    var useSubtitleStyle = false;
    
    // If timed captions are provided, find the one for this frame
    if (options.timedCaptions && options.currentTime !== undefined) {
      var segment = options.timedCaptions.find(function(seg) {
        return seg.start <= options.currentTime && options.currentTime < seg.end;
      });
      if (segment) {
        // Include speaker name if available and speaker recognition is enabled
        if (segment.speaker && options.speakerNames && options.speakerNames[segment.speaker]) {
          captionText = options.speakerNames[segment.speaker] + ": " + segment.text;
        } else if (segment.speaker) {
          captionText = segment.speaker + ": " + segment.text;
        } else {
          captionText = segment.text;
        }
        useSubtitleStyle = true;
      } else {
        captionText = null;
      }
    }
    
    if (captionText) {
      if (useSubtitleStyle) {
        // Draw subtitle with background
        drawSubtitleWithBackground(context, captionText);
      } else {
        wrapText(context, captionText);
      }
    }

    return this;

  };

  function drawSubtitleWithBackground(context, text) {
    // Save current context state
    context.save();
    
    // Measure text to create background box
    var padding = theme.subtitlePadding || 10;
    var bgColor = theme.subtitleBackgroundColor || "rgba(0,0,0,0.7)";
    
    // Check if text has speaker prefix and apply color
    var speakerColor = null;
    var displayText = text;
    
    if (text.indexOf(": ") > 0 && theme.speakerColors) {
      var speakerMatch = text.match(/^([^:]+):\s*(.*)$/);
      if (speakerMatch) {
        var speakerName = speakerMatch[1];
        var speakerText = speakerMatch[2];
        
        // Find matching speaker color
        for (var speakerKey in theme.speakerColors) {
          if (speakerName === speakerKey || speakerName.includes(speakerKey)) {
            speakerColor = theme.speakerColors[speakerKey];
            break;
          }
        }
        
        if (speakerColor) {
          displayText = speakerText; // Remove speaker name from text, we'll draw it separately
        }
      }
    }
    
    // Use subtitle wrapper to get text metrics and draw
    // First, we need to measure the text
    var lines = measureSubtitleLines(context, displayText);
    
    if (lines.length === 0) {
      context.restore();
      return;
    }
    
    // Calculate background dimensions
    var maxWidth = lines.maxWidth;
    var totalHeight = lines.totalHeight;
    var x = lines.x;
    var y = lines.y;
    
    // Draw background rectangle
    context.fillStyle = bgColor;
    context.fillRect(
      x - maxWidth / 2 - padding,
      y - padding,
      maxWidth + padding * 2,
      totalHeight + padding * 2
    );
    
    // Draw speaker name with color if available
    if (speakerColor && text.indexOf(": ") > 0) {
      var speakerMatch = text.match(/^([^:]+):\s*(.*)$/);
      if (speakerMatch) {
        var speakerName = speakerMatch[1];
        var speakerText = speakerMatch[2];
        
        // Draw speaker name in color
        context.fillStyle = speakerColor;
        context.font = theme.subtitleFont || theme.captionFont;
        context.textAlign = "center";
        context.textBaseline = "top";
        
        var speakerY = y - 20; // Position above main text
        context.fillText(speakerName + ":", x, speakerY);
        
        // Draw main text in normal color
        context.fillStyle = theme.subtitleColor || "#fff";
        wrapSubtitle(context, speakerText);
      } else {
        wrapSubtitle(context, displayText);
      }
    } else {
      // Draw the subtitle text normally
      wrapSubtitle(context, displayText);
    }
    
    context.restore();
  }
  
  function measureSubtitleLines(context, text) {
    var subtitleLeft = theme.subtitleLeft || theme.captionLeft || 0;
    var subtitleRight = theme.subtitleRight || theme.captionRight || theme.width;
    var subtitleBottom = theme.subtitleBottom || theme.captionBottom || theme.height;
    var captionWidth = subtitleRight - subtitleLeft;
    var lineHeight = theme.subtitleLineHeight || theme.captionLineHeight || 42;
    var lineSpacing = theme.subtitleLineSpacing || theme.captionLineSpacing || 5;
    
    context.font = theme.subtitleFont || theme.captionFont;
    
    var words = text.trim().replace(/\s\s+/g, " \n").split(/ /g);
    var lines = [[]];
    var maxWidth = 0;
    
    words.forEach(function(word) {
      var width = context.measureText(lines[lines.length - 1].concat([word]).join(" ")).width;
      
      if (word[0] === "\n" || (lines[lines.length - 1].length && width > captionWidth)) {
        word = word.trim();
        lines.push([word]);
        width = context.measureText(word).width;
      } else {
        lines[lines.length - 1].push(word);
      }
      
      maxWidth = Math.max(maxWidth, width);
    });
    
    var totalHeight = lines.length * lineHeight + (lines.length - 1) * lineSpacing;
    var x = (subtitleLeft + subtitleRight) / 2;
    var y = subtitleBottom - totalHeight;
    
    return {
      lines: lines,
      maxWidth: maxWidth,
      totalHeight: totalHeight,
      x: x,
      y: y
    };
  }

  if (t) {
    renderer.theme(t);
  }

  return renderer;

}
