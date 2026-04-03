import { Outlet } from "react-router-dom";
import SuperAdminSidebar from "../components/SuperAdminSidebar";
import { PALETTE } from "../theme/palette";

const SuperAdminLayout = () => {
  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <SuperAdminSidebar />
      <div style={{ flex: 1, overflowY: "auto", background: PALETTE.surface }}>
        <Outlet />
      </div>
    </div>
  );
};

export default SuperAdminLayout;
