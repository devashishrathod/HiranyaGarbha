import { useEffect, useRef, useState } from "react";
import {
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  LogIn,
  MoreVertical,
  PlayCircle,
  UserX,
  XCircle,
} from "lucide-react";

import { getAvailableActions } from "../../constants/appointment";

const ACTION_META = {
  confirm: { label: "Confirm", icon: CheckCircle2 },
  checkIn: { label: "Check in patient", icon: LogIn },
  start: { label: "Start consultation", icon: PlayCircle },
  complete: { label: "Complete", icon: ClipboardCheck },
  reschedule: { label: "Reschedule", icon: CalendarClock },
  cancel: { label: "Cancel", icon: XCircle, danger: true },
  noShow: { label: "Mark no-show", icon: UserX, danger: true },
};

const AppointmentRowActions = ({ appointment, onAction, busy = false }) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  const actions = getAvailableActions(appointment);

  useEffect(() => {
    if (!open) return undefined;

    const onDocumentClick = (event) => {
      if (!containerRef.current?.contains(event.target)) setOpen(false);
    };

    document.addEventListener("mousedown", onDocumentClick);
    return () => document.removeEventListener("mousedown", onDocumentClick);
  }, [open]);

  if (!actions.length) {
    return <span className="text-xs text-gray-400">No actions</span>;
  }

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      <button
        type="button"
        disabled={busy}
        onClick={() => setOpen((previous) => !previous)}
        className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
      >
        Actions
        <MoreVertical size={14} />
      </button>

      {open ? (
        <div className="absolute right-0 z-20 mt-1 w-52 overflow-hidden rounded-xl border border-gray-200 bg-white py-1 shadow-lg">
          {actions.map((action) => {
            const meta = ACTION_META[action];
            const Icon = meta.icon;

            return (
              <button
                key={action}
                type="button"
                onClick={() => {
                  setOpen(false);
                  onAction(action, appointment);
                }}
                className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors ${
                  meta.danger
                    ? "text-red-600 hover:bg-red-50"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Icon size={15} />
                {meta.label}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
};

export default AppointmentRowActions;
