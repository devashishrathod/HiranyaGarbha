const { sendLoginOtpMail } = require("./sendLoginOtpMail");
const {
  sendOtpVerificationSuccessMail,
} = require("./sendOtpVerificationSuccessMail");
const { sendMail, isMailConfigured } = require("./sendMail");

module.exports = {
  sendLoginOtpMail,
  sendOtpVerificationSuccessMail,
  // The generic sender. Anything that is not one of the two OTP mails above
  // goes through this, so there is one transporter, one shell and one place
  // that knows whether mail is configured.
  sendMail,
  isMailConfigured,
};
