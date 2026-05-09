import { Outlet } from "react-router-dom";
import TopBarLoggedOut from "../components/TopBarLoggedOut";

const LoggedOutLayout = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <TopBarLoggedOut />
      <div className="min-w-0 flex-1">
        <Outlet />
      </div>
    </div>
  );
};

export default LoggedOutLayout;
