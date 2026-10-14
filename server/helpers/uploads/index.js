const { validateImage, removeTempFile } = require("./validateImage");

/** Checks on uploaded files, before they are stored anywhere. */
module.exports = { validateImage, removeTempFile };
