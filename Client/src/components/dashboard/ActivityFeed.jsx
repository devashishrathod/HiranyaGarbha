import {
  Calendar,
  ClipboardList,
  MessageSquareText,
  UserPlus,
} from "lucide-react";
import { cx } from "./ui";

const typeMeta = {
  appointments: { icon: Calendar, tone: "text-emerald-700 bg-emerald-50" },
  users: { icon: UserPlus, tone: "text-indigo-700 bg-indigo-50" },
  enquiries: {
    icon: MessageSquareText,
    tone: "text-cyan-700 bg-cyan-50",
  },
  content: {
    icon: ClipboardList,
    tone: "text-rose-700 bg-rose-50",
  },
};

export const ActivityFeed = ({ items }) => {
  if (!items?.length) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-600">
        No recent activity.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((a) => {
        const meta = typeMeta[a.type] || typeMeta.content;
        const Icon = meta.icon;

        return (
          <div
            key={a.id}
            className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/30 p-3"
          >
            <div
              className={cx(
                "mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl",
                meta.tone
              )}
            >
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-900">
                {a.title}
              </p>
              <p className="truncate text-xs text-slate-600">{a.meta}</p>
            </div>
            <div className="shrink-0 text-xs font-medium text-slate-500">
              {a.at}
            </div>
          </div>
        );
      })}
    </div>
  );
};
