function Badge({
  children,
  variant = "neutral",
  size = "medium",
  dot = false,
}) {
  const variants = {
    neutral:
      "bg-[var(--color-surface-container)] text-[var(--color-text-secondary)]",

    primary:
      "bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)]",

    success: "bg-[var(--color-success-container)] text-[var(--color-success)]",

    warning: "bg-[var(--color-warning-container)] text-[var(--color-warning)]",

    error: "bg-[var(--color-error-container)] text-[var(--color-error)]",

    info: "bg-[var(--color-info-container)] text-[var(--color-info)]",
  };

  const sizes = {
    small: "px-2 py-0.5 text-xs",
    medium: "px-2.5 py-1 text-xs",
    large: "px-3 py-1.5 text-sm",
  };

  const dots = {
    neutral: "bg-[var(--color-text-secondary)]",
    primary: "bg-[var(--color-primary)]",
    success: "bg-[var(--color-success)]",
    warning: "bg-[var(--color-warning)]",
    error: "bg-[var(--color-error)]",
    info: "bg-[var(--color-info)]",
  };

  return (
    <span
      className={`
        inline-flex
        items-center
        gap-1.5
        rounded-full
        font-medium
        ${variants[variant]}
        ${sizes[size]}
      `}
    >
      {dot && (
        <span
          className={`h-1.5 w-1.5 rounded-full ${dots[variant]}`}
          aria-hidden="true"
        />
      )}

      {children}
    </span>
  );
}

export default Badge;
