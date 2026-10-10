import React from "react";

export function Badge({ variant, children }: { variant: string; children: React.ReactNode }) {
  return <span className={`badge badge-${variant}`}>{children}</span>;
}

export function Button({
  onClick,
  variant = "secondary",
  size = "small",
  children,
}: {
  onClick?: () => void;
  variant?: "primary" | "secondary";
  size?: "small" | "medium";
  children: React.ReactNode;
}) {
  return (
    <button type="button" className={`btn btn-${variant} btn-${size}`} onClick={onClick}>
      {children}
    </button>
  );
}

export function StatCard({ value, label }: { value: number | string; label: string }) {
  return (
    <div className="stat-card">
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}
