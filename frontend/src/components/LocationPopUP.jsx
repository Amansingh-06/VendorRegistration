import { useEffect, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";
import { toast } from "react-hot-toast";
import { getCurrentLocation } from "../utils/address";
import { FaLocationCrosshairs } from "react-icons/fa6";
import { useLocation, useNavigate } from "react-router-dom";
import { useSearch } from "../context/SearchContext";
import SearchInput from "./SearchInput";
import { getAddressFromLatLng } from "../utils/address";
import TransparentLoader from "./Transparentloader";

// Default marker icon fix for leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
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

  const getAddressFromMarker = async (latitude, longitude) => {
    try {
      const data = await getAddressFromLatLng(latitude, longitude);
      const address = data?.results[0].formatted_address;
      const areaName = data?.results[0].address_components.find(
        (component) =>
          component.types.includes("sublocality") ||
          component.types.includes("sublocality_level_1")
      )?.long_name;
      const cityName = data?.results[0].address_components.find(
        (component) =>
          component.types.includes("locality") ||
          component.types.includes("administrative_area_level_2")
      )?.long_name;

      let landmark = "";

      if (areaName && cityName) {
        landmark = `${areaName}, ${cityName}`;
      } else if (!areaName && cityName) {
        landmark = cityName;
      } else if (areaName && !cityName) {
        landmark = areaName;
      } else {
        landmark = "";
      }

      const add = {
        landmark: landmark,
        h_no: "NA",
        floor: "NA",
        lat: latitude,
        long: longitude,
      };
      setSelectedAddress((prev) => ({
        ...prev,
        landmark: add?.landmark,
        h_no: add?.h_no,
        floor: add?.floor,
        lat: add?.lat,
        long: add?.long,
      }));
    } catch (error) {}
  };

  const ClickHandler = ({ setPosition }) => {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        setPosition([lat, lng]); // update marker position
        // getAddressFromLatLng(lat,lng);
        getAddressFromMarker(lat, lng);
      },
    });
    return null;
  };
  useEffect(() => {
    if (selectedAddress?.lat && selectedAddress?.long)
      setPosition({ lat: selectedAddress?.lat, lng: selectedAddress?.long });
  }, [selectedAddress]);

  const handleCurrentLocation = async () => {
    setLoading(true);
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
          // setLocationError(true); // optional flag
        },
        setSelectedAddress
      );

      toast.dismiss(toastId);
      // setWaitLoading(false);
      setLoading(false);

      if (!success || locError) {
        return;
      }

      // setLocationError(false);
    } catch (err) {
      toast.dismiss(toastId);
      // setWaitLoading(false);
      setLoading(false);
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
          className="absolute top-3 right-4 text-gray-600 hover:text-black text-xl font-bold"
        >
          ✕
        </button>

        <h1 className="text-gray-500 text-center font-semibold text-lg">
          Set Location
        </h1>

        {/* Search Input */}
        <div className="relative mb-4">
          <SearchInput placeholder={"Search your location"} />
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
              <ClickHandler setPosition={setPosition} />
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
              {/* <strong>Selected:</strong>{" "} */}
              <span className=" text-orange">Selected:</span>{" "}
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
            className={`px-6 py-2 rounded-lg text-white font-medium ${
              selectedAddress
                ? "bg-orange-300 hover:bg-orange-300"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            Set Location
          </button>
        </div>
        {loading && <TransparentLoader text="Getting Current Location" />}
      </div>
    </div>
  );
};

export default LocationPopup;
