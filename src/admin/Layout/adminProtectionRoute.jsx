import { Navigate, useLocation } from "react-router-dom";

export default function AdminProtectedRoute({ children }) {
  const location = useLocation();

  const isAdmin =
    localStorage.getItem("adminLoggedIn") === "true";

  if (!isAdmin) {
    return (
      <Navigate
        to="/admin/login"
        replace
        state={{ from: location }}
      />
    );
  }

  return children;
}
