import { useEffect, useRef, useState } from "react";
import { BiSearch } from "react-icons/bi";
import { fetchAddressFromPlaceId, getGooglePlaceSuggestions, handleAddressError, loadGoogleMapsScript } from "../utils/address";
import { useSearch } from "../context/SearchContext";
import { useNavigate } from "react-router-dom";
import { FaLocationDot } from "react-icons/fa6";

const SearchInput = ({ placeholder, py }) => {
    const inputRef = useRef(null);
    const [query, setQuery] = useState("");
    const [googleSuggestions, setGoogleSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const { setSelectedAddress,selectedAddress } = useSearch();
    const ref = useRef(null);
    const navigate = useNavigate();

    // Load Google Maps script once
    useEffect(() => {
        const initGoogleMaps = async () => {
            try {
                console.log("📦 Trying to load Google Maps script...");
                await loadGoogleMapsScript();
                console.log("✅ Google Maps script loaded");
            } catch (error) {
                console.error("❌ Failed to load Google Maps script:", error);
                handleAddressError(error, "Failed to initialize location search");
            }
        };

        initGoogleMaps();
    }, []);

    // Fetch Google Suggestions when query changes
    useEffect(() => {
        if (query.trim() === "") {
            setGoogleSuggestions([]);
            return;
        }

        const delayDebounceFn = setTimeout(() => {
            fetchGoogleSuggestions(query);
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    const fetchGoogleSuggestions = async (query) => {
        try {
            console.log("🔍 Fetching suggestions for:", query);
            if (!window.google || !window.google.maps || !window.google.maps.places) {
                console.warn("⚠️ Google Maps Places is not available on window object");
            }

            const { success, suggestions, error } = await getGooglePlaceSuggestions(query);

            console.log("📨 Suggestions fetched:", suggestions);
            console.log("✅ Success status:", success);
            console.log("❌ Error (if any):", error);

            if (success) {
                setGoogleSuggestions(suggestions);
            } else {
                throw new Error(error);
            }
        } catch (error) {
            console.error("❌ Error during fetchGoogleSuggestions:", error);
            handleAddressError(error, "Failed to get location suggestions");
            setGoogleSuggestions([]);
        }
    };

    const handleGoogleSuggestionClick = async (suggestion) => {
        try {
            const data = await fetchAddressFromPlaceId(suggestion?.place_id);

            const address = {
                full_address:data?.full_address,
                address_id: "",
                landmark: data?.city,
                lat: data?.latitude,
                long: data?.longitude,
                floor: "NA",
                h_no: "NA",
            };
console.log("Address,data",address)
            setSelectedAddress(address);
            // navigate("/edit_address", { state: { isEdit: true } });
            setQuery('');
            setShowSuggestions(false);
            console.log(setSelectedAddress)
            console.log("Select", selectedAddress);
        } catch (error) {
            console.error("❌ Error getting place details:", error);
            handleAddressError(error, "Could not get location details");
            setShowSuggestions(false);
        }
    };

    // Debug useEffects
    useEffect(() => {
        console.log("🆕 Query updated:", query);
    }, [query]);

    useEffect(() => {
        console.log("🧠 Suggestions updated:", googleSuggestions);
    }, [googleSuggestions]);

    return (
        <div className="w-full my-4 relative flex justify-center">
            <div className="relative w-full" ref={ref}>
                {/* Search Icon */}
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-xl">
                    <BiSearch />
                </div>

                {/* Input */}
                <input
                    ref={inputRef}
                    type="text"
                    placeholder={placeholder}
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    className="w-full text-sm lg:text-base bg-white pl-10 pr-12 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
                />

                {/* Suggestions */}
                {query && showSuggestions && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-96 overflow-auto z-50 divide-y divide-gray-100">
                        {googleSuggestions.map((suggestion) => (
                            <div
                                key={`google-${suggestion.place_id}`}
                                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer"
                                onClick={() => handleGoogleSuggestionClick(suggestion)}
                            >
                                <span className="text-orange-500 text-lg shrink-0"><FaLocationDot size={24} /></span>
                                <span className="text-gray-800 text-sm">{suggestion.description}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchInput;
