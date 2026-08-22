import { ArrowLeft, Save } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { getProfile, saveProfile } from "../../utils/profileStorage";

function PersonalInformation() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(getProfile());

  const [saved, setSaved] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setProfile((current) => ({
      ...current,
      [name]: value,
    }));

    setSaved(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    saveProfile(profile);

    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2500);
  };

  return (
    <main className="min-h-screen bg-background py-8 sm:py-10">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => navigate("/profile")}
          className="mb-6 flex items-center gap-2 text-sm text-text-secondary transition hover:text-primary"
        >
          <ArrowLeft size={17} />
          Back to Profile
        </button>

        <section className="rounded-3xl border border-outline-variant bg-surface p-6 shadow-sm sm:p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-text">
              Personal Information
            </h1>

            <p className="mt-2 text-sm text-text-secondary">
              Keep your personal information up to date.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Field
              label="Full Name"
              name="name"
              value={profile.name}
              onChange={handleChange}
              required
            />

            <Field
              label="Email Address"
              name="email"
              type="email"
              value={profile.email}
              onChange={handleChange}
              required
            />

            <Field
              label="Phone Number"
              name="phone"
              type="tel"
              value={profile.phone}
              onChange={handleChange}
              placeholder="+91 XXXXX XXXXX"
            />

            {saved && (
              <div className="rounded-xl bg-success/10 px-4 py-3 text-sm font-medium text-success">
                Profile updated successfully.
              </div>
            )}

            <div className="flex flex-col gap-3 pt-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => navigate("/profile")}
                className="rounded-xl border border-outline-variant px-5 py-3 text-sm font-medium text-text transition hover:bg-surface-container"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
              >
                <Save size={17} />
                Save Changes
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}

function Field({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-medium text-text"
      >
        {label}

        {required && <span className="ml-1 text-error">*</span>}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="
          min-h-11
          w-full
          rounded-xl
          border
          border-outline-variant
          bg-surface
          px-4
          text-sm
          text-text
          outline-none
          transition
          placeholder:text-text-secondary
          focus:border-primary
          focus:ring-2
          focus:ring-primary/20
        "
      />
    </div>
  );
}

export default PersonalInformation;
