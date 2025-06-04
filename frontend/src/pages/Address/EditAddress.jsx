import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useState } from "react";
import SearchInput from "../../components/SearchInput";
import { MdGpsFixed } from "react-icons/md";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import Loader from "../../components/Loader";
import {
    getCurrentLocation,
    handleAddressError,
    saveAddress,
    updateAddress,
} from "../../utils/address";
// import { toast } from "react-toastify";
import { toast } from "react-hot-toast";
// import { supabase } from "../../supabase-client";
import { useAuth } from "../../context/authContext";
import { useSearch } from "../../context/SearchContext";
import { useForm } from "react-hook-form";

// default marker icon fix for leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    iconRetinaUrl:
        "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

// Change map view to current locations
const ChangeMapView = ({ position }) => {
    const map = useMap();
    useEffect(() => {
        map.setView(position, map.getZoom());
    }, [position, map]);
    return null;
};

const EditAddress = () => {
    const [position, setPosition] = useState({ lat: 26.8467, lng: 80.9462 }); // Lucknow default
    const [selectedType, setSelectedType] = useState("Home");
    const location = useLocation();
    const { session } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [address_id, setAddress_id] = useState("");
    const navigate = useNavigate();
    const { selectedAddress, setSelectedAddress } = useSearch();

    // Initialize react-hook-form
    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm({
        mode: "onChange",
        defaultValues: {
            contact: session?.user?.phone ? `+${session?.user?.phone}` : "",
            house: "",
            floor: "",
            landmark: "",
            address_type: "Home",
            otherType: "",
        },
    });

    // Watch for address_type change
    const watchAddressType = watch("address_type");

    // When editing an existing address, populate form and map
    useEffect(() => {
        const fetchAddress = () => {
            const { isEdit } = location?.state || {};
            if (isEdit && selectedAddress) {
                setAddress_id(selectedAddress?.address_id);
                // Populate form fields
                const houseValue =
                    selectedAddress?.h_no && selectedAddress?.h_no !== "NA"
                        ? selectedAddress?.h_no
                        : "";
                const floorValue =
                    selectedAddress?.floor && selectedAddress?.floor !== "NA"
                        ? selectedAddress?.floor
                        : "";
                const landmarkValue =
                    selectedAddress?.landmark && selectedAddress?.landmark !== "NA"
                        ? `${selectedAddress?.landmark}`
                        : "";
                const typeValue =
                    selectedAddress?.address_type && selectedAddress?.address_type !== "NA"
                        ? selectedAddress?.address_type
                        : "Home";
                setValue("house", houseValue);
                setValue("floor", floorValue);
                setValue("landmark", landmarkValue);
                setValue("address_type", typeValue);
                setSelectedType(typeValue);
                // Center map on saved coordinates
                setPosition({
                    lat: selectedAddress?.lat,
                    lng: selectedAddress?.long,
                });
            }
        };
        fetchAddress();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.state, selectedAddress]);

    // Update form's address_type and local selectedType
    const handleTypeSelect = (type) => {
        setSelectedType(type);
        setValue("address_type", type);
    };

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
                handleAddressError(
                    locError || new Error("Unknown"),
                    "Unable to fetch current location"
                );
                return;
            }
            // When current location is fetched, switch to edit mode
            toast.dismiss(toastId);
            navigate("/edit_address", {
                state: {
                    isEdit: true,
                    address_id: "",
                },
            });
        } catch (err) {
            toast.dismiss(toastId);
            console.error("Error in location:", err);
            handleAddressError(err, "Failed to fetch current location");
        }
    };

    // On form submit: either update or save new address
    const onSubmit = async (data) => {
        setLoading(true);

        // If “Other” was picked, use whatever was typed into otherType.
        // Otherwise, just use "Home" or "Work".
        console.log("data ka address_type", data?.address_type);
        const finalType =
            data?.address_type === "Other"
                ? data?.otherType?.trim()
                : data?.address_type;

        try {
            if (location?.state?.isEdit === true && address_id) {
                const { success, error: updateError } = await updateAddress({
                    address_id,
                    lat: position.lat,
                    long: position.lng,
                    h_no: data.house || "NA",
                    landmark: data.landmark || "NA",
                    contact_no: data.contact || "NA",
                    additional_details: data.floor || "NA",
                    address_type: finalType || "NA",
                });

                if (!success || updateError) {
                    console.error(updateError);
                    handleAddressError(
                        updateError,
                        "Unable to update your address, please try again"
                    );
                    setLoading(false);
                    return;
                }

                toast.success("Address updated!");
                navigate("/address");
            } else {
                const { success, error: saveError } = await saveAddress({
                    lat: position.lat,
                    long: position.lng,
                    h_no: data.house,
                    landmark: data.landmark,
                    contact_no: data.contact,
                    additional_details: data.floor || "NA",
                    address_type: finalType || "NA",
                });

                if (!success || saveError) {
                    console.error(saveError);
                    handleAddressError(
                        saveError,
                        "Failed to save your address, please try again"
                    );
                    setLoading(false);
                    return;
                }

                toast.success("Address saved!");
                navigate("/address");
            }
        } catch (err) {
            console.error(err);
            handleAddressError(err, "An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    // Loader
    if (loading) {
        return <Loader />;
    }

    return (
        <div className="w-[90%] mx-auto mt-5 lg:mt-6">
            {/* Heading */}
            <div className="relative">
                <Link
                    to="/address"
                    className="inline-flex items-center justify-center w-12 h-12 lg:w-14 lg:h-14 text-orange rounded-full text-xl lg:text-2xl font-bold absolute -top-2 lg:-top-3 -left-2 lg:-left-1 z-20 shadow-md hover:shadow-xl hover:scale-95 transition-all duration-200 bg-white border border-gray-200"
                >
                    <FiArrowLeft />
                </Link>
                <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-dark mb-3 lg:mb-6 tracking-tight pl-12 lg:pl-16">
                    Add/Edit Your Address
                </h1>
            </div>

            {/* Search */}
            <div>
                <SearchInput
                    py={"py-4"}
                    placeholder={"Search for area, street name, landmark etc"}
                />
            </div>

            {/* Map */}
            <div className="relative h-[60dvh] flex items-center justify-center">
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

                <div
                    className="absolute bottom-2 p-2 gap-2 flex items-center justify-center border border-gray-400 customRadius bg-white z-50 cursor-pointer active:scale-95 transition-transform duration-150 hover:shadow-lg"
                    onClick={handleCurrentLocation}
                >
                    <MdGpsFixed />
                    <div>Current Location</div>
                </div>
            </div>

            {/* Address Form */}
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="mt-4 space-y-4 pb-24 bg-white rounded-2xl shadow-lg p-4">
                    <h2 className="font-semibold text-xl mb-2 text-gray-800">
                        Complete Address
                    </h2>

                    {/* Contact Number (read-only) */}
                    <div className="space-y-1">
                        <label
                            className="block text-gray-dark font-medium mb-1"
                            htmlFor="contact"
                        >
                            Contact Number (Auto filled)
                        </label>
                        <input
                            id="contact"
                            {...register("contact", {
                                required: "Contact number is required",
                                pattern: {
                                    value: /^\+[0-9]{12}$/,
                                    message: "Invalid phone number format (+919876543210)",
                                },
                            })}
                            className={`w-full border ${errors.contact
                                    ? "border-red-500 focus:ring-red-500"
                                    : "border-gray-200 focus:ring-orange"
                                } p-3 customRadius focus:ring-2 focus:outline-none transition`}
                            placeholder="Contact Number"
                        />
                        {errors.contact && (
                            <p className="text-red-500 text-sm animate-fadeIn">
                                {errors.contact.message}
                            </p>
                        )}
                    </div>

                    {/* House No / Building Name */}
                    <div className="space-y-1">
                        <label
                            className="block text-gray-dark font-medium mb-1"
                            htmlFor="house"
                        >
                            House No / Plot No / Name of Building
                        </label>
                        <input
                            id="house"
                            {...register("house", {
                                required: "House/Building details are required",
                                minLength: {
                                    value: 3,
                                    message: "Must be at least 3 characters",
                                },
                                validate: (value) => {
                                    const trimmed = value.trim();
                                    const regex = /^[A-Za-z0-9]+(?: [A-Za-z0-9]+)*$/;
                                    if (trimmed === "")
                                        return "This input cannot be empty or spaces only";
                                    if (!regex?.test(trimmed))
                                        return "This input must contain only alphabets and single spaces";
                                    return true;
                                },
                            })}
                            className={`w-full border ${errors.house
                                    ? "border-red-500 focus:ring-red-500"
                                    : "border-gray-200 focus:ring-orange"
                                } p-3 customRadius focus:ring-2 focus:outline-none transition`}
                            placeholder="House No / Plot No / Name of Building"
                        />
                        {errors.house && (
                            <p className="text-red-500 text-sm animate-fadeIn">
                                {errors.house.message}
                            </p>
                        )}
                    </div>

                    {/* Floor */}
                    <div className="space-y-1">
                        <label
                            className="block text-gray-dark font-medium mb-1"
                            htmlFor="floor"
                        >
                            Floor <span className="text-gray-400">(Optional)</span>
                        </label>
                        <input
                            id="floor"
                            {...register("floor", {
                                pattern: {
                                    value: /^[0-9]*$/,
                                    message: "Floor must be a number",
                                },
                                validate: (value) => {
                                    if (!value) return true; // Allow empty since it's optional
                                    if (!/^\d+$/.test(value)) return "Only numbers are allowed";
                                    if (parseInt(value) > 999) return "Floor number too large";
                                    return true;
                                },
                            })}
                            className={`w-full border ${errors.floor
                                    ? "border-red-500 focus:ring-red-500"
                                    : "border-gray-200 focus:ring-orange"
                                } p-3 customRadius focus:ring-2 focus:outline-none transition`}
                            placeholder="Floor (numbers only)"
                            onInput={(e) => {
                                e.target.value = e.target.value.replace(/[^0-9]/g, "");
                            }}
                        />
                        {errors.floor && (
                            <p className="text-red-500 text-sm animate-fadeIn">
                                {errors.floor.message}
                            </p>
                        )}
                    </div>

                    {/* Landmark */}
                    <div className="space-y-1">
                        <label
                            className="block text-gray-dark font-medium mb-1"
                            htmlFor="landmark"
                        >
                            Landmark <span className="text-gray-400">(Optional)</span>
                        </label>
                        <input
                            id="landmark"
                            {...register("landmark", {
                                required: "Landmark is required",
                                minLength: {
                                    value: 3,
                                    message: "Must be at least 3 characters",
                                },
                            })}
                            className={`w-full border ${errors.landmark
                                    ? "border-red-500 focus:ring-red-500"
                                    : "border-gray-200 focus:ring-orange"
                                } p-3 customRadius focus:ring-2 focus:outline-none transition`}
                            placeholder="Landmark"
                        />
                        {errors.landmark && (
                            <p className="text-red-500 text-sm animate-fadeIn">
                                {errors.landmark.message}
                            </p>
                        )}
                    </div>

                    {/* Address Type Buttons */}
                    {/* --- Type selector buttons --- */}
                    <div>
                        <label className="font-medium mb-2 text-gray-dark block">
                            Type:
                        </label>
                        <div className="flex gap-2">
                            {["Home", "Work", "Other"].map((type) => (
                                <button
                                    key={type}
                                    type="button"
                                    className={`cursor-pointer active:scale-95 transition-all duration-150 hover:shadow-lg border p-2 px-4 customRadius font-semibold ${watchAddressType === type
                                            ? "bg-orange text-white"
                                            : "bg-gray/50 hover:bg-orange text-white"
                                        }`}
                                    onClick={() => handleTypeSelect(type)}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>

                        {/* Show this only when “Other” is selected */}
                        {watchAddressType === "Other" && (
                            <div className="mt-3">
                                <label
                                    className="block text-gray-dark font-medium mb-1"
                                    htmlFor="otherType"
                                >
                                    Please specify
                                </label>
                                <input
                                    id="otherType"
                                    {...register("otherType", {
                                        required:
                                            watchAddressType === "Other"
                                                ? "Please specify address type"
                                                : false,
                                        minLength: {
                                            value: 3,
                                            message: "Must be at least 3 characters",
                                        },
                                    })}
                                    className={`w-full lg:w-[20%] border ${errors.otherType
                                            ? "border-red-500 focus:ring-red-500"
                                            : "border-gray-200 focus:ring-orange"
                                        } p-3 customRadius focus:ring-2 focus:outline-none transition`}
                                    placeholder="(e.g. Friend's House)"
                                />
                                {errors.otherType && (
                                    <p className="text-red-500 text-sm animate-fadeIn">
                                        {errors.otherType.message}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className={`cursor-pointer active:scale-95 transition-transform duration-150 hover:shadow-lg w-full p-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold shadow ${watchAddressType === "Other" ? "mt-0" : "mt-24"
                            }`}
                    >
                        {location?.state?.isEdit ? "Update Address" : "Save Address"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditAddress;