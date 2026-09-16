import { Copy, Hash } from "lucide-react";

import {
  CHANNELS,
  CHANNEL_META,
  MERGE_TAGS,
  smsParts,
} from "../../constants/notification";
import { Input, Textarea } from "../UI/kit";

const CounterLine = ({ used, limit, extra }) => {
  const over = limit ? used > limit : false;

  return (
    <div className="mt-1 flex items-center justify-between text-[11px]">
      <span className="text-gray-400">{extra}</span>
      <span className={over ? "font-semibold text-red-600" : "text-gray-400"}>
        {used}
        {limit ? ` / ${limit}` : ""}
      </span>
    </div>
  );
};

/** Buttons that append a merge tag to whichever field is being edited */
const MergeTags = ({ onInsert }) => (
  <div className="flex flex-wrap items-center gap-1.5">
    <span className="inline-flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide text-gray-400">
      <Hash size={11} /> Personalise
    </span>
    {MERGE_TAGS.map((item) => (
      <button
        key={item.tag}
        type="button"
        title={item.label}
        onClick={() => onInsert(item.tag)}
        className="rounded-md bg-gray-100 px-2 py-1 font-mono text-[11px] text-gray-600 transition-colors hover:bg-blue-100 hover:text-blue-700"
      >
        {item.tag}
      </button>
    ))}
  </div>
);

/**
 * Content editor. Each channel family gets its own block so the character
 * limits and the fields on screen match what that channel can actually carry.
 */
const ComposeForm = ({ value, onChange }) => {
  const patch = (changes) => onChange({ ...value, ...changes });
  const has = (channel) => value.channels.includes(channel);

  const showRich = has(CHANNELS.PUSH) || has(CHANNELS.IN_APP);
  const showEmail = has(CHANNELS.EMAIL);
  const showText = has(CHANNELS.SMS) || has(CHANNELS.WHATSAPP);

  const appendTo = (field) => (tag) =>
    patch({ [field]: `${value[field] || ""}${tag}` });

  // Push is the strictest of the two rich channels, so it sets the limits
  const richMeta = has(CHANNELS.PUSH)
    ? CHANNEL_META[CHANNELS.PUSH]
    : CHANNEL_META[CHANNELS.IN_APP];

  const textMeta = has(CHANNELS.SMS)
    ? CHANNEL_META[CHANNELS.SMS]
    : CHANNEL_META[CHANNELS.WHATSAPP];

  if (!value.channels.length) {
    return (
      <p className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">
        Pick at least one channel above to start writing.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {showRich ? (
        <section className="space-y-3">
          <header className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-gray-900">
              {has(CHANNELS.PUSH) && has(CHANNELS.IN_APP)
                ? "Push & in-app"
                : has(CHANNELS.PUSH)
                  ? "Push notification"
                  : "In-app notification"}
            </h3>
            <MergeTags onInsert={appendTo("body")} />
          </header>

          <div>
            <Input
              label="Title"
              value={value.title}
              onChange={(event) => patch({ title: event.target.value })}
              placeholder="A new care package is live"
            />
            <CounterLine
              used={value.title.length}
              limit={richMeta.titleLimit}
              extra="Shown in bold on the device"
            />
          </div>

          <div>
            <Textarea
              label="Message"
              rows={4}
              value={value.body}
              onChange={(event) => patch({ body: event.target.value })}
              placeholder="Hi {{name}}, we have added something new for you. Open the app to take a look."
            />
            <CounterLine
              used={value.body.length}
              limit={richMeta.bodyLimit}
              extra="Long text gets trimmed on the lock screen"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              label="Image URL (optional)"
              value={value.imageUrl}
              onChange={(event) => patch({ imageUrl: event.target.value })}
              placeholder="https://..."
            />
            <Input
              label="Opens screen (optional)"
              value={value.deepLink}
              onChange={(event) => patch({ deepLink: event.target.value })}
              placeholder="app://packages/123"
              hint="Deep link the app opens on tap"
            />
          </div>
        </section>
      ) : null}

      {showEmail ? (
        <section className="space-y-3 border-t border-gray-100 pt-5">
          <header className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-gray-900">Email</h3>
            <div className="flex items-center gap-3">
              {showRich ? (
                <button
                  type="button"
                  onClick={() =>
                    patch({ subject: value.title, emailBody: value.body })
                  }
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-600 hover:underline"
                >
                  <Copy size={12} /> Copy from push
                </button>
              ) : null}
              <MergeTags onInsert={appendTo("emailBody")} />
            </div>
          </header>

          <Input
            label="Subject"
            value={value.subject}
            onChange={(event) => patch({ subject: event.target.value })}
            placeholder="Your new care package is ready"
          />

          <div>
            <Textarea
              label="Body"
              rows={7}
              value={value.emailBody}
              onChange={(event) => patch({ emailBody: event.target.value })}
              placeholder="Dear {{name}},"
            />
            <CounterLine
              used={value.emailBody.length}
              limit={CHANNEL_META[CHANNELS.EMAIL].bodyLimit}
              extra="Plain text for now — rich formatting comes with the API"
            />
          </div>
        </section>
      ) : null}

      {showText ? (
        <section className="space-y-3 border-t border-gray-100 pt-5">
          <header className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-gray-900">
              {has(CHANNELS.SMS) && has(CHANNELS.WHATSAPP)
                ? "SMS & WhatsApp"
                : has(CHANNELS.SMS)
                  ? "SMS"
                  : "WhatsApp"}
            </h3>
            <div className="flex items-center gap-3">
              {showRich ? (
                <button
                  type="button"
                  onClick={() => patch({ smsBody: value.body })}
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-600 hover:underline"
                >
                  <Copy size={12} /> Copy from push
                </button>
              ) : null}
              <MergeTags onInsert={appendTo("smsBody")} />
            </div>
          </header>

          <div>
            <Textarea
              label="Message"
              rows={4}
              value={value.smsBody}
              onChange={(event) => patch({ smsBody: event.target.value })}
              placeholder="Namaste {{firstName}}, ..."
            />
            <CounterLine
              used={value.smsBody.length}
              limit={textMeta.bodyLimit}
              extra={
                has(CHANNELS.SMS)
                  ? `${smsParts(value.smsBody)} SMS part${
                      smsParts(value.smsBody) === 1 ? "" : "s"
                    } per recipient`
                  : "WhatsApp needs an approved template"
              }
            />
          </div>
        </section>
      ) : null}
    </div>
  );
};

export default ComposeForm;
