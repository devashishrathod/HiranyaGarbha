import { useState } from "react";
import { BookmarkPlus, FileText, Trash2, Wand2 } from "lucide-react";

import { CHANNEL_META } from "../../constants/notification";
import { Button, EmptyState, Input, Modal, Pill, Textarea } from "../UI/kit";

/**
 * Saved copy an admin can drop straight into the composer. Saving pulls the
 * channels and the text out of whatever is currently in the compose tab.
 */
const TemplatesPanel = ({
  templates = [],
  draft,
  onUse,
  onSave,
  onDelete,
}) => {
  const [saveOpen, setSaveOpen] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });

  const canSave = Boolean(
    draft?.channels?.length && (draft.title || draft.body || draft.smsBody),
  );

  const openSave = () => {
    setForm({ name: draft.title || "", description: "" });
    setSaveOpen(true);
  };

  const submit = () => {
    onSave({
      _id: `tpl_${Date.now()}`,
      name: form.name.trim() || "Untitled template",
      description: form.description.trim(),
      channels: draft.channels,
      title: draft.title,
      body: draft.body || draft.smsBody,
      audienceHint: "Saved from the composer",
    });
    setSaveOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-500">
          Re-usable copy for the updates you send often.
        </p>
        <Button
          variant="secondary"
          icon={BookmarkPlus}
          onClick={openSave}
          disabled={!canSave}
          title={
            canSave
              ? "Save what is in the compose tab"
              : "Write something in the compose tab first"
          }
        >
          Save current draft
        </Button>
      </div>

      {!templates.length ? (
        <EmptyState
          icon={FileText}
          title="No templates yet"
          message="Write a notification in the compose tab and save it here to re-use later."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {templates.map((template) => (
            <article
              key={template._id}
              className="flex flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-semibold text-gray-900">
                    {template.name}
                  </h3>
                  <p className="mt-0.5 text-xs text-gray-500">
                    {template.description}
                  </p>
                </div>
                <button
                  type="button"
                  title="Delete template"
                  onClick={() => onDelete(template)}
                  className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 size={15} />
                </button>
              </div>

              <div className="mt-3 flex flex-wrap gap-1">
                {template.channels.map((key) => (
                  <Pill key={key} tone={CHANNEL_META[key]?.tone}>
                    {CHANNEL_META[key]?.label || key}
                  </Pill>
                ))}
              </div>

              <div className="mt-3 flex-1 rounded-lg bg-gray-50 p-3">
                <p className="text-xs font-semibold text-gray-800">
                  {template.title}
                </p>
                <p className="mt-1 line-clamp-3 text-xs leading-relaxed text-gray-600">
                  {template.body}
                </p>
              </div>

              <p className="mt-3 text-[11px] text-gray-400">
                Usually sent to: {template.audienceHint}
              </p>

              <Button
                className="mt-4 w-full"
                variant="soft"
                icon={Wand2}
                onClick={() => onUse(template)}
              >
                Use this template
              </Button>
            </article>
          ))}
        </div>
      )}

      <Modal
        open={saveOpen}
        size="sm"
        title="Save as template"
        description="The channels and copy from the compose tab are stored with it."
        onClose={() => setSaveOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setSaveOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submit} disabled={!form.name.trim()}>
              Save template
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Template name"
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            placeholder="Appointment reminder"
          />
          <Textarea
            label="When to use it"
            rows={3}
            value={form.description}
            onChange={(event) =>
              setForm({ ...form, description: event.target.value })
            }
            placeholder="Day-before nudge for a booked consultation"
          />
        </div>
      </Modal>
    </div>
  );
};

export default TemplatesPanel;
