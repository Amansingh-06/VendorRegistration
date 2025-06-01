import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {


    const [session, setSession] = useState(null);
    const [cameFromUserDetailsPage, setCameFromUserDetailsPage] = useState(false);
    const [proceedToUserDetails, setProceedToUserDetails] = useState(false);

    return (
        <AuthContext.Provider value={{ cameFromUserDetailsPage, setCameFromUserDetailsPage, session, setSession, proceedToUserDetails, setProceedToUserDetails }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);