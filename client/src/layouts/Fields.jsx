import { Outlet } from "react-router";

const Fields = () => {
  return (
    <div className="w-full p-6 bg-white">
      <Outlet />
    </div>
  );
};
export default Fields;
