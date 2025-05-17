import { useState } from "react";
import { NavLink, useNavigate } from "react-router";

import { useAuthStore } from "../store/authStore.js";

const NavBar = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useAuthStore((state) => state.logout);

  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const [isOpen, setIsOpen] = useState(false);

  const navLinkClasses =
    "text-gray-100 text-lg px-2 py-2 border-2 border-gray-100 hover:bg-gray-100 hover:text-gray-800 rounded-lg transition duration-300";
  const navLinkClassesActive =
    "text-gray-100 text-lg px-2 py-2 border-2 border-gray-900 bg-gray-100 text-gray-800 rounded-lg transition duration-300";
  const buttons = (
    <>
      <NavLink
        className={({ isActive }) =>
          isActive ? navLinkClassesActive : navLinkClasses
        }
        to="/"
      >
        Home
      </NavLink>
      <NavLink
        className={({ isActive }) =>
          isActive ? navLinkClassesActive : navLinkClasses
        }
        to="/list"
      >
        Library
      </NavLink>
      <NavLink
        className={({ isActive }) =>
          isActive ? navLinkClassesActive : navLinkClasses
        }
        to="/tools"
      >
        Tools
      </NavLink>

      <NavLink
        to={isAuthenticated ? "#" : "/auth"}
        onClick={isAuthenticated ? handleLogout : undefined}
        className={({ isActive }) => {
          let classes = navLinkClasses;
          if (isActive && !isAuthenticated) {
            classes = navLinkClassesActive;
          }
          return classes;
        }}
      >
        {isAuthenticated ? "Logout" : "Login"}
      </NavLink>
    </>
  );

  return (
    <nav className="bg-gradient-to-r from-cyan-900 to-cyan-800 border text-white">
      <div className="mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex flex-row w-full justify-between">
            <div className="text-2xl font-normal pt-1">
              openfunds Field Library
            </div>
            <div className="hidden md:block ">
              <div className="flex ml-10 items-baseline space-x-2">
                {buttons}
              </div>
            </div>
          </div>
          <div className="md:hidden px-6">
            <button
              onClick={() => {
                setIsOpen(!isOpen);
              }}
              type="button"
              className="fill-white"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                className="w-12 h-12 text-white dark:text-black"
                aria-hidden="true"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeWidth="2"
                  d="M5 7h14M5 12h14M5 17h14"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
      {isOpen && (
        <div className="flex flex-col gap-y-2 md:hidden px-4 md:px-6 pb-2">
          {buttons}
        </div>
      )}
    </nav>
  );
};

export default NavBar;
