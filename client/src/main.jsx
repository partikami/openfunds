import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router";
import App from "./App.jsx";
import Record from "./components/Record";
// import Record, {loader as recordLoader} from "./components/Record";
import RecordList, {
  loader as recordListLoader,
} from "./components/RecordList";
import Welcome from "./components/Welcome";
import Login from "./components/Login";
import Error from "./components/Error";
import "./index.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <Error />,
    children: [
      { index: true, element: <Welcome /> },
      {
        path: "list",
        element: <RecordList />,
        loader: recordListLoader,
        children: [
          { path: "../:id", element: <Record /> },
          { path: "../:id/edit", element: <Record /> },
          { path: "../create", element: <Record /> },
        ],
      },
      // { path: "/login", element: <Login /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
