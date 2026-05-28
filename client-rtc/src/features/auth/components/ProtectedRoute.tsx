import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";

export const ProtectedRoute = () => {
    const { isAuthenticated, isLoading } = useAuth0();
    const location = useLocation();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    return <Outlet />;
}