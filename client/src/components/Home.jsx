import FloatingShape from "./FloatingShape";
import { Link } from "react-router";

const Home = () => {
  return (
    <div className="min-h-[800px] h-full border border-t-0 bg-gradient-to-br from-cyan-900 via-cyan-800 to-cyan-900 flex flex-col relative overflow-hidden">
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

      <div className="ml-10 text-white z-10">
        <h1 className="text-3xl text-white font-bold mt-20 mb-24">
          Manage the openfunds library by choosing{" "}
          <Link
            to="/list"
            className=" text-gray-100 hover:text-cyan-900 font-bold  bg-opacity-0 hover:bg-gray-100 rounded-lg  transition duration-300"
          >
            "Library"
          </Link>{" "}
          or{" "}
          <Link
            to="/tools"
            className=" text-gray-100 hover:text-cyan-900 font-bold  bg-opacity-0 hover:bg-gray-100 rounded-lg  transition duration-300"
          >
            "Tools".
          </Link>
        </h1>

        <h3 className="text-xl text-white font-bold mt-5 mb-2">
          {" "}
          <Link
            to="/list"
            className=" text-gray-100 hover:text-cyan-900 font-bold underline bg-opacity0 hover:bg-gray-100 rounded-lg  transition duration-300"
          >
            Library
          </Link>
        </h3>

        <p>
          With "Library", you can explore the openfunds fields shown as a list
          of all fieds. <br />
          For each field you can enter the details by clicking on the "Show"
          button.{" "}
        </p>

        <h3 className="text-xl text-white font-bold mt-5 mb-2">
          {" "}
          <Link
            to="/tools"
            className=" text-gray-100 hover:text-cyan-900 font-bold underline bg-opacity-0 hover:bg-gray-100 rounded-lg  transition duration-300"
          >
            Tools
          </Link>
        </h3>

        <p>With "Tools", you get access to exporting and importing features.</p>

        <h3 className="text-xl text-white font-bold mt-5 mb-2">
          {" "}
          <Link
            to="/auth"
            className=" text-gray-100 hover:text-cyan-900 font-bold underline bg-opacity0 hover:bg-gray-100 rounded-lg  transition duration-300"
          >
            Logging in
          </Link>
        </h3>

        <p>
          As a logged in user you can create new fields or edit and delete
          existing fields.
          <br />
          User permissions are managed by the openfunds team. Only a few
          administrators of the openfunds library will be granted write
          permissions.
        </p>
      </div>
    </div>
  );
};

export default Home;
