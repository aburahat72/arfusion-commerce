import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "../../context/AuthContext";
import { useAdminAuth } from "../../context/AdminAuthContext";

const realtimeEvents = [
  "notification:new",
  "order:status",
  "inventory:updated",
  "payment:status",
  "return:status",
];

const getSocketOrigin = () => {
  const apiUrl =
    import.meta.env.VITE_API_URL || "http://localhost:3000/api";
  return new URL(apiUrl, window.location.origin).origin;
};

const publishEvent = (name, detail) => {
  window.dispatchEvent(new CustomEvent(`arfusion:${name}`, { detail }));
};

function RealtimeBridge() {
  const { user: customer } = useAuth();
  const { user: admin } = useAdminAuth();
  const [toast, setToast] = useState(null);
  const timer = useRef(null);

  useEffect(() => {
    const sockets = [];
    const listeners = [];
    const handleEvent = (eventName, payload) => {
      publishEvent(eventName, payload);
      const message =
        payload?.message ||
        (payload?.orderStatus
          ? `Order status: ${payload.orderStatus}`
          : payload?.status
            ? `Payment status: ${payload.status}`
            : eventName === "inventory:updated"
              ? "Inventory was updated."
              : "");
      if (message) {
        setToast({ title: payload?.title || "ARFusion update", message });
        window.clearTimeout(timer.current);
        timer.current = window.setTimeout(() => setToast(null), 6000);
      }
    };

    const connect = (token) => {
      if (!token) return;
      const socket = io(getSocketOrigin(), {
        auth: { token },
        transports: ["websocket", "polling"],
        reconnection: true,
      });
      for (const eventName of realtimeEvents) {
        const listener = (payload) => handleEvent(eventName, payload);
        socket.on(eventName, listener);
        listeners.push([socket, eventName, listener]);
      }
      sockets.push(socket);
    };

    if (customer?.role === "customer") {
      connect(localStorage.getItem("arfusion_token"));
    }
    if (admin?.role === "admin") {
      connect(localStorage.getItem("arfusion_admin_token"));
    }

    return () => {
      sockets.forEach((socket) => socket.disconnect());
      listeners.forEach(([socket, eventName, listener]) => {
        socket.off(eventName, listener);
      });
      window.clearTimeout(timer.current);
    };
  }, [customer?._id, customer?.role, admin?._id, admin?.role]);

  return toast ? (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 right-4 z-[100] max-w-sm rounded-xl border border-outline-variant bg-surface p-4 text-text shadow-xl"
    >
      <p className="text-sm font-semibold">{toast.title}</p>
      <p className="mt-1 text-sm text-text-secondary">{toast.message}</p>
      <button
        type="button"
        onClick={() => setToast(null)}
        className="mt-2 text-xs font-semibold text-primary"
      >
        Dismiss
      </button>
    </div>
  ) : null;
}

export default RealtimeBridge;
