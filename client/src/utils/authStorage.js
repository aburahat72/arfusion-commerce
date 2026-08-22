const USERS_KEY = "arfusion_users";
const SESSION_KEY = "arfusion_session";

/* =====================================================
   DEFAULT USER STORAGE
===================================================== */

function getUsers() {
  try {
    const storedUsers = localStorage.getItem(USERS_KEY);

    return storedUsers ? JSON.parse(storedUsers) : [];
  } catch {
    return [];
  }
}

/* =====================================================
   SAVE USERS
===================================================== */

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

/* =====================================================
   REGISTER
===================================================== */

export function registerUser({ name, email, phone, password }) {
  const users = getUsers();

  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = users.find((user) => user.email === normalizedEmail);

  if (existingUser) {
    return {
      success: false,
      message: "An account with this email already exists.",
    };
  }

  const newUser = {
    id: crypto.randomUUID(),
    name: name.trim(),
    email: normalizedEmail,
    phone: phone.trim(),
    password,
    membership: "Premium Member",
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);

  saveUsers(users);

  return {
    success: true,
    user: newUser,
  };
}

/* =====================================================
   LOGIN
===================================================== */

export function loginUser({ email, password }) {
  const users = getUsers();

  const normalizedEmail = email.trim().toLowerCase();

  const user = users.find(
    (item) => item.email === normalizedEmail && item.password === password,
  );

  if (!user) {
    return {
      success: false,
      message: "Invalid email or password.",
    };
  }

  const sessionUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    membership: user.membership,
  };

  localStorage.setItem(
    SESSION_KEY,
    JSON.stringify({
      authenticated: true,
      user: sessionUser,
    }),
  );

  return {
    success: true,
    user: sessionUser,
  };
}

/* =====================================================
   SESSION
===================================================== */

export function getCurrentUser() {
  try {
    const session = localStorage.getItem(SESSION_KEY);

    if (!session) {
      return null;
    }

    const parsed = JSON.parse(session);

    if (!parsed?.authenticated) {
      return null;
    }

    return parsed.user || null;
  } catch {
    return null;
  }
}

/* =====================================================
   LOGOUT
===================================================== */

export function logoutUser() {
  localStorage.removeItem(SESSION_KEY);
}

/* =====================================================
   CHECK AUTH
===================================================== */

export function isAuthenticated() {
  return Boolean(getCurrentUser());
}
