var probe = require("../lib/probe.js"),
    d3 = require("d3"),
    pcmStream = require("../lib/pcm.js");

function getWaveform(filename, options, cb) {

  var stream = pcmStream(filename, {
        channels: options.channels
      }),
      samples = [],
      maxSamples = 5000000, // 5 million samples limit (~3 minutes at 44.1kHz)
      sampleSkip = 1, // Start with no skipping
      sampleCount = 0;

  // For very long files, we need to downsample to avoid memory issues
  // Calculate if we need to skip samples based on estimated duration
  var estimatedSamples = options.numFrames * options.samplesPerFrame * 100; // Rough estimate
  if (estimatedSamples > maxSamples) {
    sampleSkip = Math.ceil(estimatedSamples / maxSamples);
    console.log("Long audio file detected. Downsampling by factor of", sampleSkip, "to prevent memory issues.");
  }

  stream.on("data",function(sample, channel){

    // Skip samples for downsampling
    if (sampleCount % sampleSkip !== 0) {
      sampleCount++;
      return;
    }

    // Check memory limit to prevent crashes on very long files
    if (samples.length >= maxSamples) {
      console.warn("Audio file too long for full waveform analysis. Using downsampled version.");
      stream.destroy();
      // Process what we have so far
      var processed = processSamples(samples, options.numFrames, options.samplesPerFrame);
      return cb(null, processed);
    }

    // Average multiple channels
    if (channel > 0) {
      samples[samples.length - 1] = ((samples[samples.length - 1] * channel) + sample) / (channel + 1);
    } else {
      samples.push(sample);
    }

    sampleCount++;

  });

  stream.on("error", cb);

  stream.on("end", function(output){
    var processed = processSamples(samples, options.numFrames, options.samplesPerFrame);
    return cb(null, processed);
  });

}

function processSamples(samples, numFrames, samplesPerFrame) {

  // TODO spread out slop across frames
  var perFrame = Math.floor(samples.length / numFrames),
      perPoint = Math.floor(perFrame / samplesPerFrame),
      range = d3.range(samplesPerFrame),
      maxFrame,
      maxRms = maxMid = 0;

  var unadjusted = d3.range(numFrames).map(function(frame){

    var frameSamples = samples.slice(frame * perFrame, (frame + 1) * perFrame),
        points = range.map(function(point){

          var pointSamples = frameSamples.slice(point * perPoint, (point + 1) * perPoint),
              midpoint = pointSamples[Math.floor(pointSamples.length / 2)];

          var rms = Math.sqrt(d3.sum(pointSamples.map(function(d){
            return d * d;
          })) / perPoint);

          if (rms > maxRms) {
            maxRms = rms;
            maxFrame = frame;
          }

          if (Math.abs(midpoint) > maxMid) {
            maxMid = Math.abs(midpoint);
          }

          // Min value, max value, and midpoint value
          return [rms, midpoint];

        });

    return points;

  });

  var adjusted = unadjusted.map(function(frame){
    return frame.map(function(point){
      return [
        point[0] / maxRms,
        point[1] / maxMid
      ];
    });
  });

  // Make first and last frame peaky
  adjusted[0] = adjusted[numFrames - 1] = adjusted[maxFrame];

  return adjusted;

}

module.exports = getWaveform;
