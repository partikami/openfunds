import { useRouteError } from "react-router";
import Navbar from "./Navbar";

function Error() {
  const error = useRouteError();

  let title = "An error occured!";
  let message =
    "You must be kidding. I do not make errors! And btw could you be a little more specific, please.";

  if (error.status === 500) {
    message = JSON.parse(error.data).message;
  }

  if (error.status === 404) {
    title = "Not found!";
    message = "Could not find resource or page.";
  }

  return (
    <>
      <main className="flex-col justify-items-center">
        <div className="w-full p-6 bg-white">
          <Navbar />
        </div>
        <div className="py-8 text-4xl font-bold text-black">{title}</div>
        <div className="text-2xl text-black">{message}</div>
      </main>
    </>
  );
}

export default Error;
