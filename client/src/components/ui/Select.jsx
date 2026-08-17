function Select({
  label,
  name,
  value = "",
  onChange,
  options = [],
  placeholder = "Select an option",
  error = "",
  helperText = "",
  disabled = false,
  required = false,
}) {
  const selectId = `select-${name}`;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={selectId}
          className="mb-2 block text-sm font-medium text-text"
        >
          {label}

          {required && <span className="ml-1 text-error">*</span>}
        </label>
      )}

      <select
        id={selectId}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={
          error || helperText ? `${selectId}-message` : undefined
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
      >
        <option value="">{placeholder}</option>

        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>

      {(error || helperText) && (
        <p
          id={`${selectId}-message`}
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

export default Select;
