import { Link } from "react-router-dom";

import { useGetQuery } from "../../api/apiCall";
import API_ENDPOINTS from "../../api/apiEndpoint";
import {
  PAYMENT_ATTEMPT_META,
  PLAN_PAYMENT_STATUS_META,
  PLAN_SOURCE_META,
  PLAN_STATE_META,
} from "../../constants/subscription";
import { formatDate, formatDateTime } from "../../utils/datetime";
import { withPath } from "../../utils/ids";
import { Avatar, Button, InlineLoader, Modal, Pill } from "../UI/kit";
import {
  TIER_TONE,
  formatAmount,
  periodNote,
  tierLabel,
  trimesterLabel,
} from "./planFormat";

const Row = ({ label, children }) => (
  <div className="flex items-start justify-between gap-4 py-2 text-sm">
    <dt className="text-gray-500">{label}</dt>
    <dd className="text-right font-medium text-gray-900">{children}</dd>
  </div>
);

const Section = ({ title, children }) => (
  <section className="rounded-xl border border-gray-200 p-4">
    <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">{title}</h3>
    <dl className="divide-y divide-gray-100">{children}</dl>
  </section>
);

/**
 * Everything about one plan: who, what was sold, the money and every payment
 * attempt. Read-only — grant, cancel and refund are still to come.
 */
