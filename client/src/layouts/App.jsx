import { Outlet } from "react-router";
import Navbar from "../components/Navbar";

const App = () => {
  return (
    <div className="w-full p-6 bg-white">
      <Navbar />
      <Outlet />
    </div>
  );
};
export default App;
