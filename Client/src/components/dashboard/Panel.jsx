import { cx } from "./ui";

export const Panel = ({ title, subtitle, right, children, className }) => {
  return (
    <section
      className={cx(
        "rounded-2xl border border-slate-200/70 bg-white shadow-sm ring-1 ring-black/5",
        className
      )}
    >
      <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="truncate text-sm font-semibold text-slate-900">
            {title}
          </h2>
          {subtitle ? (
            <p className="mt-0.5 text-xs text-slate-600">{subtitle}</p>
          ) : null}
        </div>
        {right ? <div className="shrink-0">{right}</div> : null}
      </div>
      <div className="px-5 py-4">{children}</div>
    </section>
  );
};
