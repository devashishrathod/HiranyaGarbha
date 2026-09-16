/**
 * Stand-in data for the notification centre.
 *
 * The recipient lists on the compose screen come from the real `/get-all`
 * endpoints; only the campaign history, the templates and the send call are
 * faked here. Swap `sendCampaign` for a `useApiMutation` call once the
 * notifications API exists — nothing else in the UI reads this file.
 */

import { CHANNELS, DELIVERY_STATUS } from "../../constants/notification";

const hoursAgo = (hours) => new Date(Date.now() - hours * 3600000).toISOString();
const hoursAhead = (hours) =>
  new Date(Date.now() + hours * 3600000).toISOString();

export const MOCK_TEMPLATES = [
  {
    _id: "tpl_appointment_reminder",
    name: "Appointment reminder",
    description: "Day-before nudge for a booked consultation",
    channels: [CHANNELS.PUSH, CHANNELS.SMS],
    title: "Your appointment is tomorrow",
    body: "Hi {{name}}, your consultation with {{doctor}} is tomorrow. Please reach 10 minutes early.",
    audienceHint: "Patients with an upcoming appointment",
  },
  {
    _id: "tpl_new_package",
    name: "New package launch",
    description: "Announce a newly published care package",
    channels: [CHANNELS.PUSH, CHANNELS.IN_APP, CHANNELS.EMAIL],
    title: "A new care package is live",
    body: "Hi {{name}}, we have just added a new package built for your {{trimester}}. Open the app to take a look.",
    audienceHint: "All active patients",
  },
  {
    _id: "tpl_app_update",
    name: "App update notice",
    description: "Tell everyone a new build is out",
    channels: [CHANNELS.PUSH, CHANNELS.IN_APP],
    title: "Update available",
    body: "We have shipped a faster app with a redesigned appointment flow. Update from your store to get it.",
    audienceHint: "Everyone",
  },
  {
    _id: "tpl_doctor_roster",
    name: "Doctor roster change",
    description: "Ask doctors to re-check their availability",
    channels: [CHANNELS.EMAIL, CHANNELS.IN_APP],
    title: "Please confirm next week's availability",
    body: "Hello {{name}}, next week's roster closes on Friday. Kindly review your slots in the panel.",
    audienceHint: "All doctors",
  },
  {
    _id: "tpl_health_camp",
    name: "Health camp invite",
    description: "Invite patients to an on-ground camp",
    channels: [CHANNELS.WHATSAPP, CHANNELS.SMS],
    title: "Free prenatal health camp",
    body: "Namaste {{firstName}}, join our free prenatal check-up camp this Sunday, 10 AM at the clinic. Reply YES to reserve a slot.",
    audienceHint: "Active patients in the city",
  },
];

