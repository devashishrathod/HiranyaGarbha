const { resolvePurchase } = require("./resolvePurchase");

/**
 * What this purchase would cost, without writing anything.
 *
 * Shares `resolvePurchase` with `createCheckout`, which is the whole point:
 * the "you pay ₹11,333 instead of ₹17,999" a patient sees before committing is
 * produced by the same code that later charges them.
 */
exports.previewCheckout = async ({ patientId, packageId, trimester }) => {
  const { pkg, plan, kind, current, pricing, snapshot } = await resolvePurchase({
    patientId,
    packageId,
    trimester,
  });

  return {
    package: {
      _id: pkg._id,
      name: pkg.name,
      subtitle: pkg.subtitle,
      tier: pkg.tier,
      duration: pkg.duration,
      modules: snapshot.modules,
      includes: snapshot.includes,
    },
    plan: {
      trimester: plan.trimester,
      label: plan.label,
      price: plan.price,
      originalPrice: plan.originalPrice,
      durationInDays: plan.durationInDays,
    },
    kind,
    currentPlan: current
      ? {
          _id: current._id,
          name: current.snapshot?.name,
          tier: current.tier,
          endDate: current.endDate,
          daysRemaining: pricing.daysRemaining,
        }
      : null,
    pricing: {
      listPrice: pricing.listPrice,
      discount: pricing.discount,
      creditApplied: pricing.creditApplied,
      amountPayable: pricing.amountPayable,
      currency: pricing.currency,
    },
    // Lets the client skip the Razorpay script entirely for a free plan.
    requiresPayment: pricing.amountPayable > 0,
  };
};
