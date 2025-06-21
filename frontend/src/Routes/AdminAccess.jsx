import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";
import { useAuth } from "../context/authContext";

export default function AdminProtectedRoute({ children, fallback = null }) {
    const { vendorId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const token = new URLSearchParams(location.search).get("token");
    const refreshToken = new URLSearchParams(location.search).get("refresh");

    const { setSelectedVendorId } = useAuth();
    const [isAllowed, setIsAllowed] = useState(null);

    useEffect(() => {
        const verifyAdmin = async () => {
            // ✅ If no token in URL → fallback route (vendor style access)
            if (!token || !refreshToken) {
                if (fallback) {
                    setIsAllowed(false); // Vendor
                } else {
                    console.warn("⛔ No token and no fallback. Redirecting.");
                    navigate("/unauthorized");
                }
                return;
            }

            // ✅ Admin login via token in URL
            const { error: sessionError } = await supabase.auth.setSession({
                access_token: token,
                refresh_token: refreshToken,
            });

            if (sessionError) {
                console.error("❌ Failed to set session:", sessionError);
                navigate("/unauthorized");
                return;
            }

            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (!user || userError) {
                console.error("❌ Failed to fetch user:", userError?.message);
                navigate("/unauthorized");
                return;
            }

            const { data: profile, error } = await supabase
                .from("user")
                .select("role")
                .eq("user_id", user.id)
                .single();

            if (error || !profile || profile.role !== "Admin") {
                console.warn("⛔ Not an admin");
                navigate("/unauthorized");
                return;
            }

            // ✅ Admin verified
            setSelectedVendorId(vendorId);
            setIsAllowed(true);
        };

        verifyAdmin();
    }, [token, refreshToken, vendorId]);

    if (isAllowed === null) return <div>Checking admin access...</div>;

    if (isAllowed === true) return children;

    if (isAllowed === false && fallback) return fallback;

    return <div className="text-center text-red-500">Access denied</div>;
}
