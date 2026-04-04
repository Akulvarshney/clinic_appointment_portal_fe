import React from "react";
import { Link } from "react-router-dom";
import { FaChartBar, FaUser, } from "react-icons/fa";
import { useAuth } from "../layouts/AuthContext";

const SuperAdminSidebar = () => {
  const { logout } = useAuth();
  return (
    <aside className="w-full shrink-0 border-gw-muted bg-gw-surface p-4 shadow-md animate-fadeInUp md:w-64 md:border-r md:p-6 md:shadow-2xl border-b md:border-b-0">
      <h2 className="mb-4 text-xl font-extrabold uppercase tracking-widest text-gw-primary-dark md:mb-10 md:text-3xl">
        GloryWellnic
      </h2>
      <ul className="space-y-3 text-base md:space-y-6 md:text-lg">
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
