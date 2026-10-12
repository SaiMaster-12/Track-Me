import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children, allowedRoles }) {
    const { currentUser, userProfile, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-100">
                <p className="text-slate-600">Loading TRACK ME...</p>
            </div>
        );
    }

    if (!currentUser) {
        return <Navigate to="/" replace />;
    }

    if (
        allowedRoles &&
        userProfile &&
        !allowedRoles.includes(userProfile.role)
    ) {
        return <Navigate to="/customer" replace />;
    }

    return children;
}

export default ProtectedRoute;