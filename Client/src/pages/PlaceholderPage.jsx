import React from "react";

export const PlaceholderPage = ({ title, subtitle }) => {
  return (
    <div className="p-4 sm:p-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h1 className="text-xl font-semibold text-slate-800">{title}</h1>
        <p className="mt-2 text-sm text-slate-600">
          {subtitle || "This module will be available soon."}
        </p>
      </div>
    </div>
  );
};
