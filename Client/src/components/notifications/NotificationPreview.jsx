import { useState } from "react";
import { Bell, Mail, MessageSquare, Smartphone } from "lucide-react";

import { CHANNELS, CHANNEL_META } from "../../constants/notification";

const PREVIEW_TABS = [
  { key: CHANNELS.PUSH, label: "Push", icon: Smartphone },
  { key: CHANNELS.IN_APP, label: "In-app", icon: Bell },
  { key: CHANNELS.EMAIL, label: "Email", icon: Mail },
  { key: CHANNELS.SMS, label: "SMS", icon: MessageSquare },
];

/** The sample values the merge tags are rendered with while previewing */
const SAMPLE = {
  "{{name}}": "Asha Sharma",
  "{{firstName}}": "Asha",
  "{{trimester}}": "Second Trimester",
  "{{doctor}}": "Dr. Mehta",
};

const fill = (text = "") =>
  Object.entries(SAMPLE).reduce(
    (output, [tag, sample]) => output.split(tag).join(sample),
    text,
  );

const PushPreview = ({ draft }) => (
  <div className="rounded-[26px] bg-slate-900 p-3 shadow-inner">
    <div className="rounded-[18px] bg-gradient-to-b from-slate-700 to-slate-800 px-3 pb-4 pt-6">
      <p className="mb-3 text-center text-[11px] font-medium text-slate-300">
        9:41
      </p>
      <div className="rounded-2xl bg-white/95 p-3 shadow-lg backdrop-blur">
        <div className="flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded bg-gradient-to-br from-blue-500 to-purple-500 text-[9px] font-bold text-white">
            H
          </span>
          <span className="text-[11px] font-medium text-gray-500">
            Hiranyagarbh · now
          </span>
        </div>
        <p className="mt-1.5 text-sm font-semibold leading-snug text-gray-900">
          {fill(draft.title) || "Notification title"}
        </p>
        <p className="mt-0.5 line-clamp-3 text-xs leading-relaxed text-gray-600">
          {fill(draft.body) || "Your message shows up here."}
        </p>
        {draft.imageUrl ? (
          <img
            src={draft.imageUrl}
            alt=""
            className="mt-2 h-24 w-full rounded-lg object-cover"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
        ) : null}
      </div>
    </div>
  </div>
);

const InAppPreview = ({ draft }) => (
  <div className="rounded-2xl border border-gray-200 bg-white p-4">
    <div className="flex items-start gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
        <Bell size={16} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-gray-900">
          {fill(draft.title) || "Notification title"}
        </p>
        <p className="mt-1 text-xs leading-relaxed text-gray-600">
          {fill(draft.body) || "Your message shows up here."}
        </p>
        <p className="mt-2 text-[11px] text-gray-400">Just now</p>
      </div>
      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
    </div>
  </div>
);

const EmailPreview = ({ draft }) => (
  <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
    <div className="border-b border-gray-100 bg-gray-50 px-4 py-3">
      <p className="truncate text-sm font-semibold text-gray-900">
        {fill(draft.subject) || "Subject line"}
      </p>
      <p className="mt-0.5 text-[11px] text-gray-500">
        Hiranyagarbh &lt;no-reply@hiranyagarbh.com&gt;
      </p>
    </div>
    <div className="px-4 py-4">
      <p className="whitespace-pre-wrap text-xs leading-relaxed text-gray-700">
        {fill(draft.emailBody) || "Your email body shows up here."}
      </p>
    </div>
  </div>
);

const SmsPreview = ({ draft }) => (
  <div className="rounded-2xl bg-gray-100 p-4">
    <p className="mb-2 text-center text-[11px] text-gray-500">HIRANYA</p>
    <div className="max-w-[85%] rounded-2xl rounded-bl-sm bg-white px-3.5 py-2.5 shadow-sm">
      <p className="whitespace-pre-wrap text-xs leading-relaxed text-gray-800">
        {fill(draft.smsBody) || "Your text message shows up here."}
      </p>
    </div>
  </div>
);

/**
 * Renders the draft the way each channel would show it, with the merge tags
 * filled in so the copy can be read as a recipient would read it.
 */
const NotificationPreview = ({ draft }) => {
  // SMS and WhatsApp share one plain-text preview, labelled after whichever
  // of the two is actually selected
  const available = PREVIEW_TABS.filter((tab) =>
    tab.key === CHANNELS.SMS
      ? draft.channels.includes(CHANNELS.SMS) ||
        draft.channels.includes(CHANNELS.WHATSAPP)
      : draft.channels.includes(tab.key),
  ).map((tab) =>
    tab.key === CHANNELS.SMS && !draft.channels.includes(CHANNELS.SMS)
      ? { ...tab, label: "WhatsApp" }
      : tab,
  );

  const [manual, setManual] = useState(null);
  const activeTab =
    available.find((tab) => tab.key === manual) || available[0];
  const active = activeTab?.key;

  const activeMeta =
    active === CHANNELS.SMS && !draft.channels.includes(CHANNELS.SMS)
      ? CHANNEL_META[CHANNELS.WHATSAPP]
      : CHANNEL_META[active];

  if (!available.length) {
    return (
      <p className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-10 text-center text-sm text-gray-500">
        Preview appears once a channel is picked.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {available.length > 1 ? (
        <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
          {available.map((tab) => {
            const Icon = tab.icon;
            const isActive = active === tab.key;

            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setManual(tab.key)}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition-all ${
                  isActive
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                <Icon size={13} />
                {tab.label}
              </button>
            );
          })}
        </div>
      ) : null}

      {active === CHANNELS.PUSH ? <PushPreview draft={draft} /> : null}
      {active === CHANNELS.IN_APP ? <InAppPreview draft={draft} /> : null}
      {active === CHANNELS.EMAIL ? <EmailPreview draft={draft} /> : null}
      {active === CHANNELS.SMS ? <SmsPreview draft={draft} /> : null}

      <p className="text-[11px] leading-relaxed text-gray-400">
        Merge tags are filled with sample values.{" "}
        {activeMeta?.requiresLabel
          ? `Recipients without ${activeMeta.requiresLabel} are skipped on this channel.`
          : "Everyone in the audience receives this."}
      </p>
    </div>
  );
};

export default NotificationPreview;
