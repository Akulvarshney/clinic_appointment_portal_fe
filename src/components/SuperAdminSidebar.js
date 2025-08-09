import React from "react";
import { FaChartBar, FaUser, FaTable, FaShoppingCart } from "react-icons/fa";
import { useAuth } from "../layouts/AuthContext";
import { useNavigate } from "react-router-dom";

const SuperAdminSidebar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  return (
    <aside className="w-full md:w-64 bg-white p-6 shadow-2xl border-r border-gray-200 animate-fadeInUp">
      <h2 className="text-3xl font-extrabold text-blue-600 mb-10 tracking-widest uppercase">
        Arogi
      </h2>
      <ul className="space-y-6 text-lg">
        <li
          className="flex items-center text-blue-600 font-bold hover:text-blue-800 transition duration-300 cursor-pointer"
          onClick={() => navigate("/superadmin/dashboard")}
        >
          <FaChartBar className="mr-3" /> Main Dashboard
        </li>
        <li
          className="flex items-center text-blue-600 font-bold hover:text-blue-800 transition duration-300 cursor-pointer"
          onClick={() => navigate("/sa/organisationListing")}
        >
          <FaChartBar className="mr-3" /> Organizations
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
          className="flex items-center text-gray-600 hover:text-blue-500 transition duration-300 cursor-pointer"
          onClick={() => logout()}
        >
          <FaUser className="mr-3" /> Logout
        </li>
      </ul>
    </aside>
  );
};

export default SuperAdminSidebar;
