import { useMemo, useState } from "react";
import {
  AlertTriangle,
  BellRing,
  CalendarClock,
  CheckCircle2,
  Clock,
  FileText,
  History,
  PenSquare,
  Send,
  Users,
} from "lucide-react";
import { toast } from "react-hot-toast";

import {
  CHANNELS,
  CHANNEL_META,
  DELIVERY_STATUS,
  EMPTY_AUDIENCE,
  SCHEDULE_MODES,
} from "../../constants/notification";
import {
  MOCK_HISTORY,
  MOCK_TEMPLATES,
  sendCampaign,
  summariseHistory,
} from "../../components/notifications/notificationsMock";
import AudienceBuilder from "../../components/notifications/AudienceBuilder";
import ChannelPicker from "../../components/notifications/ChannelPicker";
import ComposeForm from "../../components/notifications/ComposeForm";
import HistoryPanel from "../../components/notifications/HistoryPanel";
import NotificationPreview from "../../components/notifications/NotificationPreview";
import TemplatesPanel from "../../components/notifications/TemplatesPanel";
import {
  Button,
  Input,
  Modal,
  PageHeader,
  Pill,
  SectionCard,
  StatCard,
  Tabs,
} from "../../components/UI/kit";
import { formatDateTime } from "../../utils/datetime";

const TAB_KEYS = { COMPOSE: "compose", TEMPLATES: "templates", HISTORY: "history" };

const EMPTY_DRAFT = {
  channels: [CHANNELS.PUSH, CHANNELS.IN_APP],
  title: "",
  body: "",
  imageUrl: "",
  deepLink: "",
  subject: "",
  emailBody: "",
  smsBody: "",
};

const EMPTY_SCHEDULE = { mode: SCHEDULE_MODES.NOW, date: "", time: "" };

const percent = (part, whole) =>
  whole > 0 ? `${Math.round((part / whole) * 100)}%` : "—";

/**
 * Lists everything standing between the draft and a send, so the summary card
 * can explain exactly what is missing instead of just greying the button out.
 */
const validate = ({ draft, audience, schedule, scheduledAt }) => {
  const problems = [];
  const has = (channel) => draft.channels.includes(channel);

  if (!draft.channels.length) problems.push("Pick at least one channel.");
  if (!audience.count) problems.push("The audience is empty.");

  if ((has(CHANNELS.PUSH) || has(CHANNELS.IN_APP)) && !draft.title.trim()) {
    problems.push("Push and in-app need a title.");
  }
  if ((has(CHANNELS.PUSH) || has(CHANNELS.IN_APP)) && !draft.body.trim()) {
    problems.push("Push and in-app need a message.");
  }
  if (has(CHANNELS.EMAIL) && !draft.subject.trim()) {
    problems.push("Email needs a subject.");
  }
  if (has(CHANNELS.EMAIL) && !draft.emailBody.trim()) {
    problems.push("Email needs a body.");
  }
  if ((has(CHANNELS.SMS) || has(CHANNELS.WHATSAPP)) && !draft.smsBody.trim()) {
    problems.push("SMS and WhatsApp need a message.");
  }

  if (schedule.mode === SCHEDULE_MODES.LATER) {
    if (!schedule.date || !schedule.time) {
      problems.push("Pick a date and a time to schedule.");
    } else if (scheduledAt && new Date(scheduledAt).getTime() <= Date.now()) {
      problems.push("The scheduled time has already passed.");
    }
  }

  return problems;
};

