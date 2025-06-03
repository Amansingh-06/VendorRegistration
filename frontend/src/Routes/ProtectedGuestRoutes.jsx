import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";
import { useAuth } from "../context/authContext";
import Loader from "../components/Loader";
import { logout } from "../utils/auth";
import NetworkError from "../components/NetworkError";

const ProtectedGuestRoute = ({ children }) => {
    const [isLoading, setIsLoading] = useState(true);
    // const [session, setSession] = useState(null);
    const [isRegistered, setIsRegistered] = useState(false);
    const [retryCount, setRetryCount] = useState(0);
    const [error, setError] = useState(null);
    const [isRetrying, setIsRetrying] = useState(false);

    const { session, setSession, proceedToUserDetails } = useAuth();
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
                    err?.message?.includes("Failed to fetch") ||
                    err?.message?.includes("Network Error");

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
        );
    }



    // ✅ Final access control logic
    if (session && isRegistered) {
        return <Navigate to="/home" replace />;
    }

    const handleUnwantedSession = async (setSession) => {
        await logout(setSession);
    }

    if (session && !isRegistered && window?.location?.pathname !== "/vendor-registration") {
        handleUnwantedSession(setSession);

    }
    // ⛔ Prevent showing /vendor-registration when session is not present
    if (!session && window?.location?.pathname === "/vendor-registration") {
        return <Navigate to="/" replace />;
    }


    return children;
};

export default ProtectedGuestRoute;