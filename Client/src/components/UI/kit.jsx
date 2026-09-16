import { useEffect } from "react";
import { X } from "lucide-react";

/* ------------------------------------------------------------------ */
/* Tones                                                               */
/* ------------------------------------------------------------------ */

const TONES = {
  slate: "bg-slate-100 text-slate-700 ring-slate-200",
  blue: "bg-blue-50 text-blue-700 ring-blue-200",
  green: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  amber: "bg-amber-50 text-amber-700 ring-amber-200",
  red: "bg-red-50 text-red-700 ring-red-200",
  purple: "bg-purple-50 text-purple-700 ring-purple-200",
  teal: "bg-teal-50 text-teal-700 ring-teal-200",
  pink: "bg-pink-50 text-pink-700 ring-pink-200",
};

const ICON_TONES = {
  slate: "bg-slate-100 text-slate-600",
  blue: "bg-blue-100 text-blue-600",
  green: "bg-emerald-100 text-emerald-600",
  amber: "bg-amber-100 text-amber-600",
  red: "bg-red-100 text-red-600",
  purple: "bg-purple-100 text-purple-600",
  teal: "bg-teal-100 text-teal-600",
  pink: "bg-pink-100 text-pink-600",
};

/* ------------------------------------------------------------------ */
/* Avatar                                                              */
/* ------------------------------------------------------------------ */

const AVATAR_SIZES = {
  sm: "w-9 h-9 text-xs",
  md: "w-12 h-12 text-sm",
  lg: "w-16 h-16 text-lg",
  xl: "w-24 h-24 text-2xl",
};

