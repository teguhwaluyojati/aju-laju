import { InputHTMLAttributes, forwardRef } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  invalid?: boolean;
};

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className = "", invalid = false, ...props },
  ref,
) {
  const borderClass = invalid
    ? "border-red-400 focus:border-red-500 focus:ring-red-200"
    : "border-surface-border focus:border-brand-500 focus:ring-brand-100";

  return (
    <input
      ref={ref}
      className={`h-11 w-full rounded-xl border bg-white px-3.5 text-sm text-ink outline-none transition placeholder:text-slate-400 focus:ring-4 disabled:cursor-not-allowed disabled:bg-slate-50 ${borderClass} ${className}`.trim()}
      {...props}
    />
  );
});

export default Input;
