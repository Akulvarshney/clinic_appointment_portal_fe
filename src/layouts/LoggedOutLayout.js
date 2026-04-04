import { Outlet } from "react-router-dom";
import TopBarLoggedOut from "../components/TopBarLoggedOut";

const LoggedOutLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <TopBarLoggedOut />
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
};

export default LoggedOutLayout;
