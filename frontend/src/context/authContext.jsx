import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient"; // ✅ Make sure to import
import { SUPABASE_TABLES } from "../utils/vendorConfig";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

    const [session, setSession] = useState(null);
    const [cameFromUserDetailsPage, setCameFromUserDetailsPage] = useState(false);
    const [proceedToUserDetails, setProceedToUserDetails] = useState(false);
    const [vendorData, setVendorData] = useState(null);

    const [vendorProfile, setVendorProfile] = useState(null); // ✅ NEW STATE

    // ✅ Automatically fetch vendor_profile if session exists
    console.log(session?.user?.id,"Id")
    useEffect(() => {
        const fetchVendorProfile = async () => {
            if (session?.user?.id) {
                const { data, error } = await supabase
                    .from(SUPABASE_TABLES.VENDOR)
                    .select("*")
                    .eq("u_id", session?.user?.id)
                    .single();

                if (error) {
                    console.error("Error fetching vendor profile:", error.message);
                } else {
                    setVendorProfile(data); // ✅ Save to state
                }
            }
        };

        fetchVendorProfile();
    }, [session]);

    return (
        <AuthContext.Provider
            value={{
                session,
                setSession,
                cameFromUserDetailsPage,
                setCameFromUserDetailsPage,
                proceedToUserDetails,
                setProceedToUserDetails,
                vendorData,
                setVendorData,
                vendorProfile,             // ✅ Exported
                setVendorProfile           // (optional) for manual updates
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
