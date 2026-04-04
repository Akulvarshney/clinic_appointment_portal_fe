import React from "react";
import { Link } from "react-router-dom";
import { FaChartBar, FaUser, } from "react-icons/fa";
import { useAuth } from "../layouts/AuthContext";

const SuperAdminSidebar = () => {
  const { logout } = useAuth();
  return (
    <aside className="w-full md:w-64 bg-gw-surface p-6 shadow-2xl border-r border-gw-muted animate-fadeInUp">
      <h2 className="text-3xl font-extrabold text-gw-primary-dark mb-10 tracking-widest uppercase">
        GloryWellnic
      </h2>
      <ul className="space-y-6 text-lg">
        <li>
          <Link
            to="/superadmin/dashboard"
            className="flex items-center text-gw-primary-dark font-bold hover:text-gw-primary transition duration-300 no-underline"
          >
            <FaChartBar className="mr-3" /> Main Dashboard
          </Link>
        </li>
        <li>
          <Link
            to="/sa/organisationListing"
            className="flex items-center text-gw-primary-dark font-bold hover:text-gw-primary transition duration-300 no-underline"
          >
            <FaChartBar className="mr-3" /> Organizations
          </Link>
        </li>
        <li>
          <Link
            to="/sa/NotificationManagement"
            className="flex items-center text-gw-primary-dark font-bold hover:text-gw-primary transition duration-300 no-underline"
          >
            <FaChartBar className="mr-3" /> NotificationCenter
          </Link>
        </li>
        {/* <li className="flex items-center text-gray-600 hover:text-blue-500 transition duration-300 cursor-pointer">
          <FaShoppingCart className="mr-3" /> NFT Marketplace
        </li>
        <li className="flex items-center text-gray-600 hover:text-blue-500 transition duration-300 cursor-pointer">
          <FaTable className="mr-3" /> Data Tables
        </li>
        <li className="flex items-center text-gray-600 hover:text-blue-500 transition duration-300 cursor-pointer">
          <FaUser className="mr-3" /> Profile
        </li> */}
        <li
          className="flex items-center text-gw-ink-3 hover:text-gw-primary transition duration-300 cursor-pointer"
          onClick={() => logout()}
        >
          <FaUser className="mr-3" /> Logout
        </li>
      </ul>
    </aside>
  );
};

export default SuperAdminSidebar;
