import React from "react";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "accent" | "error";
  size?: "sm" | "md" | "lg";
};

const base =
  "inline-flex items-center justify-center font-medium rounded focus:outline-none transition-colors disabled:opacity-50 disabled:pointer-events-none";
const variants = {
  primary:
    "bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] border border-[var(--primary)]",
  secondary:
    "bg-[var(--secondary)] text-[var(--foreground)] hover:bg-[var(--card)] border border-[var(--border)]",
  accent:
    "bg-[var(--accent)] text-white hover:bg-cyan-500 border border-[var(--accent)]",
  error:
    "bg-[var(--error)] text-white hover:bg-[var(--error-hover)] border border-[var(--error)]",
};
const sizes = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-base",
  lg: "px-6 py-3 text-lg",
};

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}) => (
  <button
    className={[base, variants[variant], sizes[size], className].join(" ")}
    {...props}
  />
);

export default Button;
