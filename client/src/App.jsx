import { Outlet } from "react-router-dom";
import Navbar from "./components/Navbar";

const App = () => {
  return (
    <div className="w-full p-6 bg-slate-400">
      <Navbar />
      <Outlet />
    </div>
  );
};
export default App;