import { Outlet } from "react-router-dom";
import TopBarLoggedOut from "../components/TopBarLoggedOut";

const LoggedOutLayout = ({ onLogin }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <TopBarLoggedOut onLogin={onLogin} />

      <div className="flex-1 ">
        <Outlet />
      </div>
    </div>
  );
};

export default LoggedOutLayout;
