import { Outlet } from "react-router-dom";
import SuperAdminSidebar from "../components/SuperAdminSidebar";
import { PALETTE } from "../theme/palette";

const SuperAdminLayout = () => {
  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden md:h-[100dvh] md:max-h-[100dvh] md:flex-row md:overflow-hidden">
      <SuperAdminSidebar />
      <div
        className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden"
        style={{ background: PALETTE.surface }}
      >
        <Outlet />
      </div>
    </div>
  );
};

export default SuperAdminLayout;
