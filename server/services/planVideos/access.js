const Subscription = require("../../models/Subscription");
const { getEntitlement } = require("../patientSubscriptions");
const {
  SUBSCRIPTION_TIERS,
  TRIMESTERS_COVERED,
  VIDEO_TRIMESTERS,
} = require("../../constants");

// By tier rather than the patient's own package id: if the admin replaces
// the Pro package, videos ticked for the new one still reach patients who
// bought the old one.
const livePackageIds = (tier) =>
  Subscription.find({ tier, isDeleted: false }).distinct("_id");

/**
 * Which videos a viewer may watch, as a Mongo filter. See docs/PLAN_VIDEOS.md.
 *
 * - Basic videos are open to everyone, signed in or not, in any trimester.
 * - A live Pro or Elite plan adds that tier's videos, from the trimester the
 *   plan was bought in onwards. Elite does not include Pro: a video reaches
 *   a tier only when that tier is ticked.
 *
 * "Live" is getEntitlement's rule — ACTIVE or CANCELLED until endDate — the
 * one every other gated screen uses, so videos never outlast other content.
 */
exports.resolveViewerAccess = async (patientId) => {
  const entitlement = patientId ? await getEntitlement(patientId) : null;
  const tier = entitlement?.tier || null;
  const paidTier = tier && tier !== SUBSCRIPTION_TIERS.BASIC ? tier : null;
  const trimesters = paidTier
    ? [...(TRIMESTERS_COVERED[entitlement.trimester] || VIDEO_TRIMESTERS)]
    : [];

  const [basicIds, paidIds] = await Promise.all([
    livePackageIds(SUBSCRIPTION_TIERS.BASIC),
    paidTier ? livePackageIds(paidTier) : [],
  ]);

  const anyOf = [{ packageIds: { $in: basicIds } }];
  if (paidTier) {
    anyOf.push({ packageIds: { $in: paidIds }, trimesters: { $in: trimesters } });
  }

  return { filter: { $or: anyOf }, access: { tier, trimesters } };
};
