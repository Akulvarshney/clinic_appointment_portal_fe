import { Outlet } from "react-router-dom";
import TopBarLoggedOut from "../components/TopBarLoggedOut";

const LoggedOutLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <TopBarLoggedOut />
      <div className="flex-1 pt-[5.5rem] md:pt-[5.25rem]">
        <Outlet />
      </div>
    </div>
  );
};

export default LoggedOutLayout;
