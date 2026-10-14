/**
 * The white card every dashboard panel sits in. Same surface as the kit's
 * SectionCard, without its grey header band, so charts get the full height.
 */
const DashboardCard = ({
  title,
  description,
  action,
  children,
  className = "",
  bodyClassName = "px-5 pb-5",
}) => (
  <section
    className={`flex min-w-0 flex-col rounded-2xl border border-gray-200/80 bg-white shadow-sm ${className}`}
  >
    {title || action ? (
      <header className="flex flex-wrap items-start justify-between gap-3 px-5 pb-4 pt-5">
        <div className="min-w-0 flex-1 basis-48">
          {title ? (
            <h2 className="text-base font-semibold text-gray-900">{title}</h2>
          ) : null}
          {description ? (
            <p className="mt-0.5 text-sm text-gray-500">{description}</p>
          ) : null}
        </div>
        {action ? (
          <div className="flex min-w-0 max-w-full flex-wrap items-center gap-2">{action}</div>
        ) : null}
      </header>
    ) : null}
    <div className={`flex-1 ${bodyClassName}`}>{children}</div>
  </section>
);

export default DashboardCard;
