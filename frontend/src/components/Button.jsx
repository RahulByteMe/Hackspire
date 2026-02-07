import React from "react";

export function Button({ variant = "primary", size = "md", className = "", ...props }) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950";
  const sizes = size === "sm" ? "h-9 px-3 text-sm" : "h-11 px-4 text-sm";
  const variants = {
    primary: "bg-brand-500 text-white hover:bg-brand-400",
    secondary: "bg-white/10 text-white hover:bg-white/15 border border-white/10",
    ghost: "bg-transparent text-white hover:bg-white/10",
    danger: "bg-rose-600 text-white hover:bg-rose-500"
  };

  return <button className={[base, sizes, variants[variant], className].join(" ")} {...props} />;
}