export const MOCK_HISTORY = [
  {
    _id: "ntf_1024",
    title: "A new care package is live",
    body: "Hi {{name}}, we have just added a new package built for your {{trimester}}. Open the app to take a look.",
    channels: [CHANNELS.PUSH, CHANNELS.IN_APP],
    audienceLabel: "All patients",
    audienceMode: "ROLE",
    status: DELIVERY_STATUS.SENT,
    targeted: 1284,
    delivered: 1207,
    opened: 612,
    failed: 77,
    createdAt: hoursAgo(5),
    sentAt: hoursAgo(5),
    sentBy: "Admin",
  },
  {
    _id: "ntf_1023",
    title: "Please confirm next week's availability",
    body: "Hello {{name}}, next week's roster closes on Friday. Kindly review your slots in the panel.",
    channels: [CHANNELS.EMAIL, CHANNELS.IN_APP],
    audienceLabel: "All doctors",
    audienceMode: "ROLE",
    status: DELIVERY_STATUS.SENT,
    targeted: 46,
    delivered: 46,
    opened: 31,
    failed: 0,
    createdAt: hoursAgo(28),
    sentAt: hoursAgo(28),
    sentBy: "Admin",
  },
  {
    _id: "ntf_1022",
    title: "Free prenatal health camp",
    body: "Namaste {{firstName}}, join our free prenatal check-up camp this Sunday, 10 AM at the clinic.",
    channels: [CHANNELS.WHATSAPP, CHANNELS.SMS],
    audienceLabel: "212 hand-picked patients",
    audienceMode: "MANUAL",
    status: DELIVERY_STATUS.PARTIAL,
    targeted: 212,
    delivered: 168,
    opened: 96,
    failed: 44,
    createdAt: hoursAgo(53),
    sentAt: hoursAgo(53),
    sentBy: "Admin",
  },
  {
    _id: "ntf_1021",
    title: "Update available",
    body: "We have shipped a faster app with a redesigned appointment flow.",
    channels: [CHANNELS.PUSH],
    audienceLabel: "All patients, all doctors",
    audienceMode: "ROLE",
    status: DELIVERY_STATUS.SENT,
    targeted: 1330,
    delivered: 1201,
    opened: 488,
    failed: 129,
    createdAt: hoursAgo(74),
    sentAt: hoursAgo(74),
    sentBy: "Admin",
  },
  {
    _id: "ntf_1020",
    title: "Diwali clinic timings",
    body: "The clinic will run on reduced hours from 20th to 23rd. Emergency support stays available.",
    channels: [CHANNELS.IN_APP, CHANNELS.SMS],
    audienceLabel: "Active patients joined in the last 90 days",
    audienceMode: "SEGMENT",
    status: DELIVERY_STATUS.SENT,
    targeted: 604,
    delivered: 588,
    opened: 240,
    failed: 16,
    createdAt: hoursAgo(120),
    sentAt: hoursAgo(120),
    sentBy: "Admin",
  },
  {
    _id: "ntf_1019",
    title: "Monthly wellness webinar",
    body: "Join Dr. Mehta this Saturday for a live session on third-trimester nutrition.",
    channels: [CHANNELS.PUSH, CHANNELS.EMAIL],
    audienceLabel: "All patients",
    audienceMode: "ROLE",
    status: DELIVERY_STATUS.SCHEDULED,
    targeted: 1284,
    delivered: 0,
    opened: 0,
    failed: 0,
    createdAt: hoursAgo(3),
    scheduledAt: hoursAhead(31),
    sentBy: "Admin",
  },
  {
    _id: "ntf_1018",
    title: "Lab report ready",
    body: "Your latest lab report has been uploaded to your profile.",
    channels: [CHANNELS.SMS],
    audienceLabel: "38 pasted numbers",
    audienceMode: "CSV",
    status: DELIVERY_STATUS.FAILED,
    targeted: 38,
    delivered: 0,
    opened: 0,
    failed: 38,
    createdAt: hoursAgo(152),
    sentAt: hoursAgo(152),
    sentBy: "Admin",
    error: "SMS gateway rejected the sender id",
  },
  {
    _id: "ntf_1017",
    title: "Welcome to Hiranyagarbh",
    body: "Thanks for joining. Complete your profile to unlock your personalised plan.",
    channels: [CHANNELS.PUSH, CHANNELS.IN_APP, CHANNELS.EMAIL],
    audienceLabel: "Patients with an incomplete profile",
    audienceMode: "SEGMENT",
    status: DELIVERY_STATUS.SENT,
    targeted: 176,
    delivered: 171,
    opened: 83,
    failed: 5,
    createdAt: hoursAgo(190),
    sentAt: hoursAgo(190),
    sentBy: "Admin",
  },
];

/**
 * Rolls the history up into the numbers shown on the stat cards. Scheduled
 * campaigns are counted separately because nothing has gone out for them yet.
 */
export const summariseHistory = (history = []) => {
  const base = { sent: 0, delivered: 0, opened: 0, failed: 0, scheduled: 0 };

  return history.reduce((totals, item) => {
    if (item.status === DELIVERY_STATUS.SCHEDULED) {
      return { ...totals, scheduled: totals.scheduled + 1 };
    }

    return {
      ...totals,
      sent: totals.sent + (item.targeted || 0),
      delivered: totals.delivered + (item.delivered || 0),
      opened: totals.opened + (item.opened || 0),
      failed: totals.failed + (item.failed || 0),
    };
  }, base);
};

/**
 * Fakes the send round-trip. Resolves with the campaign record the history list
 * renders, so the optimistic row and a server row end up the same shape.
 */
export const sendCampaign = ({ draft, audience, scheduledAt }) =>
  new Promise((resolve) => {
    setTimeout(() => {
      const targeted = audience.count || 0;
      const shared = {
        _id: `ntf_${Date.now()}`,
        title: draft.title || draft.subject || "Untitled notification",
        body: draft.body || draft.smsBody || draft.emailBody || "",
        channels: draft.channels,
        audienceLabel: audience.label,
        audienceMode: audience.mode,
        targeted,
        createdAt: new Date().toISOString(),
        sentBy: "Admin",
      };

      if (scheduledAt) {
        resolve({
          ...shared,
          status: DELIVERY_STATUS.SCHEDULED,
          delivered: 0,
          opened: 0,
          failed: 0,
          scheduledAt,
        });
        return;
      }

      // Roughly 4% of a real blast bounces — enough to show the failed column
      const failed = Math.round(targeted * 0.04);
      const delivered = targeted - failed;

      resolve({
        ...shared,
        status: failed > 0 ? DELIVERY_STATUS.PARTIAL : DELIVERY_STATUS.SENT,
        delivered,
        opened: Math.round(delivered * 0.42),
        failed,
        sentAt: new Date().toISOString(),
      });
    }, 900);
  });