export const Avatar = ({ src, name = "", size = "md", className = "" }) => {
  const initials =
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "?";

  const base = `${AVATAR_SIZES[size] || AVATAR_SIZES.md} rounded-full shrink-0 object-cover ${className}`;

  if (src) {
    return <img src={src} alt={name || "avatar"} className={`${base} ring-2 ring-white shadow-sm`} />;
  }

  return (
    <div
      className={`${base} flex items-center justify-center font-semibold text-white bg-gradient-to-br from-blue-500 to-purple-500 ring-2 ring-white shadow-sm`}
    >
      {initials}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Pills & chips                                                       */
/* ------------------------------------------------------------------ */

export const Pill = ({ tone = "slate", children, className = "" }) => (
  <span
    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ring-1 ring-inset ${
      TONES[tone] || TONES.slate
    } ${className}`}
  >
    {children}
  </span>
);

export const Chip = ({ tone = "blue", children }) => (
  <span
    className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium ring-1 ring-inset ${
      TONES[tone] || TONES.blue
    }`}
  >
    {children}
  </span>
);

/* ------------------------------------------------------------------ */
/* Stat card                                                           */
/* ------------------------------------------------------------------ */

export const StatCard = ({ label, value, hint, icon: Icon, tone = "blue" }) => (
  <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
          {label}
        </p>
        <p className="mt-2 text-2xl font-bold text-gray-900 truncate">{value}</p>
        {hint ? <p className="mt-1 text-xs text-gray-500">{hint}</p> : null}
      </div>
      {Icon ? (
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
            ICON_TONES[tone] || ICON_TONES.blue
          }`}
        >
          <Icon size={20} />
        </div>
      ) : null}
    </div>
  </div>
);

/* ------------------------------------------------------------------ */
/* Meters                                                              */
/* ------------------------------------------------------------------ */

/**
 * Single-hue magnitude meter. Every meter here is one series with its own text
 * label, so identity never rests on colour alone and no categorical palette is
 * needed.
 */
export const MeterBar = ({ value = 0, max = 100, label, className = "" }) => {
  const safeMax = max > 0 ? max : 1;
  const percent = Math.max(0, Math.min(100, (value / safeMax) * 100));

  return (
    <div
      className={`h-2 w-full overflow-hidden rounded-full bg-gray-100 ${className}`}
      role="img"
      aria-label={label || `${Math.round(percent)} percent`}
    >
      <div
        className="h-full rounded-full bg-blue-600 transition-[width] duration-500"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
};

/**
 * Horizontal bar list for comparing a handful of labelled counts.
 * Long category labels read better horizontally than as rotated axis ticks.
 */
export const BarBreakdown = ({ items = [], emptyLabel = "No data yet" }) => {
  const max = items.reduce((peak, item) => Math.max(peak, item.value || 0), 0);

  if (!items.length || max === 0) {
    return <p className="py-6 text-center text-sm text-gray-500">{emptyLabel}</p>;
  }

  return (
    <ul className="space-y-3.5">
      {items.map((item) => (
        <li key={item.label} title={`${item.label}: ${item.value}`}>
          <div className="mb-1.5 flex items-baseline justify-between gap-3">
            <span className="text-sm text-gray-700">{item.label}</span>
            <span className="text-sm font-semibold tabular-nums text-gray-900">
              {item.value}
            </span>
          </div>
          <MeterBar
            value={item.value}
            max={max}
            label={`${item.label}: ${item.value}`}
          />
        </li>
      ))}
    </ul>
  );
};

/* ------------------------------------------------------------------ */
/* Section card                                                        */
/* ------------------------------------------------------------------ */

export const SectionCard = ({
  title,
  description,
  action,
  children,
  className = "",
  bodyClassName = "p-6",
}) => (
  <section
    className={`bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden ${className}`}
  >
    {(title || action) && (
      <header className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-gray-100 bg-gray-50/60">
        <div className="min-w-0">
          {title ? (
            <h2 className="text-base font-semibold text-gray-900">{title}</h2>
          ) : null}
          {description ? (
            <p className="text-sm text-gray-500 mt-0.5">{description}</p>
          ) : null}
        </div>
        {action ? <div className="flex items-center gap-2">{action}</div> : null}
      </header>
    )}
    <div className={bodyClassName}>{children}</div>
  </section>
);

/* ------------------------------------------------------------------ */
/* Field (label / value)                                               */
/* ------------------------------------------------------------------ */

export const Field = ({ label, value, className = "" }) => (
  <div className={className}>
    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
      {label}
    </p>
    <p className="mt-1 text-sm text-gray-900 break-words">
      {value === 0 || value ? value : <span className="text-gray-400">—</span>}
    </p>
  </div>
);

/* ------------------------------------------------------------------ */
/* Tabs                                                                */
/* ------------------------------------------------------------------ */

export const Tabs = ({ tabs, active, onChange, className = "" }) => (
  <div
    className={`flex gap-1 overflow-x-auto rounded-xl bg-gray-100 p-1 ${className}`}
  >
    {tabs.map((tab) => {
      const Icon = tab.icon;
      const isActive = active === tab.key;

      return (
        <button
          key={tab.key}
          type="button"
          onClick={() => onChange(tab.key)}
          className={`flex-1 min-w-max inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
            isActive
              ? "bg-white text-blue-600 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          {Icon ? <Icon size={16} /> : null}
          {tab.label}
          {typeof tab.count === "number" ? (
            <span
              className={`ml-1 rounded-full px-1.5 py-0.5 text-[11px] font-semibold ${
                isActive ? "bg-blue-50 text-blue-600" : "bg-gray-200 text-gray-600"
              }`}
            >
              {tab.count}
            </span>
          ) : null}
        </button>
      );
    })}
  </div>
);

/* ------------------------------------------------------------------ */
/* Modal                                                               */
/* ------------------------------------------------------------------ */

const MODAL_SIZES = {
  sm: "max-w-md",
  md: "max-w-2xl",
  lg: "max-w-4xl",
  xl: "max-w-6xl",
};

