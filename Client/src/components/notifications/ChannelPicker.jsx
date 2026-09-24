import { Bell, Mail, MessageCircle, MessageSquare, Smartphone } from "lucide-react";

import {
  CHANNELS,
  CHANNEL_META,
  CHANNEL_ORDER,
} from "../../constants/notification";

const CHANNEL_ICONS = {
  [CHANNELS.PUSH]: Smartphone,
  [CHANNELS.IN_APP]: Bell,
  [CHANNELS.EMAIL]: Mail,
  [CHANNELS.SMS]: MessageSquare,
  [CHANNELS.WHATSAPP]: MessageCircle,
};

const ACTIVE_CLASS = {
  blue: "border-blue-500 bg-blue-50/70 ring-blue-500",
  purple: "border-purple-500 bg-purple-50/70 ring-purple-500",
  teal: "border-teal-500 bg-teal-50/70 ring-teal-500",
  amber: "border-amber-500 bg-amber-50/70 ring-amber-500",
  green: "border-emerald-500 bg-emerald-50/70 ring-emerald-500",
};

const ICON_CLASS = {
  blue: "bg-blue-100 text-blue-600",
  purple: "bg-purple-100 text-purple-600",
  teal: "bg-teal-100 text-teal-600",
  amber: "bg-amber-100 text-amber-600",
  green: "bg-emerald-100 text-emerald-600",
};

/**
 * Multi-select over the delivery channels. A campaign can go out on more than
 * one at a time, which is why these are toggles rather than a radio group.
 */
const ChannelPicker = ({ value = [], onChange }) => {
  const toggle = (channel) => {
    if (!CHANNEL_META[channel].available) return;

    onChange(
      value.includes(channel)
        ? value.filter((item) => item !== channel)
        : [...value, channel],
    );
  };

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {CHANNEL_ORDER.map((channel) => {
        const meta = CHANNEL_META[channel];
        const Icon = CHANNEL_ICONS[channel];
        const isActive = value.includes(channel);
        const disabled = !meta.available;

        let cardClass = "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50";
        if (disabled) {
          cardClass = "cursor-not-allowed border-gray-200 bg-gray-50 opacity-60";
        } else if (isActive) {
          cardClass = `${ACTIVE_CLASS[meta.tone]} ring-1`;
        }

        return (
          <button
            key={channel}
            type="button"
            onClick={() => toggle(channel)}
            aria-pressed={isActive}
            disabled={disabled}
            title={disabled ? meta.unavailableNote : meta.hint}
            className={`flex flex-col items-start gap-2 rounded-xl border p-3 text-left transition-all ${cardClass}`}
          >
            <span
              className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                isActive && !disabled
                  ? ICON_CLASS[meta.tone]
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              <Icon size={18} />
            </span>
            <span className="flex items-center gap-1.5 text-sm font-semibold text-gray-900">
              {meta.label}
              {disabled ? (
                <span className="rounded bg-gray-200 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide text-gray-500">
                  Soon
                </span>
              ) : null}
            </span>
            <span className="text-[11px] leading-snug text-gray-500">
              {disabled ? meta.unavailableNote : meta.hint}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default ChannelPicker;
