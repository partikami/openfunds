import { useEffect } from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  Navigate,
  useParams,
} from "react-router";
import { Toaster } from "react-hot-toast";

import { useAuthStore } from "./store/authStore.js";
import LoadingSpinner from "./components/LoadingSpinner.jsx";

import Auth from "./layouts/Auth.jsx";
import Fields from "./layouts/Fields.jsx";

import Navbar from "./components/Navbar.jsx";
import Home from "./components/Home.jsx";
import FieldList from "./components/FieldList.jsx";
import Error from "./components/Error.jsx";

import FieldCreatePage from "./pages/FieldCreatePage.jsx";
import FieldDetailPage from "./pages/FieldDetailPage.jsx";
import FieldEditPage from "./pages/FieldEditPage.jsx";
import ForgotPasswordPage from "./pages/ForgotPasswordPage.jsx";
import ResetPasswordPage from "./pages/ResetPasswordPage.jsx";
import VerifyEmailPage from "./pages/VerifyEmailPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import SignUpPage from "./pages/SignUpPage.jsx";
import ToolsPage from "./pages/ToolsPage.jsx";

import { loader as detailLoader } from "./utilities/DetailLoader.js";
import { loader as recordListLoader } from "./utilities/AllRecordsLoader.js";
import { action as editAction } from "./utilities/EditAction.js";
import { action as deleteAction } from "./utilities/DeleteAction.js";
import { use } from "react";

// Protect routes that require authentication

const ProtectedEditRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { id } = useParams();

  if (!isAuthenticated) {
    return <Navigate to={`/list/${id}`} replace />;
  }
  return children;
};

const ProtectedCreateRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/list" replace />;
  }
  return children;
};

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <>
        <Navbar />
        <Outlet />
        <Toaster />
      </>
    ),
    errorElement: <Error />,
    children: [
      { path: "/", index: true, element: <Home /> },
      {
        path: "auth",
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
          { path: "verify", element: <VerifyEmailPage /> },
          {
            path: "forgotPassword",
            element: <ForgotPasswordPage />,
          },
          {
            path: "reset-password/:token",
            element: <ResetPasswordPage />,
          },
        ],
      },
      {
        path: "/dashboard",
        element: <DashboardPage />,
      },
      {
        path: "list",
        element: <Fields />,
        // errorElement: <Error />,
        children: [
          {
            path: "",
            element: <FieldList />,
            loader: recordListLoader,
          },
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
                element: (
                  <ProtectedEditRoute>
                    <FieldEditPage />
                  </ProtectedEditRoute>
                ),
                action: editAction,
              },
            ],
          },
          {
            path: "create",
            element: (
              <ProtectedCreateRoute>
                <FieldCreatePage />
              </ProtectedCreateRoute>
            ),
            action: editAction,
          },
        ],
      },
      {
        path: "tools",
        element: <ToolsPage />,
        // errorElement: <Error />,
      },
    ],
  },
]);

const App = () => {
  const isCheckingAuth = useAuthStore((state) => state.isCheckingAuth);
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth) return <LoadingSpinner />;

  return <RouterProvider router={router} />;
};

export default App;
