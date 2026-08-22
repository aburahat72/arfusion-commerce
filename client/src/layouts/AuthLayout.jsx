import { Outlet } from "react-router-dom";

function AuthLayout() {
  return (
    <div className="min-h-dvh w-full">
      <Outlet />
    </div>
  );
}

export default AuthLayout;
