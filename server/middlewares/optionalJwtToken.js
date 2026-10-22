const { verifyJwtToken } = require("./verifyJwtToken");

/**
 * For public routes that show a signed-in patient more. Without a token the
 * request goes on anonymous (req.patientId unset).
 *
 * A token that is sent but fails — expired, malformed — is still refused with
 * the usual 401/403, so an expired session surfaces and the app can log in
 * again, instead of quietly showing a paying patient the public list.
 *
 * "Bearer null" and "Bearer undefined" count as no token: that is what an app
 * sends when it builds the header before anyone has logged in.
 */
exports.optionalJwtToken = (req, res, next) => {
  const header = req.headers["authorization"];
  const token = header?.split(" ")[1];
  if (!header || token === "null" || token === "undefined") return next();
  return verifyJwtToken(req, res, next);
};
