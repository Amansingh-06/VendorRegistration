import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";
import { useAuth } from "../context/authContext";
import Loader from "../components/Loader";

export default function AdminProtectedRoute({ children, fallback = null }) {
    const location = useLocation();
    const navigate = useNavigate();

    const urlVendorId = new URLSearchParams(location.search).get("vendorId");
    const urlToken = new URLSearchParams(location.search).get("token");
    const urlRefreshToken = new URLSearchParams(location.search).get("refresh");

    const { setSelectedVendorId } = useAuth();
    const [isAllowed, setIsAllowed] = useState(null);

    useEffect(() => {
        const verifyAdmin = async () => {
            console.log("🔐 Verifying Admin Access...");

            let token = urlToken || localStorage.getItem("admin_token");
            let refreshToken = urlRefreshToken || localStorage.getItem("admin_refresh_token");
            let vendorId = urlVendorId || localStorage.getItem("admin_vendor_id");

            console.log("🧾 Token:", token);
            console.log("🔁 Refresh Token:", refreshToken);
            console.log("🏪 Vendor ID:", vendorId);

            if (!token || !refreshToken) {
                console.warn("🚫 Token or Refresh Token missing");
                if (fallback) {
                    setIsAllowed(false);
                } else {
                    navigate("/");
                }
                return;
            }

            if (urlToken && urlRefreshToken && urlVendorId) {
                console.log("💾 Saving tokens from URL to localStorage");
                localStorage.setItem("admin_token", urlToken);
                localStorage.setItem("admin_refresh_token", urlRefreshToken);
                localStorage.setItem("admin_vendor_id", urlVendorId);
            }

            const { error: sessionError } = await supabase.auth.setSession({
                access_token: token,
                refresh_token: refreshToken,
            });

            if (sessionError) {
                console.error("❌ Supabase Session Error:", sessionError);
                navigate("/");
                return;
            }

            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (!user || userError) {
                console.error("❌ Failed to get user:", userError);
                navigate("/");
                return;
            }

            console.log("👤 Logged in User:", user.id);

            const { data: profile, error } = await supabase
                .from("user")
                .select("role")
                .eq("user_id", user.id)
                .single();

            if (error || !profile) {
                console.error("❌ Error fetching profile:", error);
                navigate("/");
                return;
            }

            console.log("🛡️ User Role:", profile.role);

            if (profile.role !== "Admin") {
                console.warn("🚫 Not an admin user");
                navigate("/");
                return;
            }

            console.log("✅ Admin verified. Access granted.");
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
