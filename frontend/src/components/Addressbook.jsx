import React, { useCallback, useEffect, useState } from "react";
import {
    FiMapPin,
    FiPlus,
    FiHome,
    FiPhone,
    FiChevronRight,
    FiEdit,
    FiTrash,
    FiBriefcase,
    FiHeart,
    FiStar,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import {
    deleteAddress,
    fetchAllSavedAddresses,
    getCurrentLocation,
    handleAddressError,
    // markAsSelectedAddress,
} from "../utils/address";
import Loader from "./Loader";
// import { toast } from "react-toastify";
import { toast } from "react-hot-toast";
import { useSearch } from "../context/SearchContext";

const AddressBook = () => {
    const navigate = useNavigate();
    const [hoveredItem, setHoveredItem] = useState(null);
    const [location, setLocation] = useState(null);
    const [error, setError] = useState(null);

    const [addresses, setAddresses] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const {
        selectedAddress,
        setSelectedAddress,
        savedAddresses,
        setSavedAddresses,
    } = useSearch();

    const [deleteConfirm, setDeleteConfirm] = useState({
        show: false,
        addressId: null,
        addressType: null
    });

    // Add new handler for delete click
    const handleDeleteClick = (e, item) => {
        e.stopPropagation();
        setDeleteConfirm({
            show: true,
            addressId: item.address_id,
            addressType: item.address_type
        });
    };

    /********* Fetch all saved addresses on first render ***************/
    const loadAddresses = useCallback(
        async () => {
            // console.log("fetching address in address book")
            setIsLoading(true);
            try {
                const {
                    success,
                    addresses: savedAddresses,
                    error,
                } = await fetchAllSavedAddresses();

                if (!success) {
                    throw new Error(error || "Failed to fetch addresses");
                }
                // console.log("just before useSearch");
                setSavedAddresses(savedAddresses);
                // console.log("Just after useSearch");

            } catch (error) {
                handleAddressError(error, "unable to laod your saved addresses");
            } finally {
                setIsLoading(false);
            }
        }, [setSavedAddresses, setIsLoading]
    )
    useEffect(() => {
        loadAddresses();
    }, []);

    /*************get current locations ***********/
    const handleCurrentLocation = async () => {
        const toastId = toast.loading("Getting current Location");
        try {
            // toastShown = false; // Reset before calling
            const { success, error } = await getCurrentLocation(
                setLocation,
                setError,
                setSelectedAddress
            );

            if (!success || error) {
                toast.dismiss(toastId);
                handleAddressError(error, "Failed to get current location");
                return;
            }
            // Navigate only if the above succeeds
            toast.dismiss(toastId);
            navigate("/edit_address", {
                state: {
                    isEdit: true,
                    address_id: "",
                },
            });
        } catch (error) {
            // toastShown = true;
            // toast.error("Failed to fetch current location");
            toast.dismiss(toastId);
            console.error("Error in location:", error);
            handleAddressError(error, "Failed to fetch current location");
        }
    };
    const handleDeleteAddress = async (addressId) => {
        try {
            const { success, error } = await deleteAddress(addressId);

            if (!success) {
                throw new Error(error);
            }

            // Show success toast
            setDeleteConfirm({ show: false, addressId: null, addressType: null });
            toast.success("Address deleted successfully");
            await loadAddresses();
            // Update addresses list
            // setAddresses(addresses.filter((addr) => addr.id !== addressId));
        } catch (error) {
            handleAddressError(error, "Could not delete address");
        }
    };

    const getIconForType = (type) => {
        switch (type) {
            case "home":
                return <FiHome className="text-blue-500" size={20} />;
            case "office":
                return <FiBriefcase className="text-purple-500" size={20} />;
            case "family":
                return <FiHeart className="text-pink-500" size={20} />;
            default:
                return <FiMapPin className="text-gray-500" size={20} />;
        }
    };

    const getGradientForType = (type) => {

        // console.log(type)
        switch (type) {
            case "home":
                return "from-blue-50 to-indigo-50 border-blue-100";
            case "office":
                return "from-purple-50 to-violet-50 border-purple-100";
            case "family":
                return "from-pink-50 to-rose-50 border-pink-100";
            default:
                return "from-gray-50 to-slate-50 border-gray-100";
        }
    };

    // const handleSelectLocation = async (address_id) => {
    //     const toastId = toast.loading("Setting as default address...");
    //     try {
    //         const { success, error } = await markAsSelectedAddress(address_id);

    //         if (!success) {
    //             throw new Error(error);
    //         }

    //         // Update the local addresses list
    //         // await loadAddresses();

    //         toast.dismiss(toastId);
    //         toast.success("Default address updated");
    //         navigate("/"); // Navigate back to home after selection

    //     } catch (error) {
    //         toast.dismiss(toastId);
    //         handleAddressError(error, "Could not update default address");
    //     }
    // }

    useEffect(() => {
        const handleCurrentAddress = async () => {
            // const toastId = toast.loading("Getting current Location");
            try {
                // toastShown = false; // Reset before calling
                const { success, error } = await getCurrentLocation(
                    setLocation,
                    setError,
                    setSelectedAddress
                );

                if (!success || error) {
                    // toast.dismiss(toastId);
                    handleAddressError(error, "Failed to get current location");
                    return;
                }
                // Navigate only if the above succeeds
                // toast.dismiss(toastId);
                // navigate("/edit_address", {
                //   state: {
                //     isEdit: true,
                //     address_id: "",
                //   },
                // });
            } catch (error) {
                // toastShown = true;
                // toast.error("Failed to fetch current location");
                // toast.dismiss(toastId);
                console.error("Error in location:", error);
                handleAddressError(error, "Failed to fetch current location");
            }
        };
        // handleCurrentLocation();
        handleCurrentAddress();
    }, [])

    if (isLoading) {
        return <Loader />;
    }

    return (
        <div className="min-h-screen">
            <div className="w-[95%] lg:w-[90%] mx-auto space-y-8">
                {/* Address Filling  */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden divide-y divide-gray-200">
                    {/* Current Location */}
                    <div
                        className="group flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition"
                        onMouseEnter={() => setHoveredItem("current")}
                        onMouseLeave={() => setHoveredItem(null)}
                        onClick={() => {
                            handleCurrentLocation();
                        }}
                    >
                        <div
                            className={`flex items-center space-x-4 transition-all duration-300 transform  ${hoveredItem === "current" ? "scale-98" : "scale-100"
                                }`}
                        >
                            <div className="p-2 bg-emerald-100 rounded-xl">
                                <FiMapPin className="text-emerald-600 text-xl" />
                            </div>
                            <div>
                                <p className="font-semibold text-gray-800">
                                    Use Current Location
                                </p>
                                {
                                    location && <p className="text-gray-500 text-sm">{location?.areaName}, {location?.cityName}</p>
                                }

                            </div>
                        </div>
                        <FiChevronRight
                            className={`text-gray-400 transition-transform duration-300 `}
                        />
                    </div>

                    {/* Add New Address */}
                    <div
                        className="group flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition"
                        onMouseEnter={() => setHoveredItem("add")}
                        onMouseLeave={() => setHoveredItem(null)}
                        onClick={() =>
                            navigate("/edit_address", {
                                state: {
                                    isEdit: false,
                                },
                            })
                        }
                    >
                        <div
                            className={`flex items-center space-x-4 transition-all duration-300 transform  ${hoveredItem === "add" ? "scale-98" : "scale-100"
                                }`}
                        >
                            <div className="p-2 bg-violet-100 rounded-xl">
                                <FiPlus className="text-violet-600 text-xl" />
                            </div>
                            <button className="flex flex-col items-start">
                                <p className="font-semibold text-gray-800">Add New Address</p>
                                <p className="text-gray-500 text-sm">New location</p>
                            </button>
                        </div>
                        <FiChevronRight
                            className={`text-gray-400 transition-transform duration-300`}
                        />
                    </div>
                </div>

                {/* Address List */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-gray-900">
                            Saved Addresses
                        </h2>
                        <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                            {savedAddresses?.length} addresses
                        </div>
                    </div>

                    <div className="space-y-2">
                        {savedAddresses?.map((item, index) => (
                            <div
                                key={item?.address_id}
                                className={`group relative overflow-hidden bg-gradient-to-r cursor-grab ${getGradientForType(
                                    item?.address_type?.toLowerCase()
                                )} border-2 px-6 py-3 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 transform  ${hoveredItem === item?.id ? "scale-98" : "scale-100"
                                    }`}
                                onMouseEnter={() => setHoveredItem(item?.id)}
                                onMouseLeave={() => setHoveredItem(null)}
                                style={{
                                    animationDelay: `${index * 100}ms`,
                                }}
                                onClick={() => {
                                    handleSelectLocation(item?.address_id);
                                }}
                            >
                                {/* Subtle background pattern */}
                                <div className="absolute inset-0 opacity-5">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-current to-transparent rounded-full -translate-y-16 translate-x-16"></div>
                                </div>

                                <div className="relative flex justify-between items-start">
                                    <div className="flex-1 space-y-2">
                                        {/* Header */}
                                        <div className="flex items-center space-x-3">
                                            {getIconForType(item?.address_type)}
                                            <div className="flex items-center space-x-2">
                                                <h3 className="font-bold text-gray-900 text-lg">
                                                    {item?.address_type}
                                                </h3>
                                                {/* <span className="text-xs font-semibold text-gray-dark font-medium">
                          • 19 m
                        </span> */}
                                                {item?.is_selected && (
                                                    <div className="flex items-center space-x-1 bg-amber-100 text-amber-700 px-2 py-1 rounded-full text-xs font-medium">
                                                        <FiStar size={12} />
                                                        <span>Default</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Address */}
                                        <div className="flex items-start space-x-3 text-sm lg:text-base">
                                            <FiMapPin
                                                className="text-gray mt-1 flex-shrink-0"
                                                size={16}
                                            />
                                            <p className="text-gray leading-relaxed">
                                                {`${item?.h_no}, ${item?.landmark}`}
                                            </p>
                                        </div>

                                        {/* Phone */}
                                        <div className="flex items-center space-x-3">
                                            <FiPhone className="text-gray flex-shrink-0" size={16} />
                                            <p className="text-gray font-medium">
                                                {item?.contact_no}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className={`flex space-x-3 `}>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedAddress(item);
                                                navigate("/edit_address", {
                                                    state: {
                                                        isEdit: true,
                                                    },
                                                });
                                            }}
                                            className={`transition-all duration-300 transform  ${hoveredItem === item?.id ? "scale-98" : "scale-100"
                                                } p-2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-xl shadow-sm hover:shadow-md  group/btn cursor-pointer`}
                                        >
                                            <FiEdit
                                                className="text-blue-600 group-hover/btn:scale-110 transition-transform duration-200"
                                                size={18}
                                            />
                                        </button>
                                        <button
                                            className="p-2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 group/btn cursor-pointer"
                                            onClick={(e) => handleDeleteClick(e, item)}
                                        >
                                            <FiTrash
                                                className="text-red-500 group-hover/btn:scale-110 transition-transform duration-200"
                                                size={18}
                                            />
                                        </button>
                                    </div>
                                </div>

                                {/* Bottom border accent */}
                                <div
                                    className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${item?.type === "home"
                                            ? "from-blue-400 to-indigo-500"
                                            : item?.type === "office"
                                                ? "from-purple-400 to-violet-500"
                                                : "from-pink-400 to-rose-500"
                                        } transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left`}
                                ></div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom CTA */}
                <div className="text-center pt-8 pb-6">
                    <div className="inline-flex items-center space-x-2 text-gray-500 text-sm">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span>Addresses are securely encrypted</span>
                    </div>
                </div>
            </div>

            {deleteConfirm.show && (
                <div className="fixed inset-0 bg-black/10 bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-sm space-y-4 animate-fadeIn">
                        <div className="flex items-center space-x-3 text-red-500">
                            <FiTrash size={24} />
                            <h3 className="text-xl font-bold text-gray-900">Delete Address</h3>
                        </div>

                        <p className="text-gray-600">
                            Are you sure you want to delete this {deleteConfirm.addressType} address?
                            This action cannot be undone.
                        </p>

                        <div className="flex space-x-3 pt-2">
                            <button
                                onClick={() => setDeleteConfirm({ show: false, addressId: null, addressType: null })}
                                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDeleteAddress(deleteConfirm.addressId)}
                                className="flex-1 px-4 py-2 text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default AddressBook;