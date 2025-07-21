import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";
import { useAuth } from "../context/authContext";
import Loader from "../components/Loader";

export default function AdminProtectedRoute({ children, fallback = null }) {
    const location = useLocation();
    const navigate = useNavigate();

    // Get params from URL (if available)
    const urlVendorId = new URLSearchParams(location.search).get("vendorId");
    const urlToken = new URLSearchParams(location.search).get("token");
    const urlRefreshToken = new URLSearchParams(location.search).get("refresh");

    const { setSelectedVendorId } = useAuth();
    const [isAllowed, setIsAllowed] = useState(null);

    useEffect(() => {
        const verifyAdmin = async () => {
            // ✅ 1. Try from URL first, then localStorage fallback
            let token = urlToken || localStorage.getItem("admin_token");
            let refreshToken = urlRefreshToken || localStorage.getItem("admin_refresh_token");
            let vendorId = urlVendorId || localStorage.getItem("admin_vendor_id");

            // ❌ 2. If nothing available, redirect or fallback
            if (!token || !refreshToken) {
                if (fallback) {
                    setIsAllowed(false); // fallback for vendor
                } else {
                    navigate("/");
                }
                return;
            }

            // ✅ 3. Save values to localStorage (only if from URL)
            if (urlToken && urlRefreshToken && urlVendorId) {
                localStorage.setItem("admin_token", urlToken);
                localStorage.setItem("admin_refresh_token", urlRefreshToken);
                localStorage.setItem("admin_vendor_id", urlVendorId);
            }

            // ✅ 4. Set Supabase session
            const { error: sessionError } = await supabase.auth.setSession({
                access_token: token,
                refresh_token: refreshToken,
            });

            if (sessionError) {
                navigate("/");
                return;
            }

            // ✅ 5. Get user and verify admin role
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (!user || userError) {
                navigate("/");
                return;
            }

            const { data: profile, error } = await supabase
                .from("user")
                .select("role")
                .eq("user_id", user.id)
                .single();

            if (error || !profile || profile.role !== "Admin") {
                navigate("/");
                return;
            }

            // ✅ 6. All checks passed → grant access
            setSelectedVendorId(vendorId);
            setIsAllowed(true);
        };

        verifyAdmin();
    }, []);

    if (isAllowed === null) return <Loader />;
    if (isAllowed === true) return children;
    if (isAllowed === false && fallback) return fallback;

    return <div className="text-center text-red-500">Access denied</div>;
}
