type LogoProps = {
  size?: number;
  withText?: boolean;
  className?: string;
};

export default function Logo({ size = 32, withText = true, className = "" }: LogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`.trim()}>
      <span
        className="grid place-items-center rounded-xl bg-brand-600 text-white shadow-soft"
        style={{ width: size, height: size }}
        aria-hidden
      >
        <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24" fill="none">
          <path
            d="M5 17h2m10 0h2M4 13l1.5-4.5A2 2 0 0 1 7.4 7h9.2a2 2 0 0 1 1.9 1.5L20 13v4a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-1H7v1a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-4Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      {withText ? (
        <span className="font-display text-lg font-semibold tracking-tight text-ink">
          Aju<span className="text-brand-600">Laju</span>
        </span>
      ) : null}
    </div>
  );
}
