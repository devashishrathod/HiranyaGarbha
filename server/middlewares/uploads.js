const fs = require("fs");
const { MAX_UPLOAD_BYTES } = require("../constants");
const { throwError } = require("../utils");

// A field sent twice arrives as an array of files rather than one.
const uploadedFiles = (req) => Object.values(req.files || {}).flat();

/**
 * express-fileupload writes every file to the temp dir and never deletes it,
 * so each upload — and each request turned away before using its file — was
 * left on the server's disk. The handlers finish with the files before they
 * respond, so the response going out is the point to remove them.
 *
 * Mount before fileUpload: req.files is read when the response ends, by which
 * time the upload has been parsed.
 */
exports.removeTempFiles = (req, res, next) => {
  let removed = false;
  const remove = () => {
    if (removed) return;
    removed = true;
    for (const file of uploadedFiles(req)) {
      // Some services delete their own file first; ENOENT is expected then.
      if (file.tempFilePath) fs.unlink(file.tempFilePath, () => {});
    }
  };
  // "close" also covers a client that disconnects before the response.
  res.once("finish", remove);
  res.once("close", remove);
  next();
};

/**
 * busboy stops writing a file at MAX_UPLOAD_BYTES and marks it truncated
 * rather than failing the request, so without this a cut-off video would be
 * sent on to Cloudinary as a corrupt file.
 */
exports.rejectOversizedFiles = (req, res, next) => {
  if (uploadedFiles(req).some((file) => file.truncated)) {
    throwError(
      413,
      `Each file must be ${MAX_UPLOAD_BYTES / (1024 * 1024)} MB or smaller`,
    );
  }
  next();
};