export const NotificationsPage = () => {
  const [tab, setTab] = useState(TAB_KEYS.COMPOSE);
  const [draft, setDraft] = useState(EMPTY_DRAFT);
  const [audienceState, setAudienceState] = useState(EMPTY_AUDIENCE);
  const [audience, setAudience] = useState({
    mode: EMPTY_AUDIENCE.mode,
    label: "No one selected",
    count: 0,
    exact: true,
  });
  const [schedule, setSchedule] = useState(EMPTY_SCHEDULE);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Local until the notifications API exists — see notificationsMock.js
  const [history, setHistory] = useState(MOCK_HISTORY);
  const [templates, setTemplates] = useState(MOCK_TEMPLATES);

  const stats = useMemo(() => summariseHistory(history), [history]);

  const scheduledAt = useMemo(() => {
    if (schedule.mode !== SCHEDULE_MODES.LATER) return null;
    if (!schedule.date || !schedule.time) return null;
    return new Date(`${schedule.date}T${schedule.time}`).toISOString();
  }, [schedule]);

  const problems = useMemo(
    () => validate({ draft, audience, schedule, scheduledAt }),
    [draft, audience, schedule, scheduledAt],
  );

  /** Channels that quietly skip anyone missing a contact detail */
  const reachNotes = draft.channels
    .map((key) => CHANNEL_META[key])
    .filter((meta) => meta?.requiresLabel);

  const resetAll = () => {
    setDraft(EMPTY_DRAFT);
    setSchedule(EMPTY_SCHEDULE);
    setAudienceState(EMPTY_AUDIENCE);
  };

  const handleSend = async () => {
    setIsSending(true);

    try {
      const campaign = await sendCampaign({ draft, audience, scheduledAt });
      setHistory((previous) => [campaign, ...previous]);
      setConfirmOpen(false);
      resetAll();
      setTab(TAB_KEYS.HISTORY);

      toast.success(
        campaign.status === DELIVERY_STATUS.SCHEDULED
          ? `Scheduled for ${formatDateTime(campaign.scheduledAt)}`
          : `Sent to ${campaign.targeted} recipients`,
      );
    } finally {
      setIsSending(false);
    }
  };

  const useTemplate = (template) => {
    setDraft((previous) => ({
      ...previous,
      channels: template.channels,
      title: template.title,
      body: template.body,
      subject: template.title,
      emailBody: template.body,
      smsBody: template.body,
    }));
    setTab(TAB_KEYS.COMPOSE);
    toast.success(`Loaded "${template.name}"`);
  };

  const duplicateCampaign = (item) => {
    setDraft((previous) => ({
      ...previous,
      channels: item.channels,
      title: item.title,
      body: item.body,
      subject: item.title,
      emailBody: item.body,
      smsBody: item.body,
    }));
    setTab(TAB_KEYS.COMPOSE);
    toast.success("Copied into the composer");
  };

  const cancelScheduled = (item) => {
    if (!window.confirm(`Cancel "${item.title}"? It will not be sent.`)) return;

    setHistory((previous) =>
      previous.map((row) =>
        row._id === item._id
          ? { ...row, status: DELIVERY_STATUS.CANCELLED }
          : row,
      ),
    );
    toast.success("Schedule cancelled");
  };

  const scheduledCount = history.filter(
    (item) => item.status === DELIVERY_STATUS.SCHEDULED,
  ).length;

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <PageHeader
        title="Notifications"
        subtitle="Write one update and send it to a role, a filtered segment or a hand-picked list."
        actions={
          tab === TAB_KEYS.COMPOSE ? (
            <Button variant="secondary" onClick={resetAll}>
              Clear draft
            </Button>
          ) : (
            <Button icon={PenSquare} onClick={() => setTab(TAB_KEYS.COMPOSE)}>
              New notification
            </Button>
          )
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Recipients reached"
          value={stats.sent.toLocaleString("en-IN")}
          hint="Across every campaign"
          icon={Users}
          tone="blue"
        />
        <StatCard
          label="Delivered"
          value={percent(stats.delivered, stats.sent)}
          hint={`${stats.delivered.toLocaleString("en-IN")} delivered`}
          icon={CheckCircle2}
          tone="green"
        />
        <StatCard
          label="Opened"
          value={percent(stats.opened, stats.delivered)}
          hint={`${stats.opened.toLocaleString("en-IN")} opened`}
          icon={BellRing}
          tone="purple"
        />
        <StatCard
          label="Scheduled"
          value={stats.scheduled}
          hint={`${stats.failed.toLocaleString("en-IN")} failed deliveries`}
          icon={CalendarClock}
          tone="amber"
        />
      </div>

      <Tabs
        active={tab}
        onChange={setTab}
        tabs={[
          { key: TAB_KEYS.COMPOSE, label: "Compose", icon: PenSquare },
          {
            key: TAB_KEYS.TEMPLATES,
            label: "Templates",
            icon: FileText,
            count: templates.length,
          },
          {
            key: TAB_KEYS.HISTORY,
            label: "History",
            icon: History,
            count: history.length,
          },
        ]}
      />

      {tab === TAB_KEYS.COMPOSE ? (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <SectionCard
              title="1. Channels"
              description="Pick every channel this update should go out on."
            >
              <ChannelPicker
                value={draft.channels}
                onChange={(channels) => setDraft({ ...draft, channels })}
              />
            </SectionCard>

            <SectionCard
              title="2. Audience"
              description="Who receives it."
              action={
                <Pill tone={audience.count ? "blue" : "slate"}>
                  {audience.exact ? "" : "at least "}
                  {audience.count.toLocaleString("en-IN")} recipients
                </Pill>
              }
            >
              <AudienceBuilder
                value={audienceState}
                onChange={setAudienceState}
                onResolve={setAudience}
              />
            </SectionCard>

            <SectionCard title="3. Message" description="What they read.">
              <ComposeForm value={draft} onChange={setDraft} />
            </SectionCard>
          </div>

          {/* Preview + send summary */}
          <div className="space-y-6 lg:sticky lg:top-6 lg:self-start">
            <SectionCard title="Preview" bodyClassName="p-5">
              <NotificationPreview draft={draft} />
            </SectionCard>

            <SectionCard title="Send" bodyClassName="p-5">
              <div className="space-y-4">
                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Going to
                  </p>
                  <p className="mt-1 text-2xl font-bold text-gray-900">
                    {audience.exact ? "" : "≥ "}
                    {audience.count.toLocaleString("en-IN")}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-600">
                    {audience.label}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-1">
                    {draft.channels.map((key) => (
                      <Pill key={key} tone={CHANNEL_META[key].tone}>
                        {CHANNEL_META[key].label}
                      </Pill>
                    ))}
                  </div>
                </div>

                {/* Schedule */}
                <div>
                  <div className="mb-2 flex gap-1 rounded-lg bg-gray-100 p-1">
                    {[
                      { key: SCHEDULE_MODES.NOW, label: "Send now", icon: Send },
                      {
                        key: SCHEDULE_MODES.LATER,
                        label: "Schedule",
                        icon: Clock,
                      },
                    ].map((option) => {
                      const Icon = option.icon;
                      const isActive = schedule.mode === option.key;

                      return (
                        <button
                          key={option.key}
                          type="button"
                          onClick={() =>
                            setSchedule({ ...schedule, mode: option.key })
                          }
                          className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition-all ${
                            isActive
                              ? "bg-white text-blue-600 shadow-sm"
                              : "text-gray-500 hover:text-gray-800"
                          }`}
                        >
                          <Icon size={13} />
                          {option.label}
                        </button>
                      );
                    })}
                  </div>

                  {schedule.mode === SCHEDULE_MODES.LATER ? (
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="date"
                        value={schedule.date}
                        onChange={(event) =>
                          setSchedule({ ...schedule, date: event.target.value })
                        }
                      />
                      <Input
                        type="time"
                        value={schedule.time}
                        onChange={(event) =>
                          setSchedule({ ...schedule, time: event.target.value })
                        }
                      />
                    </div>
                  ) : null}
                </div>

                {reachNotes.length ? (
                  <ul className="space-y-1 rounded-lg bg-amber-50 p-3 text-[11px] leading-relaxed text-amber-800 ring-1 ring-inset ring-amber-200">
                    {reachNotes.map((meta) => (
                      <li key={meta.label}>
                        {meta.label} skips recipients without{" "}
                        {meta.requiresLabel}.
                      </li>
                    ))}
                  </ul>
                ) : null}

                {problems.length ? (
                  <ul className="space-y-1.5 text-xs text-gray-600">
                    {problems.map((problem) => (
                      <li key={problem} className="flex items-start gap-2">
                        <AlertTriangle
                          size={13}
                          className="mt-0.5 shrink-0 text-amber-500"
                        />
                        {problem}
                      </li>
                    ))}
                  </ul>
                ) : null}

                <Button
                  className="w-full"
                  icon={schedule.mode === SCHEDULE_MODES.LATER ? Clock : Send}
                  disabled={problems.length > 0}
                  onClick={() => setConfirmOpen(true)}
                >
                  {schedule.mode === SCHEDULE_MODES.LATER
                    ? "Schedule notification"
                    : "Send now"}
                </Button>

                <p className="text-center text-[11px] text-gray-400">
                  Sending is simulated — the notifications API is not wired yet.
                </p>
              </div>
            </SectionCard>
          </div>
        </div>
      ) : null}

      {tab === TAB_KEYS.TEMPLATES ? (
        <SectionCard title="Templates" bodyClassName="p-6">
          <TemplatesPanel
            templates={templates}
            draft={draft}
            onUse={useTemplate}
            onSave={(template) => {
              setTemplates((previous) => [template, ...previous]);
              toast.success("Template saved");
            }}
            onDelete={(template) => {
              if (!window.confirm(`Delete "${template.name}"?`)) return;
              setTemplates((previous) =>
                previous.filter((item) => item._id !== template._id),
              );
              toast.success("Template deleted");
            }}
          />
        </SectionCard>
      ) : null}

      {tab === TAB_KEYS.HISTORY ? (
        <SectionCard
          title="Sent notifications"
          description={
            scheduledCount
              ? `${scheduledCount} still waiting to go out`
              : "Everything that has gone out so far"
          }
          bodyClassName="p-6"
        >
          <HistoryPanel
            history={history}
            onDuplicate={duplicateCampaign}
            onCancel={cancelScheduled}
          />
        </SectionCard>
      ) : null}

      <Modal
        open={confirmOpen}
        size="sm"
        title={
          schedule.mode === SCHEDULE_MODES.LATER
            ? "Schedule this notification?"
            : "Send this notification?"
        }
        description="This goes out to everyone in the audience below."
        onClose={() => setConfirmOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmOpen(false)}>
              Back
            </Button>
            <Button icon={Send} loading={isSending} onClick={handleSend}>
              {schedule.mode === SCHEDULE_MODES.LATER
                ? "Confirm schedule"
                : "Yes, send it"}
            </Button>
          </>
        }
      >
        <div className="space-y-3 text-sm">
          <div className="rounded-xl bg-gray-50 p-4">
            <p className="font-semibold text-gray-900">
              {draft.title || draft.subject || "Untitled notification"}
            </p>
            <p className="mt-1 text-xs text-gray-600">
              {draft.body || draft.smsBody || draft.emailBody}
            </p>
          </div>

          <p className="text-gray-700">
            <span className="font-semibold">
              {audience.exact ? "" : "At least "}
              {audience.count.toLocaleString("en-IN")} recipients
            </span>{" "}
            — {audience.label}
          </p>

          <p className="text-gray-700">
            Channels:{" "}
            {draft.channels.map((key) => CHANNEL_META[key].label).join(", ")}
          </p>

          {scheduledAt ? (
            <p className="text-gray-700">
              Goes out on{" "}
              <span className="font-semibold">
                {formatDateTime(scheduledAt)}
              </span>
            </p>
          ) : null}
        </div>
      </Modal>
    </div>
  );
};

export default NotificationsPage;
