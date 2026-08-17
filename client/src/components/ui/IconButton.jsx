function IconButton({
  children,
  label,
  type = "button",
  variant = "standard",
  size = "medium",
  disabled = false,
  onClick,
}) {
  const baseStyles =
    "inline-flex items-center justify-center rounded-full transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-[var(--color-primary)] disabled:pointer-events-none disabled:opacity-50";

  const variantStyles = {
    standard:
      "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-container)] hover:text-[var(--color-text)]",

    filled:
      "bg-[var(--color-primary)] text-[var(--color-on-primary)] hover:bg-[var(--color-primary-hover)]",

    tonal:
      "bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] hover:brightness-95",

    outlined:
      "border border-[var(--color-outline-variant)] bg-white text-[var(--color-text)] hover:bg-[var(--color-surface-container)]",
  };

  const sizeStyles = {
    small: "h-9 w-9",
    medium: "h-10 w-10",
    large: "h-12 w-12",
  };

  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]}`}
    >
      {children}
    </button>
  );
}

export default IconButton;
