import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from '../utils/supabaseClient';
import Loader from "../components/Loader";
import NetworkError from "../components/NetworkError";
import { logout } from "../utils/auth";
import { useAuth } from "../context/authContext";

const PrivateRoute = ({ children }) => {
    const [isLoading, setIsLoading] = useState(true);
    const { session, setSession } = useAuth();
    const [isRegistered, setIsRegistered] = useState(null); // Start as null, not false
    const [retryCount, setRetryCount] = useState(0);
    const [error, setError] = useState(null);
    const MAX_RETRIES = 3;
    const location = useLocation();

    useEffect(() => {
        const getUserData = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();

                if (!session) throw new Error("No session returned");

                setSession(session);
                setError(null);

                const user = session.user;
                if (user) {
                    // Set isRegistered properly
                    const isReg = user.user_metadata?.isRegistered ?? false;
                    setIsRegistered(isReg);
                }

                setIsLoading(false);
            } catch (err) {
                const isNetworkError =
                    !navigator.onLine ||
                    err.message.includes("Failed to fetch") ||
                    err.message.includes("Network Error");

                if (isNetworkError && retryCount < MAX_RETRIES - 1) {
                    setTimeout(() => setRetryCount((c) => c + 1), 3000);
                    return;
                }

                setError(err);
                setIsLoading(false);
            }
        };

        getUserData();
    }, [retryCount, setSession]);

    if (isLoading || isRegistered === null) {
        return <Loader />;
    }

    if (
        error &&
        (!navigator.onLine ||
            error.message.includes("Failed to fetch") ||
            error.message.includes("Network Error"))
    ) {
        return <NetworkError />;
    }

    // If session not there, redirect to login/home
    if (!session) {
        return <Navigate to="/" replace state={{ from: location }} />;
    }

    // If session there but not registered, redirect to registration page
    if (!isRegistered) {
        return <Navigate to="/vendor-registration" replace />;
    }

    // If registered and logged in, show children (protected content)
    return children;
};

export default PrivateRoute;
