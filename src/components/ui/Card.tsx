import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={`rounded-lg border shadow-sm ${className} bg-[var(--surface)] border-[var(--border)]`}
    >
      {children}
    </div>
  );
}

export default Card;