const PlanDetailModal = ({ planId, onClose }) => {
  const { data, isLoading, error } = useGetQuery(
    planId ? withPath(API_ENDPOINTS.PATIENT_PLANS.GET_ONE, { id: planId }) : null,
    ["patient-plan", planId],
  );

  const plan = data?.data;
  const state = PLAN_STATE_META[plan?.state] || { label: plan?.state, tone: "slate" };
  const payment = PLAN_PAYMENT_STATUS_META[plan?.paymentStatus] || {
    label: plan?.paymentStatus,
    tone: "slate",
  };
  const credit = plan?.proration?.creditAmount || 0;

  return (
    <Modal
      open
      size="lg"
      title={plan ? plan.snapshot?.name || "Plan" : "Plan details"}
      description={
        plan ? `${plan.subscriptionNumber} · Taken on ${formatDateTime(plan.createdAt)}` : undefined
      }
      onClose={onClose}
      footer={
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      }
    >
      {isLoading ? (
        <InlineLoader label="Loading plan…" />
      ) : error ? (
        <p className="py-10 text-center text-sm text-red-600">
          {error?.response?.data?.message || "This plan could not be loaded."}
        </p>
      ) : plan ? (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <Pill tone={state.tone}>{state.label}</Pill>
            <Pill tone={payment.tone}>{payment.label}</Pill>
            <Pill tone={TIER_TONE[plan.tier] || "slate"}>{tierLabel(plan.tier)}</Pill>
            <span className="text-xs text-gray-500">{PLAN_SOURCE_META[plan.source] || plan.source}</span>
          </div>
          {state.hint ? <p className="-mt-2 text-xs text-gray-500">{state.hint}</p> : null}

          <div className="grid gap-4 md:grid-cols-2">
            <section className="rounded-xl border border-gray-200 p-4">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Patient</h3>
              {plan.patient ? (
                <div className="flex items-center gap-3">
                  <Avatar src={plan.patient.image} name={plan.patient.fullName || ""} />
                  <div className="min-w-0">
                    {plan.patient.userId ? (
                      <Link
                        to={`/patients/${plan.patient.userId}`}
                        className="block truncate font-semibold text-gray-900 hover:text-blue-600"
                      >
                        {plan.patient.fullName || "Unnamed patient"}
                      </Link>
                    ) : (
                      <p className="truncate font-semibold text-gray-900">
                        {plan.patient.fullName || "Unnamed patient"}
                      </p>
                    )}
                    <p className="truncate text-sm text-gray-500">{plan.patient.phone || "—"}</p>
                    <p className="truncate text-sm text-gray-500">{plan.patient.email || ""}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">This patient no longer exists.</p>
              )}
            </section>

            <Section title="Plan">
              <Row label="Type">{plan.kind === "BONUS" ? "Bonus course" : "Package"}</Row>
              <Row label="Trimester">{trimesterLabel(plan.trimester)}</Row>
              <Row label="Duration">
                {plan.snapshot?.durationInDays ? `${plan.snapshot.durationInDays} days` : "—"}
              </Row>
              <Row label="Package">
                {plan.package ? (
                  <Link
                    to={`/subscriptions/update/${plan.package._id}`}
                    className="text-blue-600 hover:underline"
                  >
                    {plan.package.name}
                  </Link>
                ) : (
                  "—"
                )}
              </Row>
            </Section>

            <Section title="Period">
              <Row label="Starts">{plan.startDate ? formatDate(plan.startDate) : "Not started"}</Row>
              <Row label="Ends">
                {plan.endDate ? (
                  <>
                    {formatDate(plan.endDate)}
                    <span className="block text-xs font-normal text-gray-500">
                      {periodNote(plan.endDate)}
                    </span>
                  </>
                ) : (
                  "—"
                )}
              </Row>
              {plan.graceUntil ? <Row label="Grace until">{formatDate(plan.graceUntil)}</Row> : null}
              {plan.cancelledAt ? (
                <Row label="Cancelled">
                  {formatDate(plan.cancelledAt)}
                  {plan.cancelledBy ? (
                    <span className="block text-xs font-normal capitalize text-gray-500">
                      by {plan.cancelledBy.toLowerCase()}
                    </span>
                  ) : null}
                </Row>
              ) : null}
            </Section>

            <Section title="Billing">
              <Row label="List price">{formatAmount(plan.listPrice)}</Row>
              {plan.discount ? <Row label="Discount">− {formatAmount(plan.discount)}</Row> : null}
              {credit ? <Row label="Upgrade credit">− {formatAmount(credit)}</Row> : null}
              <Row label="Payable">{formatAmount(plan.amountPayable)}</Row>
              <Row label="Paid">
                <span className={plan.amountPaid ? "text-emerald-700" : "text-gray-500"}>
                  {formatAmount(plan.amountPaid)}
                </span>
              </Row>
            </Section>
          </div>

          {plan.previousSubscriptionId || plan.renewedFromId || plan.cancelReason || plan.grantReason ? (
            <Section title="Notes">
              {plan.previousSubscriptionId ? (
                <Row label="Upgraded from">{plan.previousSubscriptionId.subscriptionNumber}</Row>
              ) : null}
              {plan.renewedFromId ? (
                <Row label="Renewal of">{plan.renewedFromId.subscriptionNumber}</Row>
              ) : null}
              {plan.grantReason ? <Row label="Grant reason">{plan.grantReason}</Row> : null}
              {plan.cancelReason ? <Row label="Cancel reason">{plan.cancelReason}</Row> : null}
            </Section>
          ) : null}

          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Payment attempts ({plan.payments?.length || 0})
            </h3>
            {plan.payments?.length ? (
              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="w-full min-w-[560px] text-sm">
                  <thead className="bg-gray-50 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                    <tr>
                      <th className="px-4 py-2.5">When</th>
                      <th className="px-4 py-2.5 text-right">Amount</th>
                      <th className="px-4 py-2.5">Method</th>
                      <th className="px-4 py-2.5">Status</th>
                      <th className="px-4 py-2.5">Razorpay ID</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {plan.payments.map((attempt) => {
                      const meta = PAYMENT_ATTEMPT_META[attempt.status] || {
                        label: attempt.status,
                        tone: "slate",
                      };
                      return (
                        <tr key={attempt._id}>
                          <td className="whitespace-nowrap px-4 py-2.5 text-gray-700">
                            {formatDateTime(attempt.receivedAt || attempt.createdAt)}
                          </td>
                          <td className="whitespace-nowrap px-4 py-2.5 text-right font-semibold tabular-nums">
                            {formatAmount(attempt.amount)}
                          </td>
                          <td className="px-4 py-2.5 uppercase text-gray-600">{attempt.method || "—"}</td>
                          <td className="px-4 py-2.5">
                            <Pill tone={meta.tone}>{meta.label}</Pill>
                            {attempt.failureReason ? (
                              <p className="mt-1 max-w-[220px] text-xs text-red-600">{attempt.failureReason}</p>
                            ) : null}
                          </td>
                          <td className="px-4 py-2.5 font-mono text-xs text-gray-500">
                            {attempt.paymentId || attempt.orderId || "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="rounded-xl border border-dashed border-gray-200 px-4 py-6 text-center text-sm text-gray-500">
                {plan.paymentStatus === "NOT_REQUIRED"
                  ? "Free plan — no payment was needed."
                  : "No payment attempt recorded."}
              </p>
            )}
          </section>
        </div>
      ) : null}
    </Modal>
  );
};

export default PlanDetailModal;
