import React, { useState,useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FaRegUser, FaStore, FaRegClock } from 'react-icons/fa';
import { MdAddLocationAlt, MdGpsFixed } from "react-icons/md";
import { HiOutlineVideoCamera } from "react-icons/hi2";
import { IoImageOutline, IoQrCodeOutline } from "react-icons/io5";
import { AiOutlineShop } from "react-icons/ai";
import FileUploadButton from './FileUploadButton';
import { v4 as uuidv4 } from 'uuid';
import { GrStreetView } from "react-icons/gr";
import { PiCityLight } from "react-icons/pi";
import { PiMapPinAreaLight } from "react-icons/pi";
import { TbMapPinCode } from "react-icons/tb";
import { getCurrentLocation } from '../utils/address';
import {
    BUCKET_NAMES,
    DEFAULTS,
    FORM_FIELDS,
    SUPABASE_TABLES,
    MESSAGES,
    TIME_FORMAT,
    
    VENDOR_DATA_KEYS
} from '../utils/vendorConfig';
import { useNavigate } from 'react-router-dom';
import {
    nameValidation,
    nameKeyDownHandler,
    shopNameValidation,
    shopNameKeyDownHandler,
    InputCleanup,
    streetValidation,
    streetKeyDown,
    streetInputClean,
    cityStateValidation,
    cityStateKeyDown,
    cityStateInputClean,
    pincodeValidation,
    pincodeKeyDown,
    pincodeInputClean
} from '../utils/Validation';
import TimePicker from 'react-time-picker';
import 'react-time-picker/dist/TimePicker.css';
import 'react-clock/dist/Clock.css';
import { supabase } from '../utils/supabaseClient';
import LocationPopup from './LocationPopUP';
import Loader from './Loader';
import toast from 'react-hot-toast';
import TimeClockFull from './ClockPopup';
import Header from './Header';
import { useAuth } from '../context/authContext';
import InputField from './InputField';
import { useSearch } from '../context/SearchContext';
import ItemCategory from './ItemCategory';

function VendorRegistration() {
    const [videoFile, setVideoFile] = useState(null);
    const [waitloading,setWaitLoading]=useState(false)
    const [bannerFile, setBannerFile] = useState(null);
    const [paymentFile, setPaymentFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [location, setLocation] = useState(null);
    const [startTime1, setStartTime1] = useState(null);
    const [endTime1, setEndTime1] = useState(null);
    const [startTime2, setStartTime2] = useState(null);
    const [endTime2, setEndTime2] = useState(null);
    const [startView1, setStartView1] = useState(false);
    const [endView1, setEndView1] = useState(false);
    const [startView2, setStartView2] = useState(false);
    const [endView2, setEndView2] = useState(false);
    const [locationError, setLocationError] = useState(false);
    const [err,setErr] = useState(null)

    const [position, setPosition] = useState({ lat: 26.8467, lng: 80.9462 }); // Default to Lucknow coordinates
    const { selectedAddress, setSelectedAddress } = useSearch();
    const navigate = useNavigate();

    const { session, vendorData } = useAuth();
    const { register, handleSubmit, setValue, formState: { errors }, watch, reset, trigger , setError,
        clearErrors,
         } = useForm({ mode: 'onChange' });

    const watchFields = {
        name: watch(FORM_FIELDS?.NAME),
        shopName: watch(FORM_FIELDS?.SHOP_NAME),
        street: watch(FORM_FIELDS?.STREET),
        city: watch(FORM_FIELDS?.CITY),
        state: watch(FORM_FIELDS?.STATE),
        pincode: watch(FORM_FIELDS?.PINCODE),
        cuisines: watch(FORM_FIELDS?.CUISINES),
        startTime1: watch('startTime1'),
        endTime1: watch('endTime1'),

    };
    console.log("Registration session", session)


    // File upload function
    const uploadFile = async (file, bucketName, vendor_name) => {
        if (!file) return null;

        const fileExt = file?.name?.split('.')?.pop();
        const cleanVendorName = vendor_name?.replace(/\s+/g, '_'); // spaces to underscore
        const filePath = `${Date.now()}_${cleanVendorName}.${fileExt}`;


        const { data, error } = await supabase.storage
            .from(bucketName)
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: true,
            });

        if (error) {
            console.error('Error uploading file:', error?.message);
            toast.error("Error uploading file");
            throw new Error(error?.message); // Throw error to stop further processing
        }

        const { data: urlData, error: urlError } = supabase.storage
            .from(bucketName)
            .getPublicUrl(filePath);

        if (urlError) {
            console.error('Error getting public URL:', urlError?.message);
            throw new Error(urlError?.message); // Throw error to stop further processing
        }

        return urlData?.publicUrl;
    };

