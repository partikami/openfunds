import { motion } from "framer-motion";
import { useNavigate } from "react-router";

import { useAuthStore } from "../store/authStore.js";
import { formatDate } from "../utilities/Date.js";

const DashboardPage = () => {
  // const { user, logout } = useAuthStore();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className=" bg-gradient-to-br from-cyan-900 via-cyan-800 to-cyan-900 min-h-[800px] h-full flex items-center justify-center relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 1 }}
        className="max-w-md w-full mx-auto mt-10 p-8 bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl shadow-2xl border-gray-800"
      >
        <div>
          <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-cyan-600 to-cyan-800 text-transparent bg-clip-text">
            You successfully logged in!
          </h2>

          <div className="space-y-6">
            <motion.div
              className="p-4 bg-gray-800 bg-opacity-50 rounded-lg border border-gray-700"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-xl font-semibold text-cyan-600 mb-3">
                Profile Information
              </h3>
              <p className="text-gray-300">Name: {user.name}</p>
              <p className="text-gray-300">Email: {user.email}</p>
            </motion.div>
            <motion.div
              className="p-4 bg-gray-800 bg-opacity-50 rounded-lg border border-gray-700"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h3 className="text-xl font-semibold text-cyan-600 mb-3">
                Account Activity{" "}
              </h3>
              <p className="text-gray-300">
                <span className="font-bold">Joined: </span>
                {new Date(user.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <p className="text-gray-300">
                <span className="font-bold">Last Login: </span>

                {formatDate(user.lastLogin)}
              </p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-4"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="w-full py-3 px-4 bg-gradient-to-r from-cyan-700 to-cyan-800 text-white font-bold rounded-lg shadow-lg hover:from-cyan-800 hover:to-cyan-900 focus:outline-none focus:ring-2 focus:ring-cyan-700 focus:ring-offset-2 focus:ring-offset-gray-900 transition duration-200"
            >
              Logout
            </motion.button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};
export default DashboardPage;
