import React from "react";
import { useNavigate } from "react-router-dom";

const TopBarLoggedOut = () => {
  const navigate = useNavigate();
  return (
    <div
      style={{
        backgroundColor: "#2980b9",
        color: "#fff",
        padding: "1rem",
        display: "flex",
        justifyContent: "space-between",
      }}
    >
      <div>Arogi</div>
      <div className="flex gap-4">
        <button onClick={() => navigate("/")}>Home</button>

        <button onClick={() => navigate("/login")}>Login</button>
      </div>
    </div>
  );
};

export default TopBarLoggedOut;
