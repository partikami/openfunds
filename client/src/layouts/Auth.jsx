import { Outlet } from "react-router";
// import { useEffect } from "react";
// import { useAuthStore } from "../store/authStore";

import FloatingShape from "../components/FloatingShape.jsx";

const Auth = () => {
  return (
    <div className="min-h-[800px] h-full bg-gradient-to-br from-cyan-900 via-cyan-700 to-cyan-900 flex items-center justify-center relative overflow-hidden">
      <FloatingShape
        color="bg-cyan-500"
        size="w-64 h-64"
        top="0%"
        left="20%"
        delay={0}
      />
      <FloatingShape
        color="bg-cyan-500"
        size="w-48 h-48"
        top="70%"
        left="80%"
        delay={5}
      />
      <FloatingShape
        color="bg-cyan-500"
        size="w-32 h-32"
        top="40%"
        left="10%"
        delay={2}
      />
      <Outlet />
    </div>
  );
};
export default Auth;
