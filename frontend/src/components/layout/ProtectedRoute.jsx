import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from '../../context/AuthContext.jsx';

const ProtectedRoute = () => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading)
        return (
            <div className="flex min-h-screen items-center justify-center">
                <img src="/loading.svg" alt="Loading" className="h-16 w-16" />
            </div>
        );
    if (!user)
        return (
            < Navigate to="/login" replace state={{ from: location, message: "Login Please" }}></Navigate >
        )

    return <Outlet />
}

export default ProtectedRoute;
