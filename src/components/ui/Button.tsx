import { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const variantClass: Record<ButtonVariant, string> = {
  primary:
    "bg-brand-600 text-white hover:bg-brand-700 focus-visible:ring-brand-300 disabled:bg-brand-600/50",
  secondary:
    "bg-white text-ink border border-surface-border hover:bg-surface-muted focus-visible:ring-brand-200 disabled:opacity-60",
  ghost:
    "bg-transparent text-ink hover:bg-slate-100 focus-visible:ring-slate-200 disabled:opacity-60",
};

const sizeClass: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-5 text-base",
};

export default function Button({
  className = "",
  variant = "primary",
  size = "md",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all outline-none focus-visible:ring-2 disabled:cursor-not-allowed active:translate-y-px ${sizeClass[size]} ${variantClass[variant]} ${className}`.trim()}
      {...props}
    />
  );
}
