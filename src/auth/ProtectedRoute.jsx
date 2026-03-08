import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedRoute({ children, allowedRoles = [] }) {
    const location = useLocation();

    // Check login status for each role
    const isAdmin = localStorage.getItem("adminLoggedIn") === "true";
    const isProvider = localStorage.getItem("providerLoggedIn") === "true";
    const isUser = localStorage.getItem("userLoggedIn") === "true";

    // Determine if the current user has ANY of the allowed roles
    let hasAccess = false;

    if (allowedRoles.includes("admin") && isAdmin) hasAccess = true;
    if (allowedRoles.includes("provider") && isProvider) hasAccess = true;
    if (allowedRoles.includes("user") && isUser) hasAccess = true;

    // If allow all authenticated users (if allowedRoles is empty or has a wildcard - though implementation purely checks specified roles)
    if (allowedRoles.length === 0) {
        if (isAdmin || isProvider || isUser) hasAccess = true;
    }

    if (!hasAccess) {
        // Redirect to login, preserving the location they were trying to go to
        return (
            <Navigate
                to="/login"
                replace
                state={{ from: location }}
            />
        );
    }

    return children;
}
