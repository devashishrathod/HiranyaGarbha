const fs = require("fs");
const { throwError } = require("../../utils");

/*
 * The first bytes each accepted format starts with. WEBP is a RIFF container,
 * so it is "RIFF" at 0 and "WEBP" at 8 with the file size in between.
 */
const SIGNATURES = {
  "image/jpeg": (bytes) => bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff,
  "image/png": (bytes) =>
    [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every((value, i) => bytes[i] === value),
  "image/webp": (bytes) =>
    bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP",
};

const readHead = (path, length = 12) => {
  const fd = fs.openSync(path, "r");
  try {
    const buffer = Buffer.alloc(length);
    fs.readSync(fd, buffer, 0, length, 0);
    return buffer;
  } finally {
    fs.closeSync(fd);
  }
};

/** Best-effort removal of express-fileupload's temp file(s). Safe to repeat. */
const removeTempFile = (file) => {
  if (Array.isArray(file)) {
    file.forEach(removeTempFile);
    return;
  }
  const path = file?.tempFilePath;
  if (!path) return;
  fs.promises.unlink(path).catch(() => {});
};

/**
 * Checks an uploaded image before it goes anywhere near Cloudinary.
 *
 * ⚠️ The declared `mimetype` comes from the browser and is trivially faked —
 * a script renamed to photo.jpg arrives as image/jpeg. The file's own leading
 * bytes are what decide, and they must agree with the declared type.
 *
 * Throws 422 with a message the admin can act on, and removes the temp file
 * when it rejects, since nothing else will.
 */
const validateImage = (file, { maxBytes, mimeTypes }) => {
  if (Array.isArray(file)) {
    removeTempFile(file);
    throwError(422, "Upload one image at a time");
  }

  const reject = (message) => {
    removeTempFile(file);
    throwError(422, message);
  };

  if (!file?.tempFilePath) reject("The image did not upload. Please try again.");
  if (file.truncated) reject("The image is too large");
  if (!file.size) reject("The image is empty");

  if (file.size > maxBytes) {
    reject(`The image must be ${Math.round(maxBytes / (1024 * 1024))} MB or smaller`);
  }

  const looksLike = SIGNATURES[file.mimetype];
  if (!mimeTypes.includes(file.mimetype) || !looksLike) {
    reject("Upload a JPG, PNG or WebP image");
  }

  let head;
  try {
    head = readHead(file.tempFilePath);
  } catch {
    reject("The image could not be read. Please try again.");
  }
  if (!looksLike(head)) reject("This file is not a valid image");

  return file;
};

module.exports = { validateImage, removeTempFile };
