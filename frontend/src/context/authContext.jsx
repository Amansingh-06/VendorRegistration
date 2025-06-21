import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient"; // ✅ Make sure to import
import { SUPABASE_TABLES } from "../utils/vendorConfig";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

    const [session, setSession] = useState(null);
    const [cameFromUserDetailsPage, setCameFromUserDetailsPage] = useState(false);
    const [proceedToUserDetails, setProceedToUserDetails] = useState(false);
    const [vendorData, setVendorData] = useState(null);
    const [selectedVendorId, setSelectedVendorId] = useState(null);

    const [vendorProfile, setVendorProfile] = useState(null); // ✅ NEW STATE
    

    // ✅ Automatically fetch vendor_profile if session exists
    console.log(session?.user?.id, "Id")
    console.log("Select",selectedVendorId)
    useEffect(() => {
        const fetchVendorProfile = async () => {
            let queryField = null;
            let value = null;

            if (selectedVendorId) {
                queryField = "v_id";
                value = selectedVendorId;
            } else if (session?.user?.id) {
                queryField = "u_id";
                value = session.user.id;
            }

            if (queryField && value) {
                const { data, error } = await supabase
                    .from(SUPABASE_TABLES.VENDOR)
                    .select("*")
                    .eq(queryField, value)
                    .single();

                if (error) {
                    console.error("❌ Error fetching vendor profile:", error.message);
                } else {
                    console.log("✅ Vendor Profile:", data);
                    setVendorProfile(data);
                }
            } else {
                console.warn("⚠️ No valid vendor identifier found");
            }
        };

        fetchVendorProfile();
    }, [session, selectedVendorId]);
    
    

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
                setVendorProfile ,          // (optional) for manual updates
                selectedVendorId,
                setSelectedVendorId
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
