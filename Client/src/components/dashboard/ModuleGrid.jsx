import { Link } from "react-router-dom";
import {
  ArrowRight,
  Calendar,
  FileText,
  MessageSquareText,
  Package,
  Users,
  Video,
} from "lucide-react";
import { cx } from "./ui";

const tone = {
  indigo: {
    ring: "ring-indigo-100",
    bg: "bg-indigo-50",
    text: "text-indigo-700",
    icon: Users,
  },
  emerald: {
    ring: "ring-emerald-100",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    icon: Calendar,
  },
  violet: {
    ring: "ring-violet-100",
    bg: "bg-violet-50",
    text: "text-violet-700",
    icon: Video,
  },
  rose: {
    ring: "ring-rose-100",
    bg: "bg-rose-50",
    text: "text-rose-700",
    icon: FileText,
  },
  amber: {
    ring: "ring-amber-100",
    bg: "bg-amber-50",
    text: "text-amber-700",
    icon: Package,
  },
  cyan: {
    ring: "ring-cyan-100",
    bg: "bg-cyan-50",
    text: "text-cyan-700",
    icon: MessageSquareText,
  },
};

export const ModuleGrid = ({ modules }) => {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {modules.map((m) => {
        const meta = tone[m.tone] || tone.indigo;
        const Icon = meta.icon;
        return (
          <div
            key={m.id}
            className={cx(
              "group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ring-1 ring-black/5",
              meta.ring
            )}
          >
            <div
              className={cx(
                "absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-40",
                meta.bg
              )}
            />

            <div className="relative flex items-start gap-4">
              <div
                className={cx(
                  "flex h-11 w-11 items-center justify-center rounded-2xl",
                  meta.bg,
                  meta.text
                )}
              >
                <Icon className="h-5 w-5" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-900">
                  {m.title}
                </p>
                <p className="mt-1 line-clamp-2 text-xs text-slate-600">
                  {m.description}
                </p>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                    <p className="text-[11px] font-medium text-slate-600">
                      {m.stats.primaryLabel}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {m.stats.primaryValue}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                    <p className="text-[11px] font-medium text-slate-600">
                      {m.stats.secondaryLabel}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {m.stats.secondaryValue}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <Link
                    to={m.href}
                    className={cx(
                      "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold",
                      meta.bg,
                      meta.text
                    )}
                  >
                    {m.cta}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>

                  <span className="text-xs text-slate-400">CRM</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
