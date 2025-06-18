import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { toast } from "react-hot-toast";
import { getCurrentLocation } from "../utils/address";
import { FaLocationCrosshairs } from "react-icons/fa6";
import { useLocation, useNavigate } from "react-router-dom";
import { useSearch } from "../context/SearchContext";
import SearchInput from "./SearchInput";

// Default marker icon fix for leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

const LocationPopup = ({ show, onClose, setLocation }) => {
    const [isLoaded, setIsLoaded] = useState(true);
    const [position, setPosition] = useState({ lat: 28.7041, lng: 77.1025 }); // Default Delhi
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { selectedAddress, setSelectedAddress } = useSearch();

    const hasFetchedRef = useRef(false);

    const ChangeMapView = ({ position }) => {
        const map = useMap();
        useEffect(() => {
            map.setView(position, map.getZoom());
        }, [position, map]);
        return null;
    };

    const handleCurrentLocation = async () => {
        // setWaitLoading(true); // if you show spinner
        const toastId = toast.loading("Getting current Location");

        try {
            const { success, error: locError } = await getCurrentLocation(
                ({ lat, lng }) => {
                    setPosition({ lat, lng });
                    setLocation({ lat, lng });
                },
                (err) => {
                    // setErr(err); // if needed for showing message
                    console.log("err",err)
                    // setLocationError(true); // optional flag
                },
                setSelectedAddress
            );

            toast.dismiss(toastId);
            // setWaitLoading(false);

            if (!success || locError) {
                console.error("Location Error:", locError);
                return;
            }

            // setLocationError(false);
            console.log("✅ Current location fetched");
        } catch (err) {
            toast.dismiss(toastId);
            // setWaitLoading(false);
            console.error("❌ Location fetch failed:", err);
        }
    };
    

    useEffect(() => {
        if (show && !hasFetchedRef.current) {
            hasFetchedRef.current = true;
            handleCurrentLocation();
        }
        if (!show) {
            hasFetchedRef.current = false;
        }
    }, [show]);

    return (
        <div className="inset-0 z-50 backdrop-blur-sm bg-black/30 fixed flex justify-center items-center">
            <div className="relative bg-white w-[90%] md:w-[600px] rounded-2xl shadow-xl md:p-8 p-2 py-8">
                {/* Close Button */}
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute top-2 right-2 text-gray-600 hover:text-black text-xl font-bold"
                >
                    ✕
                </button>

                <h1 className="text-gray-500 text-center font-semibold text-lg">Set Location</h1>

                {/* Search Input */}
                <div className="relative mb-4">
                    <SearchInput />
                </div>

                {/* Map */}
                {isLoaded && (
                    <div className="h-64 relative rounded-xl overflow-hidden">
                        <MapContainer
                            center={position}
                            zoom={13}
                            style={{ zIndex: 0 }}
                            className="h-full w-full"
                        >
                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                            <Marker position={position}>
                                <Popup>Selected Location</Popup>
                            </Marker>
                            <ChangeMapView position={position} />
                        </MapContainer>

                        {/* Current Location Button */}
                        <button
                            type="button"
                            onClick={handleCurrentLocation}
                            className="absolute bottom-4 right-3 md:right-1/3 shadow-md rounded-full p-2 hover:scale-105 transition-transform flex items-center justify-center border-2 border-blue-500 text-blue-500 md:gap-2"
                            title="Use Current Location"
                        >
                            <FaLocationCrosshairs className="text-lg" />
                            <span className="hidden md:inline">Use Current Location</span>
                        </button>
                    </div>
                )}

                {/* Show Selected Address Info */}
                {selectedAddress && (
                    <div className="mt-4 text-sm text-gray-800 border-t pt-3">
                        <p>
                            <strong>Selected:</strong>{" "}
                            {selectedAddress?.landmark || "No address found"}
                        </p>
                    </div>
                )}


                {/* Confirm Button */}
                <div className="mt-4 flex justify-center">
                    <button
                        type="button"
                        onClick={() => {
                            if (selectedAddress) {
                                setLocation(selectedAddress);
                                onClose();
                            }
                        }}
                        disabled={!selectedAddress}
                        className={`px-6 py-2 rounded-full text-white font-medium ${selectedAddress
                                ? "bg-green-600 hover:bg-green-700"
                                : "bg-gray-400 cursor-not-allowed"
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
