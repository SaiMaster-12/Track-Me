
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function PublicRoute() {
    const { currentUser, userProfile, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-100">
                <p className="text-slate-600">
                    Loading TRACK ME...
                </p>
            </div>
        );
    }

    if (currentUser && userProfile?.role === "CUSTOMER") {
        return <Navigate to="/customer" replace />;
    }

    return <Outlet />;
}

export default PublicRoute;
