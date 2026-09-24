const axios = require("axios");
const jwt = require("jsonwebtoken");
const { FCM, isFcmConfigured } = require("../../configs/fcm");
const { NOTIFICATION_LIMITS } = require("../../constants");

/**
 * Cached OAuth access token.
 *
 * Minting one costs a round trip to Google. A broadcast to a thousand devices
 * would otherwise mint a thousand.
 */
let cached = { token: null, expiresAt: 0 };

/**
 * Exchange the service-account key for an OAuth access token.
 *
 * This is the whole reason `firebase-admin` is not a dependency: sign a
 * short-lived JWT with the service account's private key, trade it for an
 * access token, and cache it until shortly before it expires.
 */
const getAccessToken = async () => {
  const now = Math.floor(Date.now() / 1000);
  if (cached.token && cached.expiresAt - FCM.tokenRefreshMarginSeconds > now) {
    return cached.token;
  }

  const assertion = jwt.sign(
    {
      iss: FCM.clientEmail,
      scope: FCM.scope,
      aud: FCM.tokenUrl,
      iat: now,
      exp: now + FCM.tokenTtlSeconds,
    },
    FCM.privateKey,
    { algorithm: "RS256" }
  );

  const { data } = await axios.post(
    FCM.tokenUrl,
    new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }).toString(),
    {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      timeout: FCM.requestTimeoutMs,
    }
  );

  cached = {
    token: data.access_token,
    expiresAt: now + (data.expires_in || FCM.tokenTtlSeconds),
  };
  return cached.token;
};

/**
 * FCM error codes that mean the token is permanently gone — the app was
 * uninstalled, or the token was rotated. Those should be retired rather than
 * retried forever.
 *
 * Anything else (a 500, a quota error) is transient and the token is kept.
 */
const DEAD_TOKEN_CODES = new Set([
  "UNREGISTERED",
  "INVALID_ARGUMENT",
  "NOT_FOUND",
]);

const classify = (error) => {
  const body = error?.response?.data?.error;
  const status = error?.response?.status;
  const fcmCode =
    body?.details?.find((detail) => detail.errorCode)?.errorCode ||
    body?.status ||
    null;

  return {
    // A 404 from the send endpoint also means the token is unknown.
    isDead: DEAD_TOKEN_CODES.has(fcmCode) || status === 404,
    code: fcmCode || (status ? `HTTP_${status}` : "UNKNOWN"),
    message: body?.message || error?.message || "unknown push error",
  };
};

/**
 * Send one notification to many device tokens.
 *
 * FCM HTTP v1 has no true multicast endpoint — each token is its own request —
 * so these go out concurrently in bounded batches. Results come back per token
 * so the caller can retire the ones the provider has rejected.
 *
 * ⚠️ **Never throws.** Push is a best-effort side channel: the in-app row is
 * the record, and a provider outage must not fail the operation that triggered
 * it. Every failure mode returns the same result shape.
 *
 * @param {string[]} tokens
 * @param {object}   message  { title, body, data, imageUrl }
 * @returns {Promise<{sent:number, failed:number, skipped?:boolean,
 *                    reason?:string, deadTokens:string[], results:object[]}>}
 */
exports.sendPush = async (tokens = [], message = {}) => {
  const unique = [...new Set(tokens.filter(Boolean))];
  if (!unique.length) {
    return { sent: 0, failed: 0, deadTokens: [], results: [] };
  }

  if (!isFcmConfigured()) {
    // Same shape as a real result so callers need no special case: a developer
    // with no Firebase project still gets notifications recorded and emailed.
    return {
      sent: 0,
      failed: 0,
      skipped: true,
      reason:
        "FCM is not configured (FCM_PROJECT_ID / FCM_CLIENT_EMAIL / FCM_PRIVATE_KEY)",
      deadTokens: [],
      results: [],
    };
  }

  let accessToken;
  try {
    accessToken = await getAccessToken();
  } catch (error) {
    console.error(
      "[sendPush] could not obtain an FCM access token:",
      error?.message
    );
    return {
      sent: 0,
      failed: unique.length,
      reason: `FCM authentication failed: ${error?.message || "unknown"}`,
      deadTokens: [],
      results: [],
    };
  }

  const url = FCM.sendUrl(FCM.projectId);

  // FCM requires every value in the data payload to be a string.
  const data = Object.fromEntries(
    Object.entries(message.data || {}).map(([key, value]) => [
      key,
      value === null || value === undefined ? "" : String(value),
    ])
  );

  const sendOne = async (token) => {
    try {
      await axios.post(
        url,
        {
          message: {
            token,
            notification: {
              title: message.title,
              body: message.body,
              ...(message.imageUrl ? { image: message.imageUrl } : {}),
            },
            data,
            android: { priority: "high" },
            apns: {
              payload: { aps: { sound: "default", "content-available": 1 } },
            },
          },
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          timeout: FCM.requestTimeoutMs,
        }
      );
      return { token, sent: true };
    } catch (error) {
      return { token, sent: false, ...classify(error) };
    }
  };

  // Bounded concurrency: a broadcast to thousands of devices must not open
  // thousands of sockets at once.
  const size = NOTIFICATION_LIMITS.PUSH_CONCURRENCY;
  const results = [];
  for (let index = 0; index < unique.length; index += size) {
    // eslint-disable-next-line no-await-in-loop
    const batch = await Promise.all(
      unique.slice(index, index + size).map(sendOne)
    );
    results.push(...batch);
  }

  return {
    sent: results.filter((result) => result.sent).length,
    failed: results.filter((result) => !result.sent).length,
    deadTokens: results
      .filter((result) => result.isDead)
      .map((result) => result.token),
    results,
  };
};

exports.isFcmConfigured = isFcmConfigured;

/**
 * Prove the credentials work without sending anything.
 *
 * Exposed for the admin health check: "is push actually going to work" is
 * otherwise only answerable by sending a real notification to a real device.
 */
exports.probeFcmAuth = async () => {
  if (!isFcmConfigured()) {
    return {
      ok: false,
      configured: false,
      reason:
        "Missing FCM_PROJECT_ID / FCM_CLIENT_EMAIL / FCM_PRIVATE_KEY in the environment",
    };
  }

  try {
    await getAccessToken();
    return { ok: true, configured: true, projectId: FCM.projectId };
  } catch (error) {
    return { ok: false, configured: true, reason: error?.message };
  }
};
