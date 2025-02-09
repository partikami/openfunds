import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router";
import App from "./layouts/App.jsx";
import Fields from "./layouts/Fields.jsx";
import Record from "./components/Record";
import RecordList, {
  loader as recordListLoader,
} from "./components/RecordList";
import Home from "./components/Home.jsx";
import Login from "./components/Login";
import Error from "./components/Error";
import "./index.css";

import Dummy from "./components/Dummy.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <Error />,
    children: [
      { index: true, element: <Home /> },
      { path: "/login", element: <Login /> },
      {
        path: "list",
        element: <Fields />,
        // errorElement: <Error />,
        children: [
          { path: "", element: <RecordList />, loader: recordListLoader },
          { path: ":id", element: <Record /> },
          { path: ":id/edit", element: <Record /> },
          { path: "create", element: <Record /> },
        ],
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
