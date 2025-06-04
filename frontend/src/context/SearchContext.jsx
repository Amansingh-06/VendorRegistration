import { createContext, useContext, useState } from "react";

const SearchContext = createContext();

export const SearchProvider = ({ children }) => {
    const [savedAddresses, setSavedAddresses] = useState([]);
    const [selectedGoogleSuggestions, setSelectedGoogleSuggestions] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);

    const value = {
        savedAddresses,
        setSavedAddresses,
        selectedGoogleSuggestions,
        setSelectedGoogleSuggestions,
        selectedAddress,
        setSelectedAddress
    };

    return (
        <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
    );
};

export const useSearch = () => {
    const context = useContext(SearchContext);
    if (!context) {
        throw new Error("useSearch must be used within a SearchProvider");
    }
    return context;
};