import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";
// import { SELECTED_COLUMN, SUPABASE_TABLES, VENDOR_DATA_KEYS } from "../utils/vendorConfig";
import { VENDOR_FIELD,SELECTED_COLUMN, SUPABASE_TABLES } from "../utils/constants/Table&column";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [session, setSession] = useState(null);
    const [cameFromUserDetailsPage, setCameFromUserDetailsPage] = useState(false);
    const [proceedToUserDetails, setProceedToUserDetails] = useState(false);
    const [vendorData, setVendorData] = useState(null);
    const [selectedVendorId, setSelectedVendorId] = useState(null);
    const [vendorProfile, setVendorProfile] = useState(null);

    // 🔁 Common reusable function
    const fetchVendorProfile = async () => {
        let queryField = null;
        let value = null;

        if (selectedVendorId) {
            queryField = VENDOR_FIELD?.V_ID;
            value = selectedVendorId;
        } else if (session?.user?.id) {
            queryField = VENDOR_FIELD?.U_ID;
            value = session.user.id;
        }

        if (queryField && value) {
            const { data, error } = await supabase
                .from(SUPABASE_TABLES.VENDOR)
                .select(SELECTED_COLUMN?.ALL)
                .eq(queryField, value)
                .single();

            if (error) {
            } else {
                setVendorProfile(data);
            }
        } else {
        }
    };

    // 🔄 Auto fetch on load
    useEffect(() => {
        fetchVendorProfile();
    }, [session, selectedVendorId]);

    // ✅ Manual refetch available globally
    const refreshVendorProfile = async () => {
        await fetchVendorProfile();
    };

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
                vendorProfile,
                setVendorProfile,
                selectedVendorId,
                setSelectedVendorId,
                refreshVendorProfile // ✅ Exported for manual use
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
