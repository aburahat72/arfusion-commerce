// =====================================================
// MAIN ENTRY POINT
// =====================================================

import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";

import App from "./App";

import { store } from "./store/store";

// =====================================================
// CUSTOMER AUTHENTICATION
// =====================================================

import { AuthProvider } from "./context/AuthContext";

// =====================================================
// ADMIN AUTHENTICATION
// =====================================================

import { AdminAuthProvider } from "./context/AdminAuthContext";

// =====================================================
// GLOBAL STYLES
// =====================================================

import "./index.css";

// =====================================================
// RENDER APPLICATION
// =====================================================

ReactDOM.createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    {/* =================================================
        CUSTOMER + ADMIN AUTH PROVIDERS

        Customer authentication:
        AuthProvider

        Admin authentication:
        AdminAuthProvider

        They are intentionally kept separate.
    ================================================= */}

    <AuthProvider>
      <AdminAuthProvider>
        <App />
      </AdminAuthProvider>
    </AuthProvider>
  </Provider>,
);
