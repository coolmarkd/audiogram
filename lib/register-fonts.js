var fonts = require("./settings/").fonts,
    _ = require("underscore"),
    { registerFont } = require("canvas");

// Register custom fonts one time
if (Array.isArray(fonts)) {
  fonts.forEach(function(font){
    registerFont(font.file, _.pick(font, "family", "weight", "style"));
  });
}
