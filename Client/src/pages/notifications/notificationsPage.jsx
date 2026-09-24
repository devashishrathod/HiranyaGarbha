import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
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

import { getApiErrorMessage, useApiMutation, useGetQuery } from "../../api/apiCall";
import API_ENDPOINTS from "../../api/apiEndpoint";
import {
  CHANNELS,
  CHANNEL_META,
  DELIVERY_STATUS,
  EMPTY_AUDIENCE,
  SCHEDULE_MODES,
  buildAudienceTarget,
} from "../../constants/notification";
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
import { buildQuery, withPath } from "../../utils/ids";
import { formatDateTime } from "../../utils/datetime";

const TAB_KEYS = {
  COMPOSE: "compose",
  TEMPLATES: "templates",
  HISTORY: "history",
};

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
const EMPTY_FILTERS = { search: "", status: "", channel: "" };

const percent = (part, whole) =>
  whole > 0 ? `${Math.round((part / whole) * 100)}%` : "—";

/**
 * Everything standing between the draft and a send.
 *
 * Returned as a list rather than a boolean so the send panel can say what is
 * missing — a greyed-out button with no explanation is the most common way an
 * admin gets stuck on a form like this.
 */
const validate = ({ draft, audience, schedule, scheduledAt }) => {
  const problems = [];
  const has = (channel) => draft.channels.includes(channel);

  if (!draft.channels.length) problems.push("Pick at least one channel.");

  if (audience.loading) {
    problems.push("Working out how many people this reaches…");
  } else if (!audience.count) {
    problems.push("The audience is empty.");
  } else if (audience.truncated) {
    problems.push("The audience is over the limit for a single send.");
  }

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
  const queryClient = useQueryClient();

  const [tab, setTab] = useState(TAB_KEYS.COMPOSE);
  const [draft, setDraft] = useState(EMPTY_DRAFT);
  const [audienceState, setAudienceState] = useState(EMPTY_AUDIENCE);
  const [audience, setAudience] = useState({
    mode: EMPTY_AUDIENCE.mode,
    label: "No one selected",
    count: 0,
    truncated: false,
    loading: false,
  });
  const [schedule, setSchedule] = useState(EMPTY_SCHEDULE);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(filters.search.trim());
      setPage(1);
    }, 350);

    return () => clearTimeout(timer);
  }, [filters.search]);

  /* ---------------- queries ---------------- */

  const historyEndpoint = useMemo(
    () =>
      `${API_ENDPOINTS.NOTIFICATIONS.GET_ALL}${buildQuery({
        page,
        limit: 20,
        search: search || undefined,
        status: filters.status || undefined,
        channel: filters.channel || undefined,
      })}`,
    [page, search, filters.status, filters.channel],
  );

  const {
    data: historyData,
    isLoading: historyLoading,
    error: historyError,
    refetch: refetchHistory,
  } = useGetQuery(
    historyEndpoint,
    ["notification-campaigns", page, search, filters.status, filters.channel],
    {
      /**
       * A send-now campaign answers 202 and finishes in the background, so the
       * row lands as SENDING with empty stats. Re-poll only while something is
       * actually in flight — a fixed interval would keep hammering the endpoint
       * on a screen nobody is watching.
       */
      refetchInterval: (query) => {
        const rows = query?.state?.data?.data?.data || [];
        return rows.some((row) => row.status === DELIVERY_STATUS.SENDING)
          ? 3000
          : false;
      },
    },
  );

  const campaigns = historyData?.data?.data || [];
  const totalPages = historyData?.data?.totalPages || 1;
  // The list endpoint answers 404 when nothing matches.
  const historyEmpty =
    historyError?.response?.status === 404 ||
    (!historyLoading && !campaigns.length);
  const historyHardError =
    historyError && historyError?.response?.status !== 404
      ? historyError
      : null;

  const { data: statsData, refetch: refetchStats } = useGetQuery(
    API_ENDPOINTS.NOTIFICATIONS.STATS,
    ["notification-stats"],
  );
  const stats = statsData?.data || {};

  const {
    data: templateData,
    isLoading: templatesLoading,
    refetch: refetchTemplates,
  } = useGetQuery(API_ENDPOINTS.NOTIFICATIONS.TEMPLATES.GET_ALL, [
    "notification-templates",
  ]);
  const templates = templateData?.data?.data || [];

  /* ---------------- mutations ---------------- */

  const { mutate: sendCampaign, isPending: isSending } = useApiMutation();
  const {
    mutate: cancelCampaign,
    variables: cancelVars,
    isPending: isCancelling,
  } = useApiMutation({ method: "patch" });
  const { mutate: saveTemplate, isPending: isSavingTemplate } = useApiMutation();
  const {
    mutate: removeTemplate,
    variables: deleteVars,
    isPending: isDeleting,
  } = useApiMutation({ method: "delete" });

  /**
   * Which row is mid-request, read back out of the url the mutation was given.
   *
   * ⚠️ Gated on `isPending`: react-query keeps `variables` after a mutation
   * settles, so without it the last row stayed disabled once the request had
   * finished.
   */
  const cancellingId = isCancelling
    ? cancelVars?.url?.split("/")?.slice(-2, -1)[0]
    : null;
  const deletingTemplateId = isDeleting
    ? deleteVars?.url?.split("/").pop()
    : null;

  /* ---------------- derived ---------------- */

  const scheduledAt = useMemo(() => {
    if (schedule.mode !== SCHEDULE_MODES.LATER) return null;
    if (!schedule.date || !schedule.time) return null;
    return new Date(`${schedule.date}T${schedule.time}`).toISOString();
  }, [schedule]);

  const problems = useMemo(
    () => validate({ draft, audience, schedule, scheduledAt }),
    [draft, audience, schedule, scheduledAt],
  );

  /** Channels that quietly skip anyone missing a contact detail. */
  const reachNotes = draft.channels
    .map((key) => CHANNEL_META[key])
    .filter((meta) => meta?.requiresLabel);

  const resetAll = () => {
    setDraft(EMPTY_DRAFT);
    setSchedule(EMPTY_SCHEDULE);
    setAudienceState(EMPTY_AUDIENCE);
  };

  const refreshHistory = () => {
    refetchHistory();
    refetchStats();
  };

  /* ---------------- handlers ---------------- */

  const handleSend = () => {
    const payload = {
      channels: draft.channels,
      audience: buildAudienceTarget(audienceState),
      title: draft.title.trim(),
      body: draft.body.trim(),
      ...(draft.imageUrl ? { imageUrl: draft.imageUrl.trim() } : {}),
      ...(draft.deepLink ? { deepLink: draft.deepLink.trim() } : {}),
      ...(draft.channels.includes(CHANNELS.EMAIL)
        ? { subject: draft.subject.trim(), emailBody: draft.emailBody.trim() }
        : {}),
      ...(scheduledAt ? { scheduledAt } : {}),
    };

    sendCampaign(
      { url: API_ENDPOINTS.NOTIFICATIONS.CREATE, data: payload },
      {
        onSuccess: (res) => {
          setConfirmOpen(false);
          resetAll();
          setTab(TAB_KEYS.HISTORY);
          setPage(1);
          refreshHistory();

          const total = res?.data?.audience?.total ?? 0;
          toast.success(
            scheduledAt
              ? `Scheduled for ${formatDateTime(scheduledAt)}`
              : `Sending to ${total.toLocaleString("en-IN")} recipients`,
          );
        },
        onError: (error) => {
          // Kept open: the audience or the copy needs fixing, and closing the
          // dialog would hide what the admin was about to send.
          toast.error(getApiErrorMessage(error, "Could not send the notification"));
        },
      },
    );
  };

  const handleCancel = (campaign) => {
    if (!window.confirm(`Cancel "${campaign.title}"? It will not be sent.`)) {
      return;
    }

    cancelCampaign(
      { url: withPath(API_ENDPOINTS.NOTIFICATIONS.CANCEL, { id: campaign._id }) },
      {
        onSuccess: () => {
          toast.success("Schedule cancelled");
          refreshHistory();
        },
      },
    );
  };

  const loadIntoComposer = (source, message) => {
    setDraft((previous) => ({
      ...previous,
      channels: source.channels?.length ? source.channels : previous.channels,
      title: source.title || "",
      body: source.body || "",
      subject: source.subject || source.title || "",
      emailBody: source.emailBody || source.body || "",
      smsBody: source.body || "",
      imageUrl: source.imageUrl || "",
      deepLink: source.deepLink || "",
    }));
    setTab(TAB_KEYS.COMPOSE);
    toast.success(message);
  };

  const handleSaveTemplate = (payload, onDone) => {
    saveTemplate(
      { url: API_ENDPOINTS.NOTIFICATIONS.TEMPLATES.CREATE, data: payload },
      {
        onSuccess: () => {
          toast.success("Template saved");
          refetchTemplates();
          onDone?.();
        },
      },
    );
  };

  const handleDeleteTemplate = (template) => {
    if (!window.confirm(`Delete "${template.name}"?`)) return;

    removeTemplate(
      {
        url: withPath(API_ENDPOINTS.NOTIFICATIONS.TEMPLATES.DELETE, {
          id: template._id,
        }),
      },
      {
        onSuccess: () => {
          toast.success("Template deleted");
          refetchTemplates();
        },
      },
    );
  };

  // Compose fields changed, so any cached audience count for the old target is
  // stale — react-query keys on the target itself, so this only has to nudge.
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["notification-audience"] });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audienceState.mode]);

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
          label="Recipients targeted"
          value={(stats.targeted || 0).toLocaleString("en-IN")}
          hint={`Across ${stats.campaigns || 0} campaigns`}
          icon={Users}
          tone="blue"
        />
        <StatCard
          label="Delivered"
          value={percent(stats.delivered, stats.targeted)}
          hint={`${(stats.delivered || 0).toLocaleString("en-IN")} push and email`}
          icon={CheckCircle2}
          tone="green"
        />
        <StatCard
          label="Recorded in-app"
          value={(stats.recorded || 0).toLocaleString("en-IN")}
          hint="Rows written to recipients' feeds"
          icon={BellRing}
          tone="purple"
        />
        <StatCard
          label="Scheduled"
          value={stats.scheduled || 0}
          hint={`${(stats.failed || 0).toLocaleString("en-IN")} failed deliveries`}
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
          { key: TAB_KEYS.HISTORY, label: "History", icon: History },
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
                  {audience.loading
                    ? "counting…"
                    : `${audience.count.toLocaleString("en-IN")} recipients`}
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
                    {audience.loading
                      ? "…"
                      : audience.count.toLocaleString("en-IN")}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-600">{audience.label}</p>

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
                        {meta.label} skips recipients without {meta.requiresLabel}.
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
                  Delivery runs in the background — the History tab updates as it
                  completes.
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
            isLoading={templatesLoading}
            isSaving={isSavingTemplate}
            deletingId={deletingTemplateId}
            onUse={(template) =>
              loadIntoComposer(template, `Loaded "${template.name}"`)
            }
            onSave={handleSaveTemplate}
            onDelete={handleDeleteTemplate}
          />
        </SectionCard>
      ) : null}

      {tab === TAB_KEYS.HISTORY ? (
        <SectionCard
          title="Sent notifications"
          description={
            stats.scheduled
              ? `${stats.scheduled} still waiting to go out`
              : "Everything that has gone out so far"
          }
          bodyClassName="p-6"
        >
          <HistoryPanel
            campaigns={campaigns}
            filters={filters}
            onFiltersChange={setFilters}
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            isLoading={historyLoading}
            isEmpty={historyEmpty}
            error={historyHardError}
            onRetry={refetchHistory}
            cancellingId={cancellingId}
            onDuplicate={(item) =>
              loadIntoComposer(item, "Copied into the composer")
            }
            onCancel={handleCancel}
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
              {draft.body || draft.emailBody}
            </p>
          </div>

          <p className="text-gray-700">
            <span className="font-semibold">
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
              <span className="font-semibold">{formatDateTime(scheduledAt)}</span>
            </p>
          ) : null}
        </div>
      </Modal>
    </div>
  );
};

export default NotificationsPage;
