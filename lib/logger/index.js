var winston = require("winston"),
    morgan = require("morgan");

// Create a Winston logger instance with custom levels
const logger = winston.createLogger({
  levels: { error: 0, info: 1, debug: 2, web: 3 },
  level: process.env.DEBUG ? "debug" : "info",
  format: winston.format.simple(),
  transports: [
    new winston.transports.Console()
  ]
});

function log(msg, level) {

  if (!level) {
    level = "info";
  }

  // TODO Add timestamp

  logger.log(level, msg);

}

function debug(msg) {

  log(msg, "debug");

}

var stream = {
  write: function(msg) {
    log(msg, "web");
  }
};

module.exports = {
  log: log,
  debug: debug,
  morgan: function() {
    return morgan("combined", { "stream": stream });
  }
};
