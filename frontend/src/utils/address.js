import { address } from "framer-motion/client";
import { supabase } from "./supabaseClient";
// import { toast } from "react-toastify";

//update address
export const updateAddress = async ({
    address_id,
    lat,
    long,
    h_no,
    landmark,
    contact_no,
    additional_details,
    address_type,
}) => {
    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();
    console.log("user", user);

    if (authError || !user) {
        return { success: false, error: "User not authenticated" };
    }

    const updated_ts = new Date().toISOString();

    const { error } = await supabase
        .from("delivery_address")
        .update({
            u_id: user?.id,
            lat,
            long,
            h_no,
            landmark: landmark || "NA",
            contact_no: contact_no || "NA",
            additional_details: additional_details || "NA",
            address_type: address_type,
            updated_at: new Date().toISOString(),
        })
        .eq("address_id", address_id);

    if (error) {
        console.error("Error updating address:", error);
        throw error;
        return { success: false, error };
    }

    return { success: true };
};

export const deleteAddress = async (addressId) => {
    try {
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            throw new Error("User not authenticated");
        }

        const { error } = await supabase.from("delivery_address").delete().match({
            address_id: addressId,
            u_id: user.id,
        });

        if (error) {
            throw error;
        }

        // console.log("error", error);
        // Remove toast from here since we'll handle it in the component

        return {
            success: true,
            error: null,
        };
    } catch (error) {
        // Don't show toast here, just return the error
        return {
            success: false,
            error: error.message,
        };
    }
};

//save address
export async function saveAddress({
    lat,
    long,
    h_no,
    landmark,
    contact_no,
    additional_details,
    address_type,
}) {
    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();
    // console.log("user",user);

    if (authError || !user) {
        return { success: false, error: "User not authenticated" };
    }

    //   const addr_id = crypto.randomUUID(); // or use uuid
    // const created_ts = new Date().toISOString();
    const updated_at = new Date().toISOString();

    const { data, error } = await supabase.from("delivery_address").insert([
        {
            u_id: user.id,
            lat,
            long,
            h_no,
            landmark,
            contact_no,
            additional_details,
            address_type,
            updated_at,
        },
    ]);

    console.log(data);
    if (error) {
        console.error("Error saving address:", error);
        return { success: false, error };
    }

    return { success: true };
}

//*******************backend call **************/
const getAddressFromLatLng = async (lat, lng) => {
    try {
        console.log(lat, lng);
        const response = await fetch(
            `${import.meta.env.VITE_BACKEND_URL
            }/reverse-geocode?lat=${lat}&lng=${lng}`
        );
        const data = await response.json();
        // console.log(data);
        if (data.status === "OK" && data.results.length > 0) {
            const areaName = data?.results[0]?.address_components.find(
                (component) =>
                    component.types.includes("sublocality") ||
                    component.types.includes("sublocality_level_1")
            )?.long_name;
            // setAreaName(areaName);
            // console.log(areaName);
            // return data.results[0].formatted_address;
            return data;
        } else {
            return "Unknown location";
        }
    } catch (error) {
        console.log(error);
    }
};

// getCurrent location
export const getCurrentLocation = async (
    setLocation,
    setError,
    setSelectedAddress
) => {
    try {
        // console.log("yaha pe aaya ?")
        if (!navigator.geolocation) {
            setError("Geolocation is not supported by your browser.");

            // console.log("Yaha v ni aa rha h kya?")
            return {
                success: false,
                error: new Error("Geolocation not supported")
            };
        }

        const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
            });
        });

        const { latitude, longitude, accuracy } = position.coords;

        if (accuracy > 50) {
            setError("Location accuracy is too low (>10 meters).");
            // return; // Don't proceed further
        }
        // console.log("Current position:", position.coords);

        const data = await getAddressFromLatLng(latitude, longitude);
        // console.log("Address data:", data);
        const address = data?.results[0]?.formatted_address;
        const areaName = data?.results[0]?.address_components.find(
            (component) =>
                component.types.includes("sublocality") ||
                component.types.includes("sublocality_level_1")
        )?.long_name;
        const cityName = data?.results[0]?.address_components.find(
            component =>
                component.types.includes("locality") ||
                component.types.includes("administrative_area_level_2")
        )?.long_name;

        const add = {
            landmark: `${areaName}, ${cityName}`,
            h_no: "NA",
            floor: "NA",
            name: address,
            lat: latitude,
            long: longitude,
            accuracy,
        };

        // console.log("address", address);

        setLocation({
            name: address,
            lat: latitude,
            lng: longitude,
            accuracy,
            areaName: areaName,
            cityName: cityName
        });
        setSelectedAddress(add);
        // console.log(location)

        return {
            success: true,
            error: null
        }
    } catch (error) {
        console.error("Error getting location", error);
        setError(`Error getting location: ${error.message}`);
        setLocation(null);
        return {
            success: false,
            error: error
        }
        // throw error; // Rethrow so caller knows it failed
    }
};


