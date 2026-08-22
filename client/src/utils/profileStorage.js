const PROFILE_KEY = "arfusion_profile";
const ADDRESS_KEY = "arfusion_addresses";
const SETTINGS_KEY = "arfusion_settings";
const SESSION_KEY = "arfusion_session";

/* =====================================================
   DEFAULT PROFILE
===================================================== */

export const defaultProfile = {
  name: "John Doe",
  email: "john.doe@example.com",
  phone: "",
  membership: "Premium Member",
};

/* =====================================================
   DEFAULT SETTINGS
===================================================== */

export const defaultSettings = {
  emailNotifications: true,
  orderNotifications: true,
  promotionalNotifications: false,
};

/* =====================================================
   PROFILE
===================================================== */

export function getProfile() {
  try {
    const stored = localStorage.getItem(PROFILE_KEY);

    return stored
      ? {
          ...defaultProfile,
          ...JSON.parse(stored),
        }
      : defaultProfile;
  } catch {
    return defaultProfile;
  }
}

export function saveProfile(profile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

/* =====================================================
   ADDRESSES
===================================================== */

export function getAddresses() {
  try {
    const stored = localStorage.getItem(ADDRESS_KEY);

    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveAddresses(addresses) {
  localStorage.setItem(ADDRESS_KEY, JSON.stringify(addresses));
}

/* =====================================================
   SETTINGS
===================================================== */

export function getSettings() {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);

    return stored
      ? {
          ...defaultSettings,
          ...JSON.parse(stored),
        }
      : defaultSettings;
  } catch {
    return defaultSettings;
  }
}

export function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

/* =====================================================
   SESSION
===================================================== */

export function setSession(value) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(value));
}

export function getSession() {
  try {
    const stored = localStorage.getItem(SESSION_KEY);

    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}
