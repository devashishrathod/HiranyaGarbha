const { SUBSCRIPTION_STATUS } = require("../../constants");
const { throwError } = require("../../utils");

const S = SUBSCRIPTION_STATUS;

/*
 * The legal moves, in one place.
 *
 * Every service that changes a status asks here first. Keeping the graph in a
 * single table is what stops a new endpoint from quietly inventing a path —
 * "admin force-expire" reactivating a refunded plan, say — and it makes the
 * state machine in docs/SUBSCRIPTIONS.md §5 checkable against the code.
 */
const ALLOWED = Object.freeze({
  [S.PENDING_PAYMENT]: [S.ACTIVE, S.SCHEDULED, S.CANCELLED, S.EXPIRED],
  [S.SCHEDULED]: [S.ACTIVE, S.CANCELLED],
  [S.ACTIVE]: [S.EXPIRED, S.CANCELLED, S.UPGRADED, S.REFUNDED],
  // Terminal. A returning patient gets a new row linked by renewedFromId
  // rather than a resurrected one, so the history stays truthful.
  [S.EXPIRED]: [],
  [S.CANCELLED]: [S.EXPIRED],
  [S.UPGRADED]: [],
  [S.REFUNDED]: [],
});

const canTransition = (from, to) => (ALLOWED[from] || []).includes(to);

const assertTransition = (from, to) => {
  if (from === to) return;
  if (!canTransition(from, to))
    throwError(409, `Cannot move a subscription from ${from} to ${to}`);
};

/**
 * Whether this row grants access right now.
 *
 * CANCELLED still counts: the patient paid for the period, and cancelling
 * means "do not renew", not "cut me off today". Only an admin revoking
 * immediately pulls endDate back, and then this returns false on its own.
 */
const grantsAccess = (subscription, now = new Date()) => {
  if (!subscription || subscription.isDeleted) return false;
  if (![S.ACTIVE, S.CANCELLED].includes(subscription.status)) return false;
  if (!subscription.endDate) return false;

  return new Date(now) <= new Date(subscription.endDate);
};

module.exports = { ALLOWED, canTransition, assertTransition, grantsAccess };