//fetch all saved address
export const fetchAllSavedAddresses = async () => {
    try {
        // Get current user
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        // console.log("user",user);
        if (authError || !user) {
            return { success: false, error: "User not authenticated", addresses: [] };
        }

        // Fetch all addresses for current user
        const { data: addresses, error: address_error } = await supabase
            .from("delivery_address")
            .select("*")
            .eq("u_id", user.id)

        if (address_error) {
            console.error("Error fetching addresses:", address_error);
            return { success: false, error: address_error, addresses: [] };
        }

        return {
            success: true,
            addresses: addresses || [],
            error: null,
        };
    } catch (error) {
        console.error("Error in fetchAllSavedAddresses:", error);
        return {
            success: false,
            error: "Failed to fetch addresses",
            addresses: [],
        };
    }
};

export const handleAddressError = (error, customMessage = null) => {
    console.error("Error:", error);

    // Handle Supabase errors
    if (error?.message?.includes("JWTExpired")) {
        toast.error("Session expired. Please login again.");
        return;
    }

    if (error?.message?.includes("JWT")) {
        toast.error("Authentication error. Please login again.");
        return;
    }

    // Handle network errors
    if (!navigator.onLine) {
        toast.error("No internet connection");
        return;
    }

    if (error?.message?.includes("Failed to fetch")) {
        toast.error("Network error. Please check your connection.");
        return;
    }

    // Handle custom message or fallback to error message
    toast.error(customMessage || error.message || "Something went wrong");
};

export const searchSavedAddresses = async (query, userId) => {
    try {
        if (!userId) throw new Error("User ID is required");

        const trimmedQuery = query.trim().toLowerCase();
        if (!trimmedQuery) {
            return { success: true, addresses: [], error: null };
        }

        const { data, error } = await supabase
            .from("delivery_address")
            .select("*")
            .eq("u_id", userId)
            .ilike("search_text", `%${trimmedQuery}%`);

        if (error) throw error;

        return {
            success: true,
            addresses: data || [],
            error: null,
        };
    } catch (error) {
        // handleAddressError(error, "Partial address search failed");
        return {
            success: false,
            addresses: [],
            error: error.message,
        };
    }
};

export const getGooglePlaceSuggestions = async (query) => {
    try {
        if (!window.google?.maps?.places) {
            throw new Error("Google Maps Places API not loaded");
        }

        const service = new window.google.maps.places.AutocompleteService();

        return new Promise((resolve) => {
            service.getPlacePredictions(
                {
                    input: query,
                    componentRestrictions: { country: "in" },
                },
                (predictions, status) => {
                    if (status === window.google.maps.places.PlacesServiceStatus.OK) {
                        resolve({
                            success: true,
                            suggestions: predictions,
                            error: null,
                        });
                    } else {
                        resolve({
                            success: false,
                            suggestions: [],
                            error: `Google Places API error: ${status}`,
                        });
                    }
                }
            );
        });
    } catch (error) {
        handleAddressError(error, "Failed to get location suggestions");
        return {
            success: false,
            suggestions: [],
            error: error.message,
        };
    }
};

export const loadGoogleMapsScript = () => {
    return new Promise((resolve, reject) => {
        if (window.google?.maps) {
            resolve();
            return;
        }

        try {
            const script = document.createElement("script");
            script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY
                }&libraries=places`;
            script.async = true;
            script.onload = resolve;
            script.onerror = () =>
                reject(new Error("Failed to load Google Maps script"));
            document.body.appendChild(script);
        } catch (error) {
            handleAddressError(error, "Failed to load Google Maps");
            reject(error);
        }
    });
};

export const fetchAddressFromPlaceId = async (placeId) => {
    const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/address-from-placeid?placeId=${placeId}`
    );
    const data = await response.json();
    console.log(data);
    return data;
};

export const markAsSelectedAddress = async (address_id) => {
    try {
        // Get current user
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return {
                success: false,
                error: "User not authenticated"
            };
        }

        // First, set all addresses' isSelected to false
        const { error: resetError } = await supabase
            .from("delivery_address")
            .update({ is_selected: false })
            .eq("u_id", user.id);

        if (resetError) {
            throw resetError;
        }

        // Then, set the selected address to true
        const { error: updateError } = await supabase
            .from("delivery_address")
            .update({
                is_selected: true,
                updated_at: new Date().toISOString()
            })
            .match({
                address_id: address_id,
                u_id: user.id
            });

        if (updateError) {
            throw updateError;
        }

        return {
            success: true,
            error: null
        };

    } catch (error) {
        console.error("Error marking address as selected:", error);
        return {
            success: false,
            error: error.message || "Failed to mark address as selected"
        };
    }
};


export const getSelectedAddress = async () => {
    try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return {
                success: false,
                error: "User not authenticated"
            };
        }

        const { data, error } = await supabase
            .from("delivery_address")
            .select("*")
            .eq("u_id", user.id)
            .eq("is_selected", true)
            .single();

        if (error) {
            throw error;
        }

        return {
            success: true,
            address: data,
            error: null
        };

    } catch (error) {
        console.error("Error fetching selected address:", error);
        return {
            success: false,
            address: null,
            error: error.message
        };
    }
};