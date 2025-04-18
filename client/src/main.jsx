import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router";

import App from "./layouts/App.jsx";
import Fields from "./layouts/Fields.jsx";
import FieldList from "./components/FieldList.jsx";
import FieldCreatePage from "./pages/FieldCreatePage.jsx";
import FieldDetailPage from "./pages/FieldDetailPage.jsx";
import FieldEditPage from "./pages/FieldEditPage.jsx";
import AuthenticationPage from "./pages/AuthenticationPage.jsx";

import Home from "./components/Home.jsx";
import Error from "./components/Error";
import "./index.css";

import { loader as detailLoader } from "./utilities/DetailLoader.js";
import { loader as recordListLoader } from "./utilities/AllRecordsLoader.js";
import { action as editAction } from "./utilities/EditAction.js";
import { action as deleteAction } from "./utilities/DeleteAction.js";
import { action as authAction } from "./utilities/AuthAction.js";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <Error />,
    children: [
      { index: true, element: <Home /> },
      { path: "/auth", element: <AuthenticationPage />, action: authAction },
      {
        path: "list",
        element: <Fields />,
        // errorElement: <Error />,
        children: [
          { path: "", element: <FieldList />, loader: recordListLoader },
          {
            path: ":id",
            id: "field-detail",
            loader: detailLoader,
            children: [
              {
                index: true,
                element: <FieldDetailPage />,
                action: deleteAction,
              },
              {
                path: "edit",
                element: <FieldEditPage />,
                action: editAction,
              },
            ],
          },
          {
            path: "create",
            element: <FieldCreatePage />,
            action: editAction,
          },
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
