import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Search, X } from "lucide-react";

import { useGetQuery } from "../../api/apiCall";
import { buildQuery } from "../../utils/ids";
import { Avatar } from "../UI/kit";

/**
 * Debounced search-and-select over any `/get-all` style list endpoint.
 * The list endpoints answer 404 when nothing matches, which is treated as empty.
 */
const EntityPicker = ({
  label,
  basePath,
  value,
  onChange,
  placeholder = "Search by name, email or phone",
  subtitleKey = "email",
  disabled = false,
}) => {
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(search.trim()), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (!open) return undefined;

    const onDocumentClick = (event) => {
      if (!containerRef.current?.contains(event.target)) setOpen(false);
    };

    document.addEventListener("mousedown", onDocumentClick);
    return () => document.removeEventListener("mousedown", onDocumentClick);
  }, [open]);

  const endpoint = useMemo(() => {
    if (disabled || !open) return null;
    return `${basePath}${buildQuery({
      search: debounced || undefined,
      isActive: true,
      limit: 8,
      page: 1,
    })}`;
  }, [basePath, debounced, open, disabled]);

  const { data, isLoading, error } = useGetQuery(endpoint, [
    "entity-picker",
    basePath,
    debounced,
  ]);

  const options = data?.data?.data || [];
  const isEmpty = !isLoading && (error?.response?.status === 404 || !options.length);

  if (value) {
    return (
      <div>
        {label ? (
          <span className="mb-1.5 block text-xs font-medium text-gray-600">
            {label}
          </span>
        ) : null}
        <div className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50/60 px-3 py-2.5">
          <Avatar size="sm" src={value.image} name={value.fullName || "?"} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-gray-900">
              {value.fullName || "Unnamed"}
            </p>
            <p className="truncate text-xs text-gray-500">
              {value[subtitleKey] || value.phone || value.whatsappNumber || "—"}
            </p>
          </div>
          {!disabled ? (
            <button
              type="button"
              onClick={() => onChange(null)}
              className="rounded-lg p-1.5 text-gray-400 hover:bg-white hover:text-gray-700"
            >
              <X size={16} />
            </button>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      {label ? (
        <span className="mb-1.5 block text-xs font-medium text-gray-600">
          {label}
        </span>
      ) : null}

      <div className="relative">
        <Search
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          value={search}
          disabled={disabled}
          onFocus={() => setOpen(true)}
          onChange={(event) => {
            setSearch(event.target.value);
            setOpen(true);
          }}
          placeholder={placeholder}
          className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
        />
      </div>

      {open ? (
        <div className="absolute z-30 mt-1 max-h-64 w-full overflow-y-auto rounded-xl border border-gray-200 bg-white py-1 shadow-lg">
          {isLoading ? (
            <p className="px-3 py-3 text-sm text-gray-500">Searching...</p>
          ) : isEmpty ? (
            <p className="px-3 py-3 text-sm text-gray-500">No matches found.</p>
          ) : (
            options.map((option) => (
              <button
                key={option._id}
                type="button"
                onClick={() => {
                  onChange(option);
                  setOpen(false);
                  setSearch("");
                }}
                className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-gray-50"
              >
                <Avatar
                  size="sm"
                  src={option.image}
                  name={option.fullName || "?"}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">
                    {option.fullName || "Unnamed"}
                  </p>
                  <p className="truncate text-xs text-gray-500">
                    {option[subtitleKey] ||
                      option.phone ||
                      option.whatsappNumber ||
                      "—"}
                  </p>
                </div>
                <Check size={15} className="text-transparent" />
              </button>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
};

export default EntityPicker;
