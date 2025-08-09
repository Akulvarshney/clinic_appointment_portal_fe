import { Outlet } from "react-router-dom";
import TopBarLoggedOut from "../components/TopBarLoggedOut";

const LoggedOutLayout = ({ onLogin }) => {
  return (
    <div>
      <TopBarLoggedOut onLogin={onLogin} />
      <div>
        <Outlet />
      </div>
    </div>
  );
};

export default LoggedOutLayout;
