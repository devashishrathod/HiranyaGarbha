require("dotenv").config();

/**
 * Firebase Cloud Messaging credentials.
 *
 * Deliberately not using the `firebase-admin` SDK: it pulls in tens of megabytes
 * of dependencies for what amounts to one OAuth exchange and one HTTP POST, and
 * `axios` + `jsonwebtoken` are already dependencies of this project.
 *
 * Values come from a Firebase **service account** JSON
 * (Firebase Console -> Project settings -> Service accounts -> Generate new
 * private key):
 *
 *   FCM_PROJECT_ID    = project_id
 *   FCM_CLIENT_EMAIL  = client_email
 *   FCM_PRIVATE_KEY   = private_key
 *
 * ⚠️ The private key is a multi-line PEM. A `.env` file cannot hold real
 * newlines, so it has to be written quoted and with literal `\n` escapes:
 *
 *   FCM_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQ...\n-----END PRIVATE KEY-----\n"
 *
 * Those escapes are turned back into real newlines here. A key left with
 * literal backslash-n fails RS256 signing with an opaque OpenSSL error that
 * says nothing about the cause.
 */
const normalisePrivateKey = (key) =>
  key ? String(key).replace(/\\n/g, "\n").trim() : null;

const FCM = Object.freeze({
  projectId: process.env.FCM_PROJECT_ID || null,
  clientEmail: process.env.FCM_CLIENT_EMAIL || null,
  privateKey: normalisePrivateKey(process.env.FCM_PRIVATE_KEY),

  tokenUrl: "https://oauth2.googleapis.com/token",
  scope: "https://www.googleapis.com/auth/firebase.messaging",
  sendUrl: (projectId) =>
    `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`,

  // Access tokens last an hour. Refreshing a little early beats racing the
  // expiry on a burst of sends.
  tokenTtlSeconds: 3600,
  tokenRefreshMarginSeconds: 300,
  requestTimeoutMs: 10000,
});

/**
 * True only when every credential needed to actually send is present.
 *
 * Callers use this to skip cleanly rather than fail: a developer with no
 * Firebase project should still be able to run the server, record
 * notifications and send email.
 */
const isFcmConfigured = () =>
  Boolean(FCM.projectId && FCM.clientEmail && FCM.privateKey);

module.exports = { FCM, isFcmConfigured };
