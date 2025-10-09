var exec = require("child_process").exec;

function combineFrames(options, cb) {

  // Raw ffmpeg command with standard mp4 setup
  // Some old versions of ffmpeg require -strict for the aac codec
  var cmd = "ffmpeg -r " + options.framesPerSecond + " -i \"" + options.framePath + "\" -i \"" + options.audioPath + "\" -c:v libx264 -c:a aac -strict experimental -shortest -pix_fmt yuv420p \"" + options.videoPath + "\"";

  console.log("FFmpeg command:", cmd);
  
  exec(cmd, function(error, stdout, stderr) {
    if (error) {
      console.error("FFmpeg error:", error);
      console.error("FFmpeg stderr:", stderr);
      return cb(error);
    }
    
    console.log("FFmpeg stdout:", stdout);
    if (stderr) {
      console.log("FFmpeg stderr:", stderr);
    }
    
    // Verify the video file was created and has content
    var fs = require("fs");
    try {
      var stats = fs.statSync(options.videoPath);
      if (stats.size === 0) {
        return cb(new Error("Generated video file is empty"));
      }
      console.log("Video file created successfully, size:", stats.size, "bytes");
    } catch (err) {
      return cb(new Error("Video file was not created: " + err.message));
    }
    
    cb(null);
  });

}

module.exports = combineFrames;
