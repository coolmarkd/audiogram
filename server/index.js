// Dependencies
var express = require("express"),
    compression = require("compression"),
    path = require("path"),
    multer = require("multer"),
    uuid = require("uuid"),
    { mkdirp } = require("mkdirp");

// Routes and middleware
var logger = require("../lib/logger/"),
    render = require("./render.js"),
    status = require("./status.js"),
    fonts = require("./fonts.js"),
    errorHandlers = require("./error.js"),
    transcribe = require("../lib/transcribe.js");

// Settings
var serverSettings = require("../lib/settings/");

var app = express();

app.use(compression());
app.use(logger.morgan());

// Options for where to store uploaded audio and max size
var fileOptions = {
  storage: multer.diskStorage({
    destination: async function(req, file, cb) {

      var dir = path.join(serverSettings.workingDirectory, uuid.v1());

      try {
        await mkdirp(dir);
        return cb(null, dir);
      } catch (err) {
        return cb(err, dir);
      }
    },
    filename: function(req, file, cb) {
      cb(null, "audio");
    }
  })
};

if (serverSettings.maxUploadSize) {
  fileOptions.limits = {
    fileSize: +serverSettings.maxUploadSize
  };
}

// On submission, check upload, validate input, and start generating a video
app.post("/submit/", [multer(fileOptions).single("audio"), render.validate, render.route]);

// If not using S3, serve videos locally
if (!serverSettings.s3Bucket) {
  app.use("/video/", express.static(path.join(serverSettings.storagePath, "video")));
}

// Serve custom fonts
app.get("/fonts/fonts.css", fonts.css);
app.get("/fonts/fonts.js", fonts.js);

if (serverSettings.fonts) {
  app.get("/fonts/:font", fonts.font);
}

// Check the status of a current video
app.get("/status/:id/", status);

// Transcribe audio file
app.post("/transcribe/:id/", function(req, res) {
  var id = req.params.id;
  var audioPath = path.join(serverSettings.workingDirectory, id, "audio");
  
  console.log("Transcription requested for:", id);
  
  transcribe.transcribe(audioPath, req.body, function(err, segments) {
    if (err) {
      console.error("Transcription error:", err);
      return res.status(500).json({ error: err.message || "Transcription failed" });
    }
    
    console.log("Transcription complete:", segments.length, "segments");
    res.json({ segments: segments });
  });
});

// Serve configuration for client-side JavaScript
app.get("/config.json", function(req, res) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  
  var port = process.env.PORT || 8888;
  var host = req.get('host');
  
  // If host doesn't include port, add it
  if (host && !host.includes(':')) {
    host = host + ':' + port;
  }
  
  // Fallback if host is not available
  if (!host) {
    host = 'localhost:' + port;
  }
  
  var config = {
    port: port,
    host: host,
    protocol: req.protocol || 'http'
  };
  
  console.log("Config.json requested, returning:", config);
  res.json(config);
});

// Serve background images and themes JSON statically
app.use("/settings/", function(req, res, next) {

  // Limit to themes.json and bg images
  if (req.url.match(/^\/?themes.json$/i) || req.url.match(/^\/?backgrounds\/[^/]+$/i)) {
    return next();
  }

  return res.status(404).send("Cannot GET " + path.join("/settings", req.url));

}, express.static(path.join(__dirname, "..", "settings")));

// Serve editor files statically
app.use(express.static(path.join(__dirname, "..", "editor")));

app.use(errorHandlers);

module.exports = app;
