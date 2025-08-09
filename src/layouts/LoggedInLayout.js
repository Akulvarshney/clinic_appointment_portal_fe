import { Outlet } from "react-router-dom";
import Sidebar from "../components/SideBar";

const LoggedInLayout = () => {
  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <Sidebar />
      <div style={{ flex: 1, overflowY: "auto" }}>
        <Outlet />
      </div>
    </div>
  );
};

export default LoggedInLayout;
