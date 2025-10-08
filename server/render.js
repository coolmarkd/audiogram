var serverSettings = require("../lib/settings/"),
    spawn = require("child_process").spawn,
    path = require("path"),
    _ = require("underscore"),
    logger = require("../lib/logger"),
    transports = require("../lib/transports");

function validate(req, res, next) {

  try {

    req.body.theme = JSON.parse(req.body.theme);

  } catch(e) {

    return res.status(500).send("Unknown settings error.");

  }

  if (!req.file || !req.file.filename) {
    return res.status(500).send("No valid audio received.");
  }

  // Start at the beginning, or specified time
  if (req.body.start) {
    req.body.start = +req.body.start;
  }

  if (req.body.end) {
    req.body.end = +req.body.end;
  }

  // Handle caption mode
  req.body.captionMode = req.body.captionMode || "static";

  // Parse timed captions if provided
  if (req.body.timedCaptions) {
    try {
      req.body.timedCaptions = JSON.parse(req.body.timedCaptions);
    } catch(e) {
      return res.status(500).send("Invalid timed captions data.");
    }
  }

  // Parse speaker names if provided
  if (req.body.speakerNames) {
    try {
      req.body.speakerNames = JSON.parse(req.body.speakerNames);
    } catch(e) {
      return res.status(500).send("Invalid speaker names data.");
    }
  }

  return next();

}

function route(req, res) {

  var id = req.file.destination.split(path.sep).pop();

  transports.uploadAudio(path.join(req.file.destination, "audio"), "audio/" + id,function(err) {

    if (err) {
      console.error("Error uploading audio:", err);
      throw err;
    }

    // Queue up the job with a timestamp
    var jobData = _.extend({ id: id, created: (new Date()).getTime() }, req.body);
    console.log("Adding job to queue:", id);
    transports.addJob(jobData);

    res.json({ id: id });

    // If there's no separate worker, spawn one right away
    if (!serverSettings.worker) {

      console.log("Spawning worker for job:", id);

      // Empty args to avoid child_process Linux error
      spawn("bin/worker", [], {
        stdio: "inherit",
        cwd: path.join(__dirname, ".."),
        env: _.extend({}, process.env, { SPAWNED: true })
      });

    }

  });

};

module.exports = {
  validate: validate,
  route: route
};
