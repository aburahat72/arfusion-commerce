function Button({
  children,
  type = "button",
  variant = "filled",
  size = "medium",
  disabled = false,
  loading = false,
  fullWidth = false,
  onClick,
}) {
  const baseStyles =
    "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 focus-visible:outline-2 focus-visible:outline-[var(--color-primary)] disabled:pointer-events-none disabled:opacity-50";

  const variantStyles = {
    filled:
      "bg-[var(--color-primary)] text-[var(--color-on-primary)] hover:bg-[var(--color-primary-hover)]",

    outlined:
      "border border-[var(--color-outline-variant)] bg-transparent text-[var(--color-text)] hover:bg-[var(--color-surface-container)]",

    tonal:
      "bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] hover:brightness-95",

    text: "text-[var(--color-primary)] hover:bg-[var(--color-primary-container)]",

    danger: "bg-[var(--color-error)] text-white hover:brightness-90",
  };

  const sizeStyles = {
    small: "min-h-9 px-4 text-sm",
    medium: "min-h-11 px-5 text-sm",
    large: "min-h-12 px-6 text-base",
  };

  const widthStyle = fullWidth ? "w-full" : "";

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyle}`}
    >
      {loading ? (
        <>
          <span
            className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
            aria-hidden="true"
          />
          <span>Loading...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}

export default Button;
