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

    // Draw waveform with custom positioning and configuration
    if (options.waveform) {
      // Debug: Log waveform data structure
      if (options.frame === 0) { // Only log for first frame to avoid spam
        console.log("Waveform data for frame 0:", {
          hasWaveform: !!options.waveform,
          waveformLength: options.waveform ? options.waveform.length : 0,
          firstPoint: options.waveform && options.waveform[0] ? options.waveform[0] : null,
          positioning: options.waveformPositioning,
          config: options.waveformConfig
        });
      }
      drawWaveformWithConfig(context, options.waveform, theme, options.waveformPositioning, options.waveformConfig);
    } else {
      console.warn("No waveform data provided for frame", options.frame);
    }

    // Render zone boundaries if in preview mode
    if (options.showZoneBoundaries && theme.captionZones) {
      renderZoneBoundaries(context, theme.captionZones, theme);
    }

    // Write the caption (static or timed)
    if (options.timedCaptions && options.currentTime !== undefined) {
      // Find ALL active segments for this time (support multiple speakers)
      var activeSegments = options.timedCaptions.filter(function(seg) {
        return seg.start <= options.currentTime && options.currentTime < seg.end;
      });
      
      if (activeSegments.length > 0) {
        // Render each active segment with its own positioning
        activeSegments.forEach(function(segment) {
          var captionText = null;
          
          // Include speaker name only if speaker recognition is enabled
          if (options.speakerRecognitionEnabled && segment.speaker) {
            if (options.speakerNames && options.speakerNames[segment.speaker]) {
              captionText = options.speakerNames[segment.speaker] + ": " + segment.text;
            } else {
              captionText = segment.speaker + ": " + segment.text;
            }
          } else {
            captionText = segment.text;
          }
          
          if (captionText) {
            // Draw subtitle with custom formatting for this specific segment
            drawSubtitleWithCustomFormatting(context, captionText, options, segment);
          }
        });
      }
      // When timed captions are present, never show static caption
    } else {
      // Only show static caption when no timed captions are provided
      var captionText = options.caption;
      if (captionText) {
        wrapText(context, captionText);
      }
    }

    return this;

  };

  function drawWaveformWithConfig(context, waveform, theme, positioning, config) {
    var width = theme.width || 1280;
    var height = theme.height || 720;
    
    // Use custom positioning or fall back to theme defaults
    var waveformX = (positioning && positioning.x || 50) / 100 * width;
    var waveformY = (positioning && positioning.y || 50) / 100 * height;
    var waveformWidth = (positioning && positioning.width || 80) / 100 * width;
    var waveformHeight = (positioning && positioning.height || 20) / 100 * height;
    
    // Center the waveform
    waveformX -= waveformWidth / 2;
    waveformY -= waveformHeight / 2;
    
    // Apply smoothing if enabled
    var smoothedWaveform = waveform;
    if (config && config.smoothing > 0) {
      smoothedWaveform = smoothWaveform(waveform, config.smoothing);
    }
    
    // Draw background if opacity > 0
    if (config && config.backgroundOpacity > 0) {
      var bgColor = config.backgroundColor || "#000000";
      var bgOpacity = config.backgroundOpacity / 100;
      context.fillStyle = bgColor + Math.round(bgOpacity * 255).toString(16).padStart(2, '0');
      context.fillRect(waveformX, waveformY, waveformWidth, waveformHeight);
    }
    
    // Draw waveform based on type
    var waveformType = (config && config.type) || "bars";
    
    switch (waveformType) {
      case "bars":
        drawBarsWaveform(context, smoothedWaveform, waveformX, waveformY, waveformWidth, waveformHeight, config, theme);
        break;
      case "line":
        drawLineWaveform(context, smoothedWaveform, waveformX, waveformY, waveformWidth, waveformHeight, config, theme);
        break;
      case "area":
        drawAreaWaveform(context, smoothedWaveform, waveformX, waveformY, waveformWidth, waveformHeight, config, theme);
        break;
      case "dots":
        drawDotsWaveform(context, smoothedWaveform, waveformX, waveformY, waveformWidth, waveformHeight, config, theme);
        break;
      case "wave":
        drawWaveWaveform(context, smoothedWaveform, waveformX, waveformY, waveformWidth, waveformHeight, config, theme);
        break;
      default:
        drawBarsWaveform(context, smoothedWaveform, waveformX, waveformY, waveformWidth, waveformHeight, config, theme);
    }
  }

  function smoothWaveform(waveform, smoothingPercent) {
    if (smoothingPercent <= 0) return waveform;
    
    var smoothed = [];
    var smoothingFactor = smoothingPercent / 100;
    
    for (var i = 0; i < waveform.length; i++) {
      var sum = 0;
      var count = 0;
      var radius = Math.ceil(smoothingFactor * 5); // Max 5 samples radius
      
      for (var j = Math.max(0, i - radius); j <= Math.min(waveform.length - 1, i + radius); j++) {
        sum += waveform[j];
        count++;
      }
      
      smoothed[i] = sum / count;
    }
    
    return smoothed;
  }

  function drawBarsWaveform(context, waveform, x, y, width, height, config, theme) {
    var color = (config && config.color) || theme.waveformColor || theme.waveColor || "#ffffff";
    var spacing = (config && config.spacing) || 1;
    
    context.fillStyle = color;
    
    if (!waveform || !Array.isArray(waveform) || waveform.length === 0) {
      console.warn("Invalid waveform data for bars rendering");
      return;
    }
    
    var barWidth = (width - (waveform.length - 1) * spacing) / waveform.length;
    
    waveform.forEach(function(point, i) {
      // Handle both old format (single number) and new format ([rms, midpoint])
      var barValue;
      if (Array.isArray(point)) {
        barValue = point[0]; // Use RMS value for bar height
      } else {
        barValue = point; // Fallback for old format
      }
      
      var barHeight = Math.max(1, barValue * height); // Ensure minimum height of 1px
      var barX = x + (i * (barWidth + spacing));
      var barY = y + (height - barHeight);
      
      context.fillRect(barX, barY, barWidth, barHeight);
    });
  }

  function drawLineWaveform(context, waveform, x, y, width, height, config, theme) {
    var color = (config && config.color) || theme.waveformColor || theme.waveColor || "#ffffff";
    var lineWidth = (config && config.lineWidth) || 2;
    
    context.strokeStyle = color;
    context.lineWidth = lineWidth;
    context.lineCap = "round";
    context.lineJoin = "round";
    
    if (!waveform || !Array.isArray(waveform) || waveform.length === 0) {
      console.warn("Invalid waveform data for line rendering");
      return;
    }
    
    context.beginPath();
    
    waveform.forEach(function(point, i) {
      // Handle both old format (single number) and new format ([rms, midpoint])
      var pointValue;
      if (Array.isArray(point)) {
        pointValue = point[0]; // Use RMS value for line height
      } else {
        pointValue = point; // Fallback for old format
      }
      
      var pointX = x + (i / (waveform.length - 1)) * width;
      var pointY = y + height - (pointValue * height);
      
      if (i === 0) {
        context.moveTo(pointX, pointY);
      } else {
        context.lineTo(pointX, pointY);
      }
    });
    
    context.stroke();
  }

  function drawAreaWaveform(context, waveform, x, y, width, height, config, theme) {
    var color = (config && config.color) || theme.waveformColor || theme.waveColor || "#ffffff";
    var secondaryColor = (config && config.colorSecondary) || "#cccccc";
    
    if (!waveform || !Array.isArray(waveform) || waveform.length === 0) {
      console.warn("Invalid waveform data for area rendering");
      return;
    }
    
    // Draw area fill
    context.fillStyle = color;
    context.beginPath();
    context.moveTo(x, y + height);
    
    waveform.forEach(function(point, i) {
      // Handle both old format (single number) and new format ([rms, midpoint])
      var pointValue;
      if (Array.isArray(point)) {
        pointValue = point[0]; // Use RMS value for area height
      } else {
        pointValue = point; // Fallback for old format
      }
      
      var pointX = x + (i / (waveform.length - 1)) * width;
      var pointY = y + height - (pointValue * height);
      context.lineTo(pointX, pointY);
    });
    
    context.lineTo(x + width, y + height);
    context.closePath();
    context.fill();
    
    // Draw top line
    context.strokeStyle = secondaryColor;
    context.lineWidth = 2;
    context.beginPath();
    
    waveform.forEach(function(point, i) {
      // Handle both old format (single number) and new format ([rms, midpoint])
      var pointValue;
      if (Array.isArray(point)) {
        pointValue = point[0]; // Use RMS value for line height
      } else {
        pointValue = point; // Fallback for old format
      }
      
      var pointX = x + (i / (waveform.length - 1)) * width;
      var pointY = y + height - (pointValue * height);
      
      if (i === 0) {
        context.moveTo(pointX, pointY);
      } else {
        context.lineTo(pointX, pointY);
      }
    });
    
    context.stroke();
  }

  function drawDotsWaveform(context, waveform, x, y, width, height, config, theme) {
    var color = (config && config.color) || theme.waveformColor || theme.waveColor || "#ffffff";
    var dotSize = (config && config.dotSize) || 3;
    
    context.fillStyle = color;
    
    waveform.forEach(function(bar, i) {
      var pointX = x + (i / (waveform.length - 1)) * width;
      var pointY = y + height - ((bar / 255) * height);
      
      context.beginPath();
      context.arc(pointX, pointY, dotSize, 0, 2 * Math.PI);
      context.fill();
    });
  }

  function drawWaveWaveform(context, waveform, x, y, width, height, config, theme) {
    var color = (config && config.color) || theme.waveformColor || theme.waveColor || "#ffffff";
    var lineWidth = (config && config.lineWidth) || 2;
    
    context.strokeStyle = color;
    context.lineWidth = lineWidth;
    context.lineCap = "round";
    context.lineJoin = "round";
    
    // Draw multiple overlapping sine waves for a more complex wave effect
    var numWaves = 3;
    var waveAmplitude = height * 0.3;
    
    for (var wave = 0; wave < numWaves; wave++) {
      context.beginPath();
      var waveColor = color;
      if (wave > 0) {
        // Slightly different colors for overlapping waves
        var opacity = 0.7 - (wave * 0.2);
        waveColor = color + Math.round(opacity * 255).toString(16).padStart(2, '0');
      }
      context.strokeStyle = waveColor;
      
      for (var i = 0; i < waveform.length; i++) {
        var baseX = x + (i / (waveform.length - 1)) * width;
        var baseY = y + height / 2;
        
        // Combine audio data with sine wave
        var audioInfluence = (waveform[i] / 255) * 0.5 + 0.5;
        var sineWave = Math.sin((i / waveform.length) * Math.PI * 2 * (wave + 1)) * waveAmplitude * audioInfluence;
        var pointY = baseY + sineWave;
        
        if (i === 0) {
          context.moveTo(baseX, pointY);
        } else {
          context.lineTo(baseX, pointY);
        }
      }
      
      context.stroke();
    }
  }

  function drawSubtitleWithCustomFormatting(context, text, options, segment) {
    // Save current context state
    context.save();
    
    var theme = options.theme || {};
    var formatting = options.captionFormatting || {};
    var speakerNames = options.speakerNames || {};
    var layoutManager = options.layoutManager;
    
    // Use intelligent layout if available
    if (layoutManager && options.timedCaptions) {
      var activeSegments = options.timedCaptions.filter(function(seg) {
        return seg.start <= options.currentTime && options.currentTime < seg.end;
      });
      
      if (activeSegments.length > 0) {
        var layout = layoutManager.calculateOptimalLayout(activeSegments, theme);
        var segmentLayout = findSegmentLayout(segment, layout);
        
        if (segmentLayout) {
          drawIntelligentCaption(context, text, options, segment, segmentLayout, theme);
          context.restore();
          return;
        }
      }
    }
    
    // Fallback to original positioning logic
    drawLegacyCaption(context, text, options, segment, theme);
    context.restore();
  }
  
  function findSegmentLayout(segment, layout) {
    for (var zoneKey in layout.zones) {
      var zoneSegments = layout.zones[zoneKey];
      for (var i = 0; i < zoneSegments.length; i++) {
        if (zoneSegments[i] === segment) {
          return {
            zone: zoneKey,
            index: i,
            totalInZone: zoneSegments.length
          };
        }
      }
    }
    return null;
  }
  
  function drawIntelligentCaption(context, text, options, segment, segmentLayout, theme) {
    var formatting = options.captionFormatting || {};
    var speakerNames = options.speakerNames || {};
    var captionZones = theme.captionZones || {};
    var captionDefaults = theme.captionDefaults || {};
    var zone = captionZones[segmentLayout.zone];
    
    if (!zone) return;
    
    // Calculate zone dimensions
    var width = theme.width || 1280;
    var height = theme.height || 720;
    var zoneX = (zone.x / 100) * width;
    var zoneY = (zone.y / 100) * height;
    var zoneWidth = (zone.width / 100) * width;
    var zoneHeight = (zone.height / 100) * height;
    
    // Calculate position within zone
    var spacing = zone.spacing || 5;
    var segmentHeight = zoneHeight / (zone.maxSpeakers || 1);
    var y = zoneY + (segmentLayout.index * (segmentHeight + spacing));
    
    // Determine formatting
    var currentFormatting = formatting.global || {};
    var speaker = segment.speaker;
    
    if (speaker && formatting.speakers && formatting.speakers[speaker]) {
      currentFormatting = formatting.speakers[speaker];
    }
    
    // Apply caption defaults
    var bgColor = currentFormatting.backgroundColor || captionDefaults.backgroundColor || "transparent";
    var bgOpacity = currentFormatting.backgroundOpacity !== undefined ? 
      currentFormatting.backgroundOpacity : 
      (captionDefaults.backgroundOpacity !== undefined ? captionDefaults.backgroundOpacity : 0);
    var padding = captionDefaults.padding || 8;
    
    var displayText = text;
    var speakerColor = null;
    
    // Handle speaker prefix and colors
    if (text.indexOf(": ") > 0) {
      var speakerMatch = text.match(/^([^:]+):\s*(.*)$/);
      if (speakerMatch) {
        var speakerName = speakerMatch[1];
        var speakerText = speakerMatch[2];
        
        // Use speaker-specific color or theme color
        if (speaker && formatting.speakers && formatting.speakers[speaker]) {
          speakerColor = formatting.speakers[speaker].color;
        } else if (theme.speakerColors) {
          for (var speakerKey in theme.speakerColors) {
            if (speakerName === speakerKey || speakerName.includes(speakerKey)) {
              speakerColor = theme.speakerColors[speakerKey];
              break;
            }
          }
        }
        
        if (speakerColor) {
          displayText = speakerText;
        }
      }
    }
    
    // Calculate optimal font size
    var maxFontSize = captionDefaults.maxFontSize || 48;
    var minFontSize = captionDefaults.minFontSize || 16;
    var fontSize = currentFormatting.fontSize || maxFontSize;
    
    if (fontSize === "auto" || fontSize > maxFontSize) {
      fontSize = calculateOptimalFontSize(displayText, zoneWidth - (padding * 2), segmentHeight - (padding * 2), context, minFontSize, maxFontSize);
    }
    
    // Set font
    var fontFamily = theme.subtitleFont || theme.captionFont || "Arial";
    context.font = fontSize + "px " + fontFamily;
    context.textAlign = "center";
    context.textBaseline = "middle";
    
    // Calculate text position
    var x = zoneX + (zoneWidth / 2);
    var textY = y + (segmentHeight / 2);
    
    // Wrap text if needed
    var lines = wrapTextToWidth(displayText, zoneWidth - (padding * 2), fontSize, context);
    var lineHeight = fontSize * (captionDefaults.lineSpacing || 1.2);
    var totalTextHeight = lines.length * lineHeight;
    
    // Adjust Y position for multiple lines
    textY = y + (segmentHeight / 2) - (totalTextHeight / 2) + (lineHeight / 2);
    
    // Draw background if opacity > 0
    if (bgOpacity > 0 && bgColor !== "transparent") {
      var bgColorWithOpacity = bgColor + Math.round(bgOpacity * 2.55).toString(16).padStart(2, '0');
      context.fillStyle = bgColorWithOpacity;
      context.fillRect(
        zoneX + padding,
        y + padding,
        zoneWidth - (padding * 2),
        segmentHeight - (padding * 2)
      );
    }
    
    // Draw text lines
    var textColor = currentFormatting.color || theme.subtitleColor || "#fff";
    var strokeWidth = currentFormatting.strokeWidth || captionDefaults.strokeWidth || 0;
    var strokeColor = currentFormatting.strokeColor || captionDefaults.strokeColor || "#000000";
    
    lines.forEach(function(line, index) {
      var lineY = textY + (index * lineHeight);
      
      // Draw stroke if enabled
      if (strokeWidth > 0) {
        context.strokeStyle = strokeColor;
        context.lineWidth = strokeWidth * 2;
        context.strokeText(line, x, lineY);
      }
      
      // Draw speaker name with color if available
      if (speakerColor && index === 0 && text.indexOf(": ") > 0) {
        var speakerMatch = text.match(/^([^:]+):\s*(.*)$/);
        if (speakerMatch) {
          var speakerName = speakerMatch[1];
          var speakerText = speakerMatch[2];
          
          // Draw speaker name with color
          context.fillStyle = speakerColor;
          context.fillText(speakerName + ": ", x, lineY);
          
          // Draw speaker text with default color
          context.fillStyle = textColor;
          var speakerNameWidth = context.measureText(speakerName + ": ").width;
          context.fillText(speakerText, x + speakerNameWidth, lineY);
        }
      } else {
        context.fillStyle = textColor;
        context.fillText(line, x, lineY);
      }
    });
  }
  
  function drawLegacyCaption(context, text, options, segment, theme) {
    var formatting = options.captionFormatting || {};
    var speakerNames = options.speakerNames || {};
    
    // Determine which formatting to use
    var currentFormatting = formatting.global || {};
    var speaker = null;
    
    // Use segment.speaker if available (more reliable than parsing text)
    if (segment && segment.speaker) {
      speaker = segment.speaker;
      // Use speaker-specific formatting if available
      if (formatting.speakers && formatting.speakers[speaker]) {
        currentFormatting = formatting.speakers[speaker];
      }
    } else if (text.indexOf(": ") > 0) {
      // Fallback to parsing text if segment.speaker not available
      var speakerMatch = text.match(/^([^:]+):\s*(.*)$/);
      if (speakerMatch) {
        var speakerName = speakerMatch[1];
        var speakerText = speakerMatch[2];
        
        // Find the speaker key for this name
        for (var speakerKey in speakerNames) {
          if (speakerNames[speakerKey] === speakerName) {
            speaker = speakerKey;
            break;
          }
        }
        
        // Use speaker-specific formatting if available
        if (speaker && formatting.speakers && formatting.speakers[speaker]) {
          currentFormatting = formatting.speakers[speaker];
        }
      }
    }
    
    // Apply formatting
    var padding = theme.subtitlePadding || 10;
    var bgColor = currentFormatting.backgroundColor || theme.subtitleBackgroundColor || "#000000";
    var bgOpacity = currentFormatting.backgroundOpacity || 70;
    var bgColorWithOpacity = bgColor + Math.round(bgOpacity * 2.55).toString(16).padStart(2, '0');
    
    var displayText = text;
    var speakerColor = null;
    
    // Handle speaker prefix
    if (text.indexOf(": ") > 0) {
      var speakerMatch = text.match(/^([^:]+):\s*(.*)$/);
      if (speakerMatch) {
        var speakerName = speakerMatch[1];
        var speakerText = speakerMatch[2];
        
        // Use speaker-specific color or theme color
        if (speaker && formatting.speakers && formatting.speakers[speaker]) {
          speakerColor = formatting.speakers[speaker].color;
        } else if (theme.speakerColors) {
          // Find matching speaker color in theme
          for (var speakerKey in theme.speakerColors) {
            if (speakerName === speakerKey || speakerName.includes(speakerKey)) {
              speakerColor = theme.speakerColors[speakerKey];
              break;
            }
          }
        }
        
        if (speakerColor) {
          displayText = speakerText; // Remove speaker name from text, we'll draw it separately
        }
      }
    }
    
    // Calculate position
    var width = theme.width || 1280;
    var height = theme.height || 720;
    var x = (currentFormatting.x || 50) / 100 * width;
    var y = (currentFormatting.y || 85) / 100 * height;
    
    // Set font
    var fontSize = currentFormatting.fontSize || 42;
    var fontFamily = theme.subtitleFont || theme.captionFont || "Arial";
    context.font = fontSize + "px " + fontFamily;
    context.textAlign = "center";
    context.textBaseline = "middle";
    
    // Measure text
    var textMetrics = context.measureText(displayText);
    var textWidth = textMetrics.width;
    var textHeight = fontSize;
    
    // Draw background rectangle only if opacity > 0
    if (bgOpacity > 0) {
      context.fillStyle = bgColorWithOpacity;
      context.fillRect(
        x - textWidth / 2 - padding,
        y - textHeight / 2 - padding,
        textWidth + padding * 2,
        textHeight + padding * 2
      );
    }
    
    // Draw speaker name with color if available
    if (speakerColor && text.indexOf(": ") > 0) {
      var speakerMatch = text.match(/^([^:]+):\s*(.*)$/);
      if (speakerMatch) {
        var speakerName = speakerMatch[1];
        var speakerText = speakerMatch[2];
        
        // Draw speaker name in color
        context.fillStyle = speakerColor;
        context.font = fontSize + "px " + fontFamily;
        context.textAlign = "center";
        context.textBaseline = "middle";
        
        var speakerY = y - fontSize - 5; // Position above main text
        
        // Draw speaker name stroke if enabled
        var strokeWidth = currentFormatting.strokeWidth || 0;
        var strokeColor = currentFormatting.strokeColor || "#000000";
        if (strokeWidth > 0) {
          context.strokeStyle = strokeColor;
          context.lineWidth = strokeWidth * 2; // Canvas stroke is centered, so double for full width
          context.strokeText(speakerName + ":", x, speakerY);
        }
        
        context.fillText(speakerName + ":", x, speakerY);
        
        // Draw main text in normal color
        context.fillStyle = currentFormatting.color || theme.subtitleColor || "#fff";
        
        // Draw main text stroke if enabled
        if (strokeWidth > 0) {
          context.strokeStyle = strokeColor;
          context.lineWidth = strokeWidth * 2;
          context.strokeText(speakerText, x, y);
        }
        
        context.fillText(speakerText, x, y);
      } else {
        context.fillStyle = currentFormatting.color || theme.subtitleColor || "#fff";
        
        // Draw stroke if enabled
        if (strokeWidth > 0) {
          context.strokeStyle = strokeColor;
          context.lineWidth = strokeWidth * 2;
          context.strokeText(displayText, x, y);
        }
        
        context.fillText(displayText, x, y);
      }
    } else {
      // Draw the subtitle text normally
      context.fillStyle = currentFormatting.color || theme.subtitleColor || "#fff";
      
      // Draw stroke if enabled
      var strokeWidth = currentFormatting.strokeWidth || 0;
      var strokeColor = currentFormatting.strokeColor || "#000000";
      if (strokeWidth > 0) {
        context.strokeStyle = strokeColor;
        context.lineWidth = strokeWidth * 2;
        context.strokeText(displayText, x, y);
      }
      
      context.fillText(displayText, x, y);
    }
  }
  
  function calculateOptimalFontSize(text, maxWidth, maxHeight, context, minFontSize, maxFontSize) {
    var words = text.split(' ');
    var fontSize = maxFontSize;
    var fits = false;
    
    while (fontSize >= minFontSize && !fits) {
      var lines = wrapTextToWidth(text, maxWidth, fontSize, context);
      var lineHeight = fontSize * 1.2;
      var totalHeight = lines.length * lineHeight;
      
      if (totalHeight <= maxHeight) {
        fits = true;
      } else {
        fontSize -= 2;
      }
    }
    
    return Math.max(fontSize, minFontSize);
  }
  
  function wrapTextToWidth(text, maxWidth, fontSize, context) {
    var words = text.split(' ');
    var lines = [];
    var currentLine = [];
    
    words.forEach(function(word) {
      var testLine = [...currentLine, word].join(' ');
      context.font = fontSize + "px Arial";
      var metrics = context.measureText(testLine);
      
      if (metrics.width <= maxWidth) {
        currentLine.push(word);
      } else {
        if (currentLine.length > 0) {
          lines.push(currentLine.join(' '));
          currentLine = [word];
        } else {
          lines.push(word);
        }
      }
    });
    
    if (currentLine.length > 0) {
      lines.push(currentLine.join(' '));
    }
    
    return lines;
  }
  
  function renderZoneBoundaries(context, captionZones, theme) {
    context.save();
    
    var width = theme.width || 1280;
    var height = theme.height || 720;
    
    Object.keys(captionZones).forEach(function(zoneKey) {
      var zone = captionZones[zoneKey];
      var x = (zone.x / 100) * width;
      var y = (zone.y / 100) * height;
      var zoneWidth = (zone.width / 100) * width;
      var zoneHeight = (zone.height / 100) * height;
      
      // Draw zone boundary
      context.strokeStyle = '#00ff00';
      context.lineWidth = 2;
      context.setLineDash([5, 5]);
      context.strokeRect(x, y, zoneWidth, zoneHeight);
      
      // Draw zone label
      context.fillStyle = '#00ff00';
      context.font = '12px Arial';
      context.textAlign = 'left';
      context.textBaseline = 'top';
      context.fillText(zoneKey, x + 5, y + 5);
      
      // Draw zone info
      var info = 'Max: ' + (zone.maxSpeakers || 1) + ' speakers';
      context.fillText(info, x + 5, y + 20);
    });
    
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
