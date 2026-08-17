function Input({
  label,
  name,
  type = "text",
  value = "",
  onChange,
  placeholder = "",
  error = "",
  helperText = "",
  disabled = false,
  required = false,
  autoComplete,
}) {
  const inputId = `input-${name}`;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="mb-2 block text-sm font-medium text-text"
        >
          {label}

          {required && <span className="ml-1 text-error">*</span>}
        </label>
      )}

      <input
        id={inputId}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        autoComplete={autoComplete}
        aria-invalid={Boolean(error)}
        aria-describedby={
          error || helperText ? `${inputId}-message` : undefined
        }
        className={`
          min-h-11
          w-full
          rounded-xl
          border
          bg-surface
          px-4
          text-sm
          text-text
          outline-none
          transition-all
          duration-200
          placeholder:text-text-secondary

          disabled:cursor-not-allowed
          disabled:bg-surface-container
          disabled:opacity-60

          focus:ring-2

          ${
            error
              ? "border-error focus:border-error focus:ring-error/20"
              : "border-outline-variant focus:border-primary focus:ring-primary/20"
          }
        `}
      />

      {(error || helperText) && (
        <p
          id={`${inputId}-message`}
          className={`mt-1.5 text-xs ${
            error ? "text-error" : "text-text-secondary"
          }`}
        >
          {error || helperText}
        </p>
      )}
    </div>
  );
}

export default Input;
