import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from '../utils/supabaseClient';
import Loader from "../components/Loader";
import NetworkError from "../components/NetworkError";
import { logout } from "../utils/auth";
import { useAuth } from "../context/authContext";



const PrivateRoute = ({ children }) => {
    const [isLoading, setIsLoading] = useState(true);
    // const [session, setSession] = useState(null);
    const { session, setSession } = useAuth();
    const [isRegistered, setIsRegistered] = useState(false);
    const [retryCount, setRetryCount] = useState(0);
    const [error, setError] = useState(null);
    const [isRetrying, setIsRetrying] = useState(false);
    const MAX_RETRIES = 3;

    useEffect(() => {
        const getUserData = async () => {
            try {
                console.log(`Attempt ${retryCount + 1}`);
                if (retryCount > 0) setIsRetrying(true);
                const {
                    data: { session },
                } = await supabase.auth.getSession();

                if (!session) throw new Error("No session returned");

                setSession(session);
                setError(null);
                setIsLoading(false);
                setIsRetrying(false);

                const user = session?.user;
                if (user) {
                    const isReg = user?.user_metadata?.isRegistered ?? false;
                    setIsRegistered(isReg);
                }
            } catch (err) {
                const isNetworkError =
                    !navigator.onLine ||
                    err.message.includes("Failed to fetch") ||
                    err.message.includes("Network Error");

                // console.error("Supabase connection error:", err);
                if (isNetworkError && retryCount < MAX_RETRIES - 1) {
                    console.warn("Network error, retrying...", err);
                    // schedule a retry
                    setTimeout(() => setRetryCount((c) => c + 1), 3000);
                    return; // bail out of this catch so we stay in loading state
                }

                // non-network error (or out of retries): give up
                console.error("Error fetching session:", err);
                setError(err);
                setIsLoading(false);
                setIsRetrying(false);
            }
        };

        getUserData();
    }, [retryCount, setSession]);

    if (isLoading) {
        return <Loader />;
    }

    if (
        error &&
        (!navigator.onLine ||
            error?.message?.includes("Failed to fetch") ||
            error?.message?.includes("Network Error"))
    ) {
        return (
            <NetworkError />
           
        )
    }

    // Auth/Access control
    if (!session || !isRegistered) {

        const handleUnwantedSession = async () => {
            await logout();
        }

        if (session && !isRegistered) {
            handleUnwantedSession();
        }

        return <Navigate to="/" replace />;
    }
    // if (!session || !isRegistered) return <Navigate to="/login" replace />;
    // write the code for 

    // if (!isRegistered) return <Navigate to="/userdetails" replace />;

    return children;
};

export default PrivateRoute;