import { HTMLAttributes } from "react";

type CardProps = HTMLAttributes<HTMLDivElement>;

export default function Card({ className = "", ...props }: CardProps) {
  return (
    <div
      className={`rounded-2xl border border-surface-border bg-white shadow-soft ${className}`.trim()}
      {...props}
    />
  );
}
