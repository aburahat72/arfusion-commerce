// =====================================================
// MAIN ENTRY POINT
// =====================================================

import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GoogleOAuthProvider } from "@react-oauth/google";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

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
import RealtimeBridge from "./components/realtime/RealtimeBridge";

// =====================================================
// GLOBAL STYLES
// =====================================================

import "./index.css";

// =====================================================
// RENDER APPLICATION
// =====================================================

const application = (
  <Provider store={store}>
    {/* =================================================
        CUSTOMER + ADMIN AUTH PROVIDERS

        Customer authentication:
        AuthProvider

        Admin authentication:
        AdminAuthProvider

        They are intentionally kept separate.
    ================================================= */}

    <QueryClientProvider client={queryClient}>
      <AuthProvider>
      <AdminAuthProvider>
        <>
          <RealtimeBridge />
          <App />
        </>
      </AdminAuthProvider>
      </AuthProvider>
    </QueryClientProvider>
  </Provider>
);

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
ReactDOM.createRoot(document.getElementById("root")).render(
  googleClientId ? (
    <GoogleOAuthProvider clientId={googleClientId}>
      {application}
    </GoogleOAuthProvider>
  ) : (
    application
  ),
);
