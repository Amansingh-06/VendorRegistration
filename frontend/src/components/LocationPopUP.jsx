import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { toast } from "react-hot-toast";
import { getCurrentLocation ,handleAddressError} from "../utils/address";
import { FaLocationCrosshairs } from "react-icons/fa6";
import { IoSearch } from "react-icons/io5";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSearch } from "../context/SearchContext";
import SearchInput from "./SearchInput";


// import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api"

// Libraries array defined outside component to avoid reloading issue
const libraries = ["places"];
//default marker icon fix for leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    iconRetinaUrl:
        "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});



const LocationPopup = ({ show, onClose, setLocation }) => {
    const [isLoaded, setIsLoaded] = useState(true);
    const [position, setPosition] = useState({ lat: 28.7041, lng:77.1025 }); // Lucknow default
    const [selectedType, setSelectedType] = useState("Home");
    const location = useLocation();
    // const { session } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [address_id, setAddress_id] = useState("");
    const navigate = useNavigate();
    const { selectedAddress, setSelectedAddress } = useSearch();

    // Change map view to current locations

    const ChangeMapView = ({ position }) => {
        const map = useMap();
        useEffect(() => {
            map.setView(position, map.getZoom());
        }, [position, map]);
        return null;
    };

   
    const hasFetchedRef = useRef(false);



    // Handle “Current Location” button click
    const handleCurrentLocation = async () => {
        const toastId = toast.loading("Getting current Location");
        try {
            const { success, error: locError } = await getCurrentLocation(
                ({ lat, lng }) => {
                    setPosition({ lat, lng });
                },
                setError,
                setSelectedAddress
            );
            if (!success || locError) {
                toast.dismiss(toastId);
                // handleAddressError(
                //     locError || new Error("Unknown"),
                //     "Unable to fetch current location"
                // );
                return;
            }
            // When current location is fetched, switch to edit mode
            toast.dismiss(toastId);
            console.log("Current location fetched successfully");
            console.log(location)
            // navigate("/edit_address", {
            //     state: {
            //         isEdit: true,
            //         address_id: "",
            //     },
            // });
        } catch (err) {
            toast.dismiss(toastId);
            console.error("Error in location:", err);
            // handleAddressError(err, "Failed to fetch current location");
        }
    };
    
    useEffect(() => {
        if (show && !hasFetchedRef.current) {
            hasFetchedRef.current = true;
            handleCurrentLocation();
        }
        if (!show) {
            hasFetchedRef.current = false; // Reset on popup close
        }
    }, [show]);
    
console.log(selectedAddress)
    return (
        <div className="inset-0 z-50 backdrop-blur-sm bg-black/30 fixed flex justify-center items-center">
            <div className="relative bg-white w-[90%] md:w-[600px] rounded-2xl shadow-xl md:p-8 p-2 py-8">
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-gray-600 hover:text-black text-xl font-bold"
                >
                    ✕
                </button>
                <h1 className="text-gray-500 text-center  font-semibold text-lg">Set Location</h1>

                {/* Autocomplete Input */}
                <div className="relative mb-4">
                    {/* <IoSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
                    <div  className="w-full"></div> */}
                    <SearchInput/>
                </div>

                {/* Google Map */}
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
                        

                        {/* Floating Current Location Button */}
                        <button
                            onClick={handleCurrentLocation}
                            className="absolute bottom-4 right-3 md:right-1/3 shadow-md rounded-full p-2 hover:scale-105 transition-transform flex items-center justify-center border-2 border-blue-500 text-blue-500 md:gap-2"
                            title="Use Current Location"
                        >
                            <FaLocationCrosshairs className="text-lg" />
                            <span className="hidden md:inline">Use Current Location</span>
                        </button>
                    </div>
                )}

                {/* <p className="text-sm text-red-600 mt-2 text-center">{error}</p> */}

                 {selectedAddress && (
                    <div className="mt-4 text-sm text-gray-800 border-t pt-3">
                        <p><strong>Selected:</strong>{selectedAddress?.landmark}</p>
                        {/* <p><strong>Lat:</strong> {selectedAddress?.lat.toFixed(6)} | <strong>Lng:</strong> {selectedAddress?.lng.toFixed(6)}</p> */}
                        
                    </div>
                )} 

                {/* Confirm Location Button */}
                    {/* Confirm Location Button */}
                    <div className="mt-4 flex justify-center">
                        <button
                            onClick={() => {
                                if (selectedAddress) {
                                    setLocation(selectedAddress);  // parent ko location bhejdo
                                    onClose(); // popup band karo
                                }
                            }}
                            disabled={!selectedAddress}
                            className={`px-6 py-2 rounded-full text-white cursor-pointer font-medium ${selectedAddress
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
