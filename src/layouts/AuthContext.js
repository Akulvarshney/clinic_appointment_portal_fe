import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [organizations, setOrganizations] = useState([]);
  const [role, setRole] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const storedOrganizations = JSON.parse(
      localStorage.getItem("organizations")
    );

    if (token && storedUser) {
      setIsLoggedIn(true);
      setUser(storedUser);
      setOrganizations(storedOrganizations || []);

      // ✅ Prefer SuperAdmin role if available
      const detectedRole =
        storedUser.role || storedOrganizations?.[0]?.roles?.[0] || null;

      setRole(detectedRole);
    }

    setIsAuthReady(true);
  }, []);

  const login = (userData, token, orgs = [], roleObj = null) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("organizations", JSON.stringify(orgs));

    setIsLoggedIn(true);
    setUser(userData);
    setOrganizations(orgs);
    setRole(roleObj);
  };

  const logout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setUser(null);
    setOrganizations([]);
    setRole(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        user,
        organizations,
        role,
        isAuthReady,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
