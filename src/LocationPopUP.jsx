import { useEffect, useRef, useState } from "react";
import { FaLocationCrosshairs } from "react-icons/fa6";
import { IoSearch } from "react-icons/io5";
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";

const LocationPopup = ({ setLocation, location, onClose }) => {
    const inputRef = useRef(null);
    const [error, setError] = useState("");
    const [markerPosition, setMarkerPosition] = useState(null);
    const [tempLocation, setTempLocation] = useState(null); // temporary until confirm

    const { isLoaded } = useLoadScript({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        libraries: ["places"],
    });

    const getAddressFromLatLng = async (lat, lng) => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/reverse-geocode?lat=${lat}&lng=${lng}`
            );
            const data = await response.json();
            if (data.status === "OK" && data.results.length > 0) {
                return data;
            } else {
                return "Unknown location";
            }
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        if (!isLoaded) return;

        const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
            types: ["geocode"],
            componentRestrictions: { country: "in" },
        });

        autocomplete.addListener("place_changed", () => {
            const place = autocomplete.getPlace();
            if (!place.geometry || !place.geometry.location) {
                alert("No geometry info for selected place.");
                return;
            }

            const lat = place.geometry.location.lat();
            const lng = place.geometry.location.lng();
            const areaName = place.address_components.find((c) =>
                c.types.includes("sublocality") || c.types.includes("sublocality_level_1")
            )?.long_name;

            setMarkerPosition({ lat, lng });
            setTempLocation({
                name: place.formatted_address || place.name,
                lat,
                lng,
                accuracy: "From search",
                areaName,
            });
            setError("");
        });
    }, [isLoaded]);

    const getCurrentLocation = () => {
        if (!navigator.geolocation) {
            setError("Geolocation is not supported.");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const { latitude, longitude, accuracy } = pos.coords;
                const data = await getAddressFromLatLng(latitude, longitude);
                const address = data.results[0].formatted_address;
                const areaName = data.results[0].address_components.find((c) =>
                    c.types.includes("sublocality") || c.types.includes("sublocality_level_1")
                )?.long_name;

                setTempLocation({
                    name: address,
                    lat: latitude,
                    lng: longitude,
                    accuracy,
                    areaName,
                });

                setMarkerPosition({ lat: latitude, lng: longitude });
                setError("");
            },
            (err) => {
                setError("Error getting location: " + err.message);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
            }
        );
    };

    const handleSetLocation = () => {
        if (tempLocation) {
            setLocation(tempLocation);
            onClose();
        }
    };

    return (
        <div className="inset-0 z-50 backdrop-blur-sm bg-black/30 fixed flex justify-center items-center">
            <div className="relative bg-white w-[90%] md:w-[600px] rounded-2xl shadow-xl md:p-8 p-2 py-8">
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2  text-gray-600 hover:text-black text-xl font-bold"
                >
                    ✕
                </button>

                {/* Search Input */}
                <div className="relative mb-4">
                    <IoSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
                    <input
                        type="text"
                        ref={inputRef}
                        placeholder="Search location..."
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Google Map */}
                {isLoaded && (
                    <div className="h-64 relative rounded-xl overflow-hidden">
                        <GoogleMap
                            zoom={15}
                            center={markerPosition || { lat: 28.6139, lng: 77.2090 }}
                            mapContainerStyle={{ width: "100%", height: "100%" }}
                        >
                            {markerPosition && <Marker position={markerPosition} />}
                        </GoogleMap>

                        {/* Floating "Use Current Location" Button */}
                        <button
                            onClick={getCurrentLocation}
                            className="absolute bottom-4 right-3 md:right-1/3 shadow-md rounded-full p-2 hover:scale-105 transition-transform flex items-center justify-center border-2 border-blue-500 text-blue-500 md:gap-2"
                            title="Use Current Location"
                        >
                            <FaLocationCrosshairs className="text-lg" />
                            <span className="hidden md:inline">Use Current Location</span>
                        </button>

                    </div>
                )}

                {error && <p className="text-sm text-red-600 mt-2 text-center">{error}</p>}

                {tempLocation && (
                    <div className="mt-4 text-sm text-gray-800 border-t pt-3">
                        <p><strong>Selected:</strong> {tempLocation.name}</p>
                        <p><strong>Lat:</strong> {tempLocation.lat.toFixed(6)} | <strong>Lng:</strong> {tempLocation.lng.toFixed(6)}</p>
                        {tempLocation.areaName && <p><strong>Area:</strong> {tempLocation.areaName}</p>}
                    </div>
                )}

                {/* Confirm Location Button */}
                <div className="mt-4 flex justify-center">
                    <button
                        onClick={handleSetLocation}
                        disabled={!tempLocation}
                        className={`px-6 py-2 rounded-full text-white font-medium ${tempLocation ? "bg-green-600 hover:bg-green-700" : "bg-gray-400 cursor-not-allowed"
                            }`}
                    >
                        Set Location
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LocationPopup;
