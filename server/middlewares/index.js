const { errorHandler } = require("./errorHandler");
const { generateJwtToken } = require("./generateJwtToken");
const { verifyJwtToken } = require("./verifyJwtToken");
const { optionalJwtToken } = require("./optionalJwtToken");
const { validateRoles, isAdmin, isUser, isStaff } = require("./validateRoles");
const { validateSchema } = require("./validateSchema");
const { removeTempFiles, rejectOversizedFiles } = require("./uploads");

module.exports = {
  errorHandler,
  generateJwtToken,
  verifyJwtToken,
  optionalJwtToken,
  validateRoles,
  isAdmin,
  isUser,
  isStaff,
  validateSchema,
  removeTempFiles,
  rejectOversizedFiles,
};
