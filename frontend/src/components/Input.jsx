import React from "react";

export function Label({ children }) {
  return <div className="mb-1 text-sm font-semibold text-slate-200">{children}</div>;
}

export function Input(props) {
  return (
    <input
      {...props}
      className={[
        "h-11 w-full rounded-xl border border-white/10 bg-slate-950/40 px-3 text-sm text-white",
        "placeholder:text-slate-500",
        "focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/30",
        props.className ?? ""
      ].join(" ")}
    />
  );
}
