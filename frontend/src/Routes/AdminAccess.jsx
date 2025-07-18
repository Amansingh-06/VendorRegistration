import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";
import { useAuth } from "../context/authContext";
import Loader from "../components/Loader";

export default function AdminProtectedRoute({ children, fallback = null }) {
    // const { vendorId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const vendorId = new URLSearchParams(location.search).get("vendorId");
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
                    navigate("/");
                }
                return;
            }

            // ✅ Admin login via token in URL
            const { error: sessionError } = await supabase.auth.setSession({
                access_token: token,
                refresh_token: refreshToken,
            });

            if (sessionError) {
                navigate("/");
                return;
            }

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

            // ✅ Admin verified
            setSelectedVendorId(vendorId);
            
            setIsAllowed(true);
        };

        verifyAdmin();
    }, [token, refreshToken, vendorId]);

    if (isAllowed === null) return <Loader/>;

    if (isAllowed === true) return children;

    if (isAllowed === false && fallback) return fallback;

    return <div className="text-center text-red-500">Access denied</div>;
}
