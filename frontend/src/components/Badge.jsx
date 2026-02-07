import React from "react";

export function Badge({ children, tone = "neutral" }) {
  const map = {
    neutral: "border-white/10 bg-white/5 text-slate-200",
    success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
    warning: "border-amber-500/30 bg-amber-500/10 text-amber-200",
    danger: "border-rose-500/30 bg-rose-500/10 text-rose-200"
  };
  return (
    <span className={["inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold", map[tone]].join(" ")}>
      {children}
    </span>
  );
}
