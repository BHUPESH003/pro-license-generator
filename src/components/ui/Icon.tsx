import React from "react";

interface IconProps {
  name: "user" | "lock";
  className?: string;
  size?: number;
}

const icons = {
  user: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
    </svg>
  ),
  lock: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
};

export const Icon: React.FC<IconProps> = ({
  name,
  className = "",
  size = 24,
}) => (
  <span
    className={className}
    style={{ display: "inline-block", width: size, height: size }}
  >
    {React.cloneElement(icons[name], { width: size, height: size })}
  </span>
);

export default Icon;