export const Modal = ({
  open,
  title,
  description,
  onClose,
  children,
  footer,
  size = "md",
}) => {
  useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose?.();
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px]"
      />
      <div
        className={`relative w-full ${MODAL_SIZES[size] || MODAL_SIZES.md} bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[92vh] flex flex-col`}
      >
        <header className="flex items-start justify-between gap-4 px-6 py-4 border-b border-gray-100">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            {description ? (
              <p className="text-sm text-gray-500 mt-0.5">{description}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 -mr-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>

        {footer ? (
          <footer className="flex flex-wrap items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/60">
            {footer}
          </footer>
        ) : null}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Buttons                                                             */
/* ------------------------------------------------------------------ */

const BUTTON_VARIANTS = {
  primary:
    "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-sm",
  secondary:
    "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50",
  danger: "bg-red-600 text-white hover:bg-red-700 shadow-sm",
  ghost: "text-gray-600 hover:bg-gray-100",
  soft: "bg-blue-50 text-blue-700 hover:bg-blue-100",
};

export const Button = ({
  variant = "primary",
  icon: Icon,
  children,
  className = "",
  loading = false,
  disabled = false,
  ...rest
}) => (
  <button
    type="button"
    disabled={disabled || loading}
    className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
      BUTTON_VARIANTS[variant] || BUTTON_VARIANTS.primary
    } ${className}`}
    {...rest}
  >
    {loading ? (
      <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
    ) : Icon ? (
      <Icon size={16} />
    ) : null}
    {children}
  </button>
);

/* ------------------------------------------------------------------ */
/* Form controls                                                       */
/* ------------------------------------------------------------------ */

const CONTROL_CLASS =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500";

export const Input = ({ label, hint, error, className = "", ...rest }) => (
  <label className={`block ${className}`}>
    {label ? (
      <span className="block text-xs font-medium text-gray-600 mb-1.5">
        {label}
      </span>
    ) : null}
    <input className={CONTROL_CLASS} {...rest} />
    {error ? (
      <span className="mt-1 block text-xs text-red-600">{error}</span>
    ) : hint ? (
      <span className="mt-1 block text-xs text-gray-400">{hint}</span>
    ) : null}
  </label>
);

export const Select = ({ label, children, className = "", ...rest }) => (
  <label className={`block ${className}`}>
    {label ? (
      <span className="block text-xs font-medium text-gray-600 mb-1.5">
        {label}
      </span>
    ) : null}
    <select className={CONTROL_CLASS} {...rest}>
      {children}
    </select>
  </label>
);

export const Textarea = ({ label, className = "", ...rest }) => (
  <label className={`block ${className}`}>
    {label ? (
      <span className="block text-xs font-medium text-gray-600 mb-1.5">
        {label}
      </span>
    ) : null}
    <textarea className={CONTROL_CLASS} {...rest} />
  </label>
);

/* ------------------------------------------------------------------ */
/* Empty & loading states                                              */
/* ------------------------------------------------------------------ */

export const EmptyState = ({
  icon: Icon,
  title = "Nothing here yet",
  message,
  action,
}) => (
  <div className="flex flex-col items-center justify-center py-14 text-center">
    {Icon ? (
      <div className="w-14 h-14 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center mb-4">
        <Icon size={26} />
      </div>
    ) : null}
    <h3 className="text-base font-semibold text-gray-800">{title}</h3>
    {message ? (
      <p className="mt-1 text-sm text-gray-500 max-w-sm">{message}</p>
    ) : null}
    {action ? <div className="mt-5">{action}</div> : null}
  </div>
);

export const InlineLoader = ({ label = "Loading..." }) => (
  <div className="flex items-center justify-center gap-3 py-12 text-sm text-gray-500">
    <span className="w-5 h-5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
    {label}
  </div>
);

export const SkeletonRows = ({ rows = 5 }) => (
  <div className="space-y-3 p-6">
    {Array.from({ length: rows }).map((_, index) => (
      <div key={index} className="flex items-center gap-4 animate-pulse">
        <div className="w-10 h-10 rounded-full bg-gray-200" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-1/3 rounded bg-gray-200" />
          <div className="h-3 w-1/5 rounded bg-gray-100" />
        </div>
        <div className="h-6 w-20 rounded-full bg-gray-100" />
      </div>
    ))}
  </div>
);

/* ------------------------------------------------------------------ */
/* Page header                                                         */
/* ------------------------------------------------------------------ */

export const PageHeader = ({ title, subtitle, actions, back }) => (
  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <div className="min-w-0">
      {back}
      <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      {subtitle ? <p className="text-sm text-gray-500 mt-1">{subtitle}</p> : null}
    </div>
    {actions ? (
      <div className="flex flex-wrap items-center gap-2">{actions}</div>
    ) : null}
  </div>
);