//changing time to hh:mm A

    const formatTime = (time) => time ? time?.format(TIME_FORMAT) : DEFAULTS.TIME;

    const onSubmit = async (data) => {
        // const customValid = validateCustomFields();
        // if (!customValid) return;
        console.log("✅ handleSubmit called with data:", data); // 👈 YEH CHECK HAI

        setLoading(true);
        const vendor_name = data[FORM_FIELDS?.NAME] || 'unknown'; 
        try {
            const [videoUrl, bannerUrl, paymentQRUrl] = await Promise.all([
                uploadFile(videoFile, BUCKET_NAMES?.VIDEO, vendor_name),
                uploadFile(bannerFile, BUCKET_NAMES?.BANNER, vendor_name),
                uploadFile(paymentFile, BUCKET_NAMES?.PAYMENT, vendor_name)
            ]);

            const shopData = {
                // u_id: user_id,
                [VENDOR_DATA_KEYS?.VENDOR_NAME]: data[FORM_FIELDS?.NAME],
                [VENDOR_DATA_KEYS?.SHOP_NAME]: data[FORM_FIELDS?.SHOP_NAME],
                [VENDOR_DATA_KEYS?.STREET]: data[FORM_FIELDS?.STREET],
                [VENDOR_DATA_KEYS?.CITY]: data[FORM_FIELDS?.CITY],
                [VENDOR_DATA_KEYS?.STATE]: data[FORM_FIELDS?.STATE],
                [VENDOR_DATA_KEYS?.PINCODE]: data[FORM_FIELDS?.PINCODE],
                [VENDOR_DATA_KEYS?.SHIFT1_START]: formatTime(startTime1),
                [VENDOR_DATA_KEYS?.SHIFT1_CLOSE]: formatTime(endTime1),
                [VENDOR_DATA_KEYS?.SHIFT2_START]: formatTime(startTime2),
                [VENDOR_DATA_KEYS?.SHIFT2_CLOSE]: formatTime(endTime2),
                [VENDOR_DATA_KEYS?.CUISINES]: data[FORM_FIELDS.CUISINES] || [],
                [VENDOR_DATA_KEYS?.VIDEO_URL]: videoUrl || DEFAULTS?.VIDEO_URL,
                [VENDOR_DATA_KEYS?.BANNER_URL]: bannerUrl || DEFAULTS?.BANNER_URL,
                [VENDOR_DATA_KEYS?.PAYMENT_QR_URL]: paymentQRUrl,
                latitude: selectedAddress?.lat || -1,
                longitude: selectedAddress?.long || -1,
                v_id: uuidv4(),
                u_id: session?.user?.id,
                mobile_number: '+' + session?.user?.phone,
                [VENDOR_DATA_KEYS?.NOTE]: data[FORM_FIELDS?.NOTE]?.trim() || DEFAULTS?.NOTE,
              };

            const fullVendorData = {
                
                ...shopData,
            };

            //  insert 
            const { data:insertData, error } = await supabase
                .from(SUPABASE_TABLES.VENDOR)
                .insert(fullVendorData);
          
    
            if (error) {
                console.error('Insert Error:', error.message);
                toast.error(MESSAGES.REGISTER_FAILED);
                return;
            }

            setVideoFile(null);
            setBannerFile(null);
            setPaymentFile(null);
            setStartTime1(null);
            setEndTime1(null);
            setStartTime2(null);
            setEndTime2(null);
            reset();

            toast.success(MESSAGES.REGISTER_SUCCESS);
            // 👇 Register the user
            const { data: updatedUser, error: updateError } = await supabase.auth.updateUser({
                data: { isRegistered: true },
            });

            if (updateError) {
                toast.error("User metadata update failed");
                return;
            }

            // 👇 Fetch fresh session
            const { data:sessionData } = await supabase.auth.getSession();
            if (sessionData?.session?.user?.user_metadata?.isRegistered) {
                // setSession(data.session); // context
                navigate("/home");
            } else {
                toast.error("User session not updated with registration info");
            }


            // navigate('/home');

        } catch (err) {
            console.error('Unexpected Error:', err);
            toast.error(MESSAGES.UNEXPECTED_ERROR);
        } finally {
            setLoading(false);
        }
    };

    // ✅ Manual validation for readOnly fields
    const validateCustomFields = () => {
        let isValid = true;

        if (!startTime1) {
            setError('startTime1', {
                type: 'manual',
                message: 'Start Time is required',
            });
            isValid = false;
        } else {
            clearErrors('startTime1');
        }

        if (!endTime1) {
            setError('endTime1', {
                type: 'manual',
                message: 'Close Time is required',
            });
            isValid = false;
        } else {
            clearErrors('endTime1');
        }

        if (!paymentFile) {
            setError('paymentFile', {
                type: 'manual',
                message: 'QR image is required',
            });
            isValid = false;
        } else {
            clearErrors('paymentFile');
        }

        if (!videoFile && !bannerFile) {
            setError('media', {
                type: 'manual',
                message: 'Either Video or Banner is required',
            });
            isValid = false;
        } else {
            clearErrors('media');
        }
        if (!selectedAddress?.lat || !selectedAddress?.long) {
            // toast.error("Please select your location");
            setLocationError(true);
            isValid = false;
        } else {
            setLocationError(false);
        }
        if (!watchFields?.cuisines || watchFields?.cuisines?.length === 0) {
            setError(FORM_FIELDS?.CUISINES, {
                type: 'manual',
                message: 'At least one cuisine is required',
            });
            isValid = false;
        } else {
            clearErrors(FORM_FIELDS?.CUISINES);
        }
          
        
        

        return isValid;
    };

    React.useEffect(() => {
        if (showPopup || loading) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }

        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [showPopup, loading]);

    // Check if form is incomplete
    const filteredErrors = Object.entries(errors).filter(([key, value]) => {
        // ❌ Ignore only this specific message
        if (value?.ref === undefined) return false;
        return true; // ✅ Count all other errors
    });
    const isFormIncomplete =
        !watchFields?.name ||
        !watchFields?.shopName ||
        !watchFields?.street ||
        !watchFields?.city ||
        !watchFields?.state ||
        !watchFields?.pincode ||
        !paymentFile ||
        !watchFields?.cuisines ||
        !watchFields?.startTime1 ||
        !watchFields?.endTime1 ||
        watchFields?.cuisines?.length === 0 ||
        (!bannerFile && !videoFile) ||
        loading ||
        !selectedAddress?.lat || !selectedAddress?.long ||
        filteredErrors.length > 0 

    console.log("vendorData", vendorData)
    console.log(watchFields?.cuisines)

    console.log(session)
    // Handle “Current Location” button click
    const handleCurrentLocation = async () => {
        setWaitLoading(true)
        const toastId = toast.loading("Getting current Location");

        try {
            const { success, error: locError } = await getCurrentLocation(
                ({ lat, lng }) => {
                    // Prevent unnecessary state update
                    setPosition({ lat, lng });
                },
                setErr,
                setSelectedAddress,
                
            );

            toast.dismiss(toastId);

            if (!success || locError) {
                console.log("location returned",locError)
                return;
            }

            setLocationError(false);
            console.log("✅ Current location fetched");
            setWaitLoading(false)

        } catch (err) {
            toast.dismiss(toastId);
            console.error("❌ Location Error:", err);
        }
    };
      
        
    useEffect(() => {
        console.log("📍 Selected Address updated:", selectedAddress);
    }, [selectedAddress]);

    const onFormSubmit = handleSubmit(async (data) => {
        console.log("yha pahucha")
        const customValid = validateCustomFields();
        console.log("Custom Validation", customValid);

        if (!customValid) {
            toast.error("Please complete required fields.");
            return;
        }

        await onSubmit(data); // your actual function
    });
      
    
    return (
        <div className="flex justify-center items-center w-full min-h-screen bg-gray-100 md:px-4">
            {loading && <Loader />}
            <div className="border border-gray-300 bg-white w-full max-w-2xl  rounded-lg shadow-lg">
                <Header title="Registration" />
                <div className='md:p-6 p-2 rounded-lg shadow-lg mt-20 '>
                    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-7  py-4" noValidate>
                        {/* Card 1: Name, Shop Name, Timings, Upload */}
                        <div className="px-6 py-5 shadow-lg rounded-lg border border-gray-300  flex flex-col gap-6 bg-white ">
                            {/* Name & Shop Name */}
                            <h1 className='md:text-2xl text-lg font-semibold text-gray-500'>Basic Details</h1>
                            <div className=' flex flex-col gap-5'>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <InputField
                                        id="name"
                                        placeholder="Your Name"
                                        icon={FaRegUser}
                                        register={register}
                                        validation={nameValidation}
                                        error={errors?.name}
                                        onKeyDown={nameKeyDownHandler}
                                        onInput={InputCleanup}
                                    />
                                    <InputField
                                        id="shopName"
                                        placeholder="Shop Name"
                                        icon={AiOutlineShop}
                                        register={register}
                                        validation={shopNameValidation}
                                        error={errors?.shopName}
                                        onKeyDown={shopNameKeyDownHandler}
                                        onInput={InputCleanup}
                                    />
                                </div>
                                {/* Timings */}
                                {/* ===== Shift 1 ===== */}
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-700 mb-2">Shift 1</h2>
                                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                                        {/* Start At */}
                                        <div className="w-full">
                                            <div className="relative">
                                                <FaRegClock className="absolute left-3 top-4 text-black" />
                                                <input
                                                    id="startTime1"
                                                    type="text"
                                                    readOnly
                                                    value={startTime1 ? startTime1.format('hh:mm A') : ''}
                                                    onClick={() => setStartView1(true)}
                                                    placeholder="Start At"
                                                    className="peer pl-10 pt-3 pb-3 w-full rounded border border-gray-300 focus:outline-none focus:border-orange transition-all placeholder-transparent"
                                                />
                                                <label
                                                    htmlFor="startTime1"
                                                    className="absolute left-10 -top-2.5 text-sm bg-white text-black transition-all 
          peer-placeholder-shown:top-4 
          peer-placeholder-shown:text-gray-500 
          peer-focus:-top-2.5 
          peer-focus:text-sm 
          peer-focus:font-semibold 
          peer-not-placeholder-shown:font-semibold"
                                                >
                                                    Starts At
                                                </label>
                                            </div>
                                            {errors?.startTime1 && <p className="text-red-500 text-sm mt-1">{errors?.startTime1?.message}</p>}
                                            <TimeClockFull
                                                isOpen={startView1}
                                                onClose={() => setStartView1(false)}
                                                onTimeSelect={(time) => {
                                                    setStartTime1(time);
                                                    setStartView1(false);
                                                    setValue('startTime1', time);
                                                }}
                                            />
                                        </div>

                                        {/* Close At */}
                                        <div className="w-full">
                                            <div className="relative">
                                                <FaRegClock className="absolute left-3 top-4 text-black" />
                                                <input
                                                    id="endTime1"
                                                    type="text"
                                                    readOnly
                                                    value={endTime1 ? endTime1.format('hh:mm A') : ''}
                                                    onClick={() => setEndView1(true)}
                                                    placeholder="Close At"
                                                    className="peer pl-10 pt-3 pb-3 w-full rounded border border-gray-300 focus:outline-none focus:border-orange transition-all placeholder-transparent"
                                                />
                                                <label
                                                    htmlFor="endTime1"
                                                    className="absolute left-10 -top-2.5 text-sm bg-white text-black transition-all 
          peer-placeholder-shown:top-4 
          peer-placeholder-shown:text-gray-500 
          peer-focus:-top-2.5 
          peer-focus:text-sm 
          peer-focus:font-semibold 
          peer-not-placeholder-shown:font-semibold"
                                                >
                                                    Closes At
                                                </label>
                                            </div>
                                            {errors?.endTime1 && <p className="text-red-500 text-sm mt-1">{errors?.endTime1?.message}</p>}
                                            <TimeClockFull
                                                isOpen={endView1}
                                                onClose={() => setEndView1(false)}
                                                onTimeSelect={(time) => {
                                                    setEndTime1(time);
                                                    setEndView1(false);
                                                    setValue('endTime1', time);
                                                }}
                                            />
                                        </div>
                                    </div>

                                    {/* ===== Shift 2 ===== */}
                                    <h2 className="text-lg  font-semibold text-gray-700 mb-2">Shift 2<span className="text-gray-500 font-normal"> (Optional)</span> </h2>
                                    <div className="flex flex-col md:flex-row gap-4">
                                        {/* Start At */}
                                        <div className="w-full">
                                            <div className="relative">
                                                <FaRegClock className="absolute left-3 top-4 text-black" />
                                                <input
                                                    id="startTime2"
                                                    type="text"
                                                    readOnly
                                                    value={startTime2 ? startTime2.format('hh:mm A') : ''}
                                                    onClick={() => setStartView2(true)}
                                                    placeholder="Start At"
                                                    className="peer pl-10 pt-3 pb-3 w-full rounded border border-gray-300 focus:outline-none focus:border-orange transition-all placeholder-transparent"
                                                />
                                                <label
                                                    htmlFor="startTime2"
                                                    className="absolute left-10 -top-2.5 text-sm bg-white text-black transition-all 
          peer-placeholder-shown:top-4 
          peer-placeholder-shown:text-gray-500 
          peer-focus:-top-2.5 
          peer-focus:text-sm 
          peer-focus:font-semibold 
          peer-not-placeholder-shown:font-semibold"
                                                >
                                                    Starts At
                                                </label>
                                            </div>
                                            {errors?.startTime2 && <p className="text-red-500 text-sm mt-1">{errors?.startTime2?.message}</p>}
                                            <TimeClockFull
                                                isOpen={startView2}
                                                onClose={() => setStartView2(false)}
                                                onTimeSelect={(time) => {
                                                    setStartTime2(time);
                                                    setStartView2(false);
                                                    setValue('startTime2', time);
                                                }}
                                            />
                                        </div>

                                        {/* Close At */}
                                        <div className="w-full">
                                            <div className="relative">
                                                <FaRegClock className="absolute left-3 top-4 text-black" />
                                                <input
                                                    id="endTime2"
                                                    type="text"
                                                    readOnly
                                                    value={endTime2 ? endTime2.format('hh:mm A') : ''}
                                                    onClick={() => setEndView2(true)}
                                                    placeholder="Close At"
                                                    className="peer pl-10 pt-3 pb-3 w-full rounded border border-gray-300 focus:outline-none focus:border-orange transition-all placeholder-transparent"
                                                />
                                                <label
                                                    htmlFor="endTime2"
                                                    className="absolute left-10 -top-2.5 text-sm bg-white text-black transition-all 
          peer-placeholder-shown:top-4 
          peer-placeholder-shown:text-gray-500 
          peer-focus:-top-2.5 
          peer-focus:text-sm 
          peer-focus:font-semibold 
          peer-not-placeholder-shown:font-semibold"
                                                >
                                                    Closes At
                                                </label>
                                            </div>
                                            {errors.endTime2 && <p className="text-red-500 text-sm mt-1">{errors.endTime2.message}</p>}
                                            <TimeClockFull
                                                isOpen={endView2}
                                                onClose={() => setEndView2(false)}
                                                onTimeSelect={(time) => {
                                                    setEndTime2(time);
                                                    setEndView2(false);
                                                    setValue('endTime2', time);
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>



                                {/* Uploads */}
                                <div className="flex flex-col md:flex-row justify-between gap-4 mt-3">
                                    <FileUploadButton
                                        label="Select Video"
                                        bgColor="bg-blue"
                                        Icon={HiOutlineVideoCamera}
                                        accept="video/*"
                                        onChange={(e) => setVideoFile(e.target.files[0])}
                                        file={videoFile}
                                        loading={loading}
                                        placeholder={'No video selected'}
                                        error={errors?.media}  // error pass karo
                                    />

                                    <FileUploadButton
                                        label="Select Banner"
                                        bgColor="bg-green"
                                        Icon={IoImageOutline}
                                        accept="image/*"
                                        onChange={(e) => setBannerFile(e.target.files[0])}
                                        file={bannerFile}
                                        loading={loading}
                                        placeholder={'No banner selected'}
                                        error={errors?.media}  // error pass karo
                                    />

                                    <FileUploadButton
                                        label="Select QR"
                                        bgColor="bg-yellow"
                                        Icon={IoQrCodeOutline}
                                        accept="image/*"
                                        onChange={(e) => setPaymentFile(e.target.files[0])}
                                        file={paymentFile}
                                        loading={loading}
                                        placeholder={'No QR selected'}
                                        error={errors?.paymentFile}  // error pass karo
                                    />
                                </div>

                            </div>
                        </div>
                        {/* Address */}
                        <div className="px-6 py-5 shadow-lg rounded-lg border border-gray-300 flex flex-col gap-6 bg-white">
                            <h1 className='md:text-2xl text-lg font-semibold text-gray-500'>Address & Location</h1>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                <InputField
                                    icon={GrStreetView}
                                    
                                    id="street"
                                    label="Street"
                                    placeholder="Street"
                                    register={register}
                                    validation={streetValidation}
                                    error={errors?.street}
                                    onKeyDown={streetKeyDown}
                                    onInput={streetInputClean}
                                />

                                {/* City */}
                                <InputField
                                    id="city"
                                    label="City"
                                    icon={PiCityLight}
                                    placeholder="City"
                                    register={register}
                                    validation={{ ...cityStateValidation, required: "City is required" }}
                                    error={errors?.city}
                                    onKeyDown={cityStateKeyDown}
                                    onInput={cityStateInputClean}
                                />

                                {/* State */}
                                <InputField
                                    id="state"
                                    icon={PiMapPinAreaLight}
                                    label="State"
                                    placeholder="State"
                                    register={register}
                                    validation={{ ...cityStateValidation, required: "State is required" }}
                                    error={errors?.state}
                                    onKeyDown={cityStateKeyDown}
                                    onInput={cityStateInputClean}
                                />

                                {/* Pincode */}
                                <InputField
                                    id="pincode"
                                    icon={TbMapPinCode}
                                    label="Pincode"
                                    placeholder="Pincode"
                                    register={register}
                                    validation={pincodeValidation}
                                    error={errors?.pincode}
                                    onKeyDown={pincodeKeyDown}
                                    onInput={pincodeInputClean}
                                    maxLength={6}
                                    inputMode="numeric"
                                />                                {/* /* Location Button */}
                                <div className='flex items-center gap-5  '>
                                    <button
                                        type="button"
                                        onClick={() => setShowPopup(true)}
                                        disabled={waitloading}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-white transition 
    ${waitloading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue cursor-pointer hover:bg-blue-700'}`}
                                    >
                                        <MdAddLocationAlt className="text-lg" />
                                        {selectedAddress?.lat && selectedAddress?.long ? "Location Selected" : "Current Location"}
                                    </button>

                                    {/* Popup */}
                                    {/* {showPopup && (
                                        <LocationPopup
                                            setLocation={(loc) => {
                                                setLocation(loc);
                                                setSelectedAddress(loc);
                                                setShowPopup(false);
                                            }}
                                            show={showPopup}
                                            onClose={() => setShowPopup(false)}
                                        />
                                    )} */}

                                    <button
                                        type="button"
                                        onClick={handleCurrentLocation}
                                        disabled={waitloading}
                                        className={`flex justify-center items-center rounded-full p-2 
    ${waitloading ? 'bg-gray-400 cursor-not-allowed' : 'bg-teal cursor-pointer'}`
                                        }
                                    >
                                        <MdGpsFixed className="text-2xl text-white" />
                                    </button>

                                </div>
                                {locationError ? (
                                    <p className="text-sm text-red-500">Please select your location</p>
                                ) : (location || selectedAddress) ? (
                                    <p className="mt-2 text-sm text-gray-700">
                                            Current location: {selectedAddress?.landmark ||location?.landmark }
                                            {console.log(location,selectedAddress)}
                                    </p>
                                ) : null}



                            </div>

                        </div>

                        {/* Card 3: Cuisine */}
                        {/* <CuisineSelector register={register} errors={errors} /> */}
                        <ItemCategory
                            value={watch(FORM_FIELDS?.CUISINES)}
                            onChange={(val) => {
                                setValue(FORM_FIELDS?.CUISINES, val, { shouldValidate: true });
                                if (val?.length > 0) {
                                    clearErrors(FORM_FIELDS?.CUISINES);
                                }
                            }}
                            error={errors?.[FORM_FIELDS?.CUISINES]?.message}
                        />

                        {/* Note from Vendor (optional) */}
                        <div className="relative col-span-2">
                            <textarea
                                id="note"
                                rows={4}
                                {...register("note")}
                                placeholder="Enter any note (optional)"
                                className="peer w-full border border-gray-300 rounded-lg shadow-lg p-3 placeholder-transparent focus:outline-none focus:border-orange transition-all resize-none"
                            />
                            <label
                                htmlFor="note"
                                className="absolute left-3 -top-2.5 text-sm bg-white text-black font-semibold transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-gray-500 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:font-semibold"
                            >
                                Note (optional)
                            </label>
                        </div>



                        {/* Submit */}
                        <button
                            type="button"
                            onClick={onFormSubmit}
                            // disabled={isFormIncomplete}
                            disabled={waitloading}
                            className={`py-3 rounded-lg shadow-lg  transition ${isFormIncomplete
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-primary hover:bg-indigo-800 cursor-pointer text-white'}`}
                        >
                            {loading ? 'Creating Account...' : 'Create Account'}
                        </button>







                    </form>
                    {showPopup && (
                        <LocationPopup
                            setLocation={(loc) => {
                                setLocation(loc);
                                setSelectedAddress(loc);
                                // setShowPopup(false);
                            }}
                            show={showPopup}
                            onClose={() => setShowPopup(false)}
                        />
                    )}
                </div>
                

            </div>
        </div>
    );
}

export default VendorRegistration;
