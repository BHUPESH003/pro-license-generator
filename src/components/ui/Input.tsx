import React from "react";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input: React.FC<InputProps> = ({ className = "", ...props }) => (
  <input
    className={`block w-full px-3 py-2 border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] rounded focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] transition ${className}`}
    {...props}
  />
);

export default Input;
