import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router";
import { Toaster } from "react-hot-toast";

import App from "./layouts/App.jsx";
import Auth from "./layouts/Auth.jsx";
import Fields from "./layouts/Fields.jsx";
import FieldList from "./components/FieldList.jsx";
import FieldCreatePage from "./pages/FieldCreatePage.jsx";
import FieldDetailPage from "./pages/FieldDetailPage.jsx";
import FieldEditPage from "./pages/FieldEditPage.jsx";
import { useAuthStore } from "./store/authStore.js";
// import AuthenticationPage from "./pages/AuthenticationPage.jsx";

import Home from "./components/Home.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import SignUpPage from "./pages/SignUpPage.jsx";
import Error from "./components/Error";
import "./index.css";

import { loader as detailLoader } from "./utilities/DetailLoader.js";
import { loader as recordListLoader } from "./utilities/AllRecordsLoader.js";
import { action as editAction } from "./utilities/EditAction.js";
import { action as deleteAction } from "./utilities/DeleteAction.js";
// import { action as authAction } from "./utilities/AuthAction.js";
import EmailVerificationPage from "./pages/EmailVerificationPage.jsx";

// Protect routes that require authentication
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    // Redirect to login page if not authenticated
    return <Navigate to="/auth" replace />;
  }

  if (!user.isVerified) {
    // Redirect to email verification page if not verified
    return <Navigate to="/auth/verify" replace />;
  }

  // If authenticated and verified, render the children
  return children;
};

// Redirect authenticated user to fields library
/* const RedirectAuthenticatedUser = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (isAuthenticated && user.isVerified) {
    return <Navigate to="/list" replace />;
  }

  return children;
}; */

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <Error />,
    children: [
      { index: true, element: <Home /> },
      {
        path: "/auth",
        element: <Auth />,
        // errorElement: <Error />,
        children: [
          {
            index: true,
            element: <LoginPage />,
            // action: authAction,
          },
          {
            path: "signup",
            element: <SignUpPage />,
          },
          { path: "verify", element: <EmailVerificationPage /> },

          {
            path: "dashboard",
            element: <DashboardPage />,
          },
        ],
      },
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
  // StrictMode only during development
  // <React.StrictMode>
  <RouterProvider router={router} />
  //  <Toaster />,
  //</React.StrictMode>
);
