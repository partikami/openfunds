import { useEffect } from "react";
import { Outlet } from "react-router";

import Navbar from "../components/Navbar";
import { useAuthStore } from "../store/authStore";
import LoadingSpinner from "../components/LoadingSpinner";

const App = () => {
  const { isCheckingAuth, checkAuth } = useAuthStore();

  useEffect(() => {
    const fetchAuth = async () => {
      await checkAuth();
    };
    fetchAuth();
  }, [checkAuth]);

  if (isCheckingAuth) return <LoadingSpinner />;

  return (
    <div className="w-full p-6 bg-white">
      <Navbar />
      <Outlet />
    </div>
  );
};

export default App;
