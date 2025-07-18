import React, { useState, useEffect,useRef } from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigationType } from "react-router-dom";
import { FaRegUser, FaStore, FaRegClock } from "react-icons/fa";
import { MdAddLocationAlt, MdGpsFixed } from "react-icons/md";
import { HiOutlineVideoCamera } from "react-icons/hi2";
import { IoImageOutline, IoQrCodeOutline } from "react-icons/io5";
import { AiOutlineShop } from "react-icons/ai";
import FileUploadButton from "./FileUploadButton";
import { v4 as uuidv4 } from "uuid";
import { GrStreetView } from "react-icons/gr";
import { PiCityLight } from "react-icons/pi";
import { PiMapPinAreaLight } from "react-icons/pi";
import { TbMapPinCode } from "react-icons/tb";
import { getCurrentLocation } from "../utils/address";
import { uploadFile } from "../utils/uploadFile";
import { TbBuildingEstate } from "react-icons/tb";

import {
  BUCKET_NAMES,
  DEFAULTS,
  FORM_FIELDS,
  SUPABASE_TABLES,
  MESSAGES,
  TIME_FORMAT,
  VENDOR_DATA_KEYS,
} from "../utils/vendorConfig";
import { useNavigate } from "react-router-dom";
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
  pincodeInputClean,
} from "../utils/Validation";
import TimePicker from "react-time-picker";
import "react-time-picker/dist/TimePicker.css";
import "react-clock/dist/Clock.css";
import { supabase } from "../utils/supabaseClient";
import LocationPopup from "./LocationPopUP";
import Loader from "./Loader";
import toast from "react-hot-toast";
import TimeClockFull from "./ClockPopup";
import Header from "./Header";
import { useAuth } from "../context/authContext";
import InputField from "./InputField";
import { useSearch } from "../context/SearchContext";
import ItemCategory from "./ItemCategory";
import TransparentLoader from "./Transparentloader";

function VendorRegistration() {
  const [videoFile, setVideoFile] = useState(null);
  const [waitloading, setWaitLoading] = useState(false);
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
  const [err, setErr] = useState(null);

  const [position, setPosition] = useState({ lat: 26.8467, lng: 80.9462 }); // Default to Lucknow coordinates
  const { selectedAddress, setSelectedAddress } = useSearch();
  const navigate = useNavigate();

  const { session, vendorData } = useAuth();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    watch,
    reset,
    trigger,
    setError,
    clearErrors,
    getValues
  } = useForm({ mode: "onChange" });

  const watchFields = {
    name: watch(FORM_FIELDS?.NAME),
    shopName: watch(FORM_FIELDS?.SHOP_NAME),
    street: watch(FORM_FIELDS?.STREET),
    city: watch(FORM_FIELDS?.CITY),
    state: watch(FORM_FIELDS?.STATE),
    pincode: watch(FORM_FIELDS?.PINCODE),
    cuisines: watch(FORM_FIELDS?.CUISINES),
    startTime1: watch("startTime1"),
    endTime1: watch("endTime1"),
  };

  const navType = useNavigationType(); // "PUSH" | "REPLACE" | "POP"

  useEffect(() => {
    if (navType === "POP") {
      navigate("/", { replace: true });
    }
  }, [navType, navigate]);

  //changing time to hh:mm A

  const formatTime = (time) =>
    time ? time?.format(TIME_FORMAT) : DEFAULTS.TIME;

  const onSubmit = async (data) => {
    // const customValid = validateCustomFields();
    // if (!customValid) return;

    setLoading(true);
    const vendor_name = data[FORM_FIELDS?.NAME] || "unknown";
    try {
      const [videoUrl, bannerUrl, paymentQRUrl] = await Promise.all([
        uploadFile(videoFile, BUCKET_NAMES?.VIDEO, vendor_name),
        uploadFile(bannerFile, BUCKET_NAMES?.BANNER, vendor_name),
        uploadFile(paymentFile, BUCKET_NAMES?.PAYMENT, vendor_name),
      ]);

      const shopData = {
        // u_id: user_id,
        [VENDOR_DATA_KEYS?.VENDOR_NAME]: data[FORM_FIELDS?.NAME]?.trim(),
        [VENDOR_DATA_KEYS?.SHOP_NAME]: data[FORM_FIELDS?.SHOP_NAME]?.trim(),
        [VENDOR_DATA_KEYS?.STREET]: data[FORM_FIELDS?.STREET]?.trim(),
        [VENDOR_DATA_KEYS?.CITY]: data[FORM_FIELDS?.CITY]?.trim(),
        [VENDOR_DATA_KEYS?.STATE]: data[FORM_FIELDS?.STATE]?.trim(),
        [VENDOR_DATA_KEYS?.PINCODE]: data[FORM_FIELDS?.PINCODE]?.trim(),
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
        mobile_number: "+" + session?.user?.phone,
        [VENDOR_DATA_KEYS?.NOTE]:
          data[FORM_FIELDS?.NOTE]?.trim() || DEFAULTS?.NOTE,
      };

      const fullVendorData = {
        ...shopData,
      };

      //  insert
      const { data: insertData, error } = await supabase
        .from(SUPABASE_TABLES.VENDOR)
        .insert(fullVendorData);

      if (error) {
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
      const { data: updatedUser, error: updateError } =
        await supabase.auth.updateUser({
          data: { isRegistered: true },
        });

      if (updateError) {
        toast.error("User metadata update failed");
        return;
      }

      // 👇 Fetch fresh session
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData?.session?.user?.user_metadata?.isRegistered) {
        navigate("/home");
      } else {
        toast.error(MESSAGES.SESSION_NOT_UPDATED);
      }
    } catch (err) {
      toast.error(MESSAGES.UNEXPECTED_ERROR);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Manual validation for readOnly fields
  const validateCustomFields = () => {
    let isValid = true;
  
    const startTime1Value = watch("startTime1");
    const endTime1Value = watch("endTime1");
    const cuisinesValue = watch(FORM_FIELDS?.CUISINES);
  
    if (!startTime1Value) {
      setError("startTime1", {
        type: "manual",
        message: "Start Time is required",
      });
      isValid = false;
    } else {
      clearErrors("startTime1");
    }
  
    if (!endTime1Value) {
      setError("endTime1", {
        type: "manual",
        message: "Close Time is required",
      });
      isValid = false;
    } else {
      clearErrors("endTime1");
    }
  
    if (!paymentFile) {
      setError("paymentFile", {
        type: "manual",
        message: "QR image is required",
      });
      isValid = false;
    } else {
      clearErrors("paymentFile");
    }
  
    if (!videoFile && !bannerFile) {
      setError("media", {
        type: "manual",
        message: "Either Video or Banner is required",
      });
      isValid = false;
    } else {
      clearErrors("media");
    }
  
    if (!selectedAddress?.lat || !selectedAddress?.long) {
      setLocationError(true);
      isValid = false;
    } else {
      setLocationError(false);
    }
  
    if (!cuisinesValue || cuisinesValue.length === 0) {
      setError(FORM_FIELDS?.CUISINES, {
        type: "manual",
        message: "At least one cuisine is required",
      });
      isValid = false;
    } else {
      clearErrors(FORM_FIELDS?.CUISINES);
    }
  
    return isValid;
  };

  
  
  
  

  // block click when loading
  React.useEffect(() => {
    if (showPopup || loading) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showPopup, loading]);

  // // Check if form is incomplete
  // const filteredErrors = Object.entries(errors).filter(([key, value]) => {
  //   // ❌ Ignore only this specific message
  //   if (value?.ref === undefined) return false;
  //   return true; // ✅ Count all other errors
  // });

  //for validation
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
    !selectedAddress?.lat ||
    !selectedAddress?.long ||
    Object.keys(errors).length > 0

  //current location
  const handleCurrentLocation = async () => {
    setWaitLoading(true); //for disable
    const toastId = toast.loading("Getting current Location");

    try {
      const { success, error: locError } = await getCurrentLocation(
        ({ lat, lng }) => {
          // Prevent unnecessary state update
          setPosition({ lat, lng });
        },
        setErr,
        setSelectedAddress
      );

      toast.dismiss(toastId);

      if (!success || locError) {
        return;
      }

      setLocationError(false);
      setWaitLoading(false);
    } catch (err) {
      toast.dismiss(toastId);
    }
  };

  //submit function

  const refs = {
    name: useRef(),
    shopName: useRef(),
    street: useRef(),
    city: useRef(),
    state: useRef(),
    pincode: useRef(),
    cuisines: useRef(),
    startTime1: useRef(),
    endTime1: useRef(),
    
    uploads: useRef(),
    locationSection: useRef(),
  };
  
  const scrollToRef = (ref) => {
    if (ref?.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "center" });
      ref.current.focus?.();
    } else {
    }
  };
  
  const onFormSubmit = async () => {
    const isRHFValid = await trigger(); // validate registered fields
    const isCustomValid = validateCustomFields(); // validate custom fields
  
    if (!isRHFValid || !isCustomValid) {
      toast.error("Please complete required fields.");
  
      const values = getValues();
  
      // Debug logs for every condition:
      if (!values.name?.trim()) {
        scrollToRef(refs.name);
      } else if (!values.shopName?.trim()) {
        scrollToRef(refs.shopName);
      } else if (!values.street?.trim()) {
        scrollToRef(refs.street);
      } else if (!values.city?.trim()) {
        scrollToRef(refs.city);
      } else if (!values.state?.trim()) {
        scrollToRef(refs.state);
      } else if (!values.pincode?.trim()) {
        scrollToRef(refs.pincode);
      } else if (!values.startTime1) {
        scrollToRef(refs.startTime1);
      } else if (!values.endTime1) {
        scrollToRef(refs.endTime1);
      } else if (!values.cuisines || values.cuisines.length === 0) {
        scrollToRef(refs.cuisines);
      } else if (!paymentFile) {
        scrollToRef(refs.uploads);
      } else if (!bannerFile && !videoFile) {
        scrollToRef(refs.uploads);
      } else if (!selectedAddress?.lat || !selectedAddress?.long) {
        scrollToRef(refs.locationSection);
      }
  
      return;
    }
  
    const data = getValues();
    await onSubmit(data);
  };
  
  

  return (
    <div className="flex justify-center items-center w-full min-h-screen bg-gray-100 md:px-4">
      {loading && <Loader />}
      <div className="border border-gray-300 bg-white w-full max-w-2xl  rounded-lg shadow-lg">
        <Header title="Registration" />
        <div className="md:p-6 p-2 rounded-lg shadow-lg mt-15 ">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-7 mb-10 py-4"
            noValidate
          >
            {/* Card 1: Name, Shop Name, Timings, Upload */}
            <div className="px-6 py-5 shadow-lg rounded-lg border border-gray-300  flex flex-col gap-6 bg-white ">
              {/* Name & Shop Name */}
              <h1 className="text-md md:text-2xl lg:text-2xl font-medium text-gray uppercase">
                Basic Details
              </h1>
              <div className=" flex flex-col gap-5">
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
                    value={watchFields?.name}
                    inputRef={refs.name}
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
                    value={watchFields?.shopName}
                    inputRef={refs.shopName}

                  />
                </div>
                {/* Timings */}
                {/* ===== Shift 1 ===== */}
                <div>
                  <h2 className="text-lg text-gray-500 mb-2 uppercase">
                    Shift 1
                  </h2>
                  <div className="flex flex-col md:flex-row gap-4 mb-6">
                    {/* Start At */}
                    <div className="w-full">
                      <div className="relative">
                        <FaRegClock className="absolute left-3 top-4 text-black" />
                        <input
                          id="startTime1"
                          type="text"
                          readOnly
                          ref={refs.startTime1}
                          value={startTime1 ? startTime1.format("hh:mm A") : ""}
                          onClick={() => setStartView1(true)}
                          placeholder="Start At"
                          className={`peer pl-10 pt-3 pb-3 w-full text-gray-800 rounded border transition-all placeholder-transparent
                            ${
                              errors?.startTime1
                                ? "border-red-500 focus:border-red-500"
                                : startTime1
                                ? "border-green-500 focus:border-green-500"
                                : "border-gray-300 focus:border-gray-300"
                            }
                            focus:outline-none`}                        />
                        <label
                          htmlFor="startTime1"
                          className="absolute left-10 -top-2.5 text-sm bg-white text-gray-500 transition-all 
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
                      {errors?.startTime1 && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors?.startTime1?.message}
                        </p>
                      )}
                      <TimeClockFull
                        isOpen={startView1}
                        onClose={() => setStartView1(false)}
                        onTimeSelect={(time) => {
                          setStartTime1(time);
                          setStartView1(false);
                          setValue("startTime1", time);
                          clearErrors("startTime1"); // 👈 Add this
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
                          ref={refs.endTime1}
                          value={endTime1 ? endTime1.format("hh:mm A") : ""}
                          onClick={() => setEndView1(true)}
                          placeholder="Close At"
                          className={`peer pl-10 pt-3 pb-3 w-full rounded border text-gray-800 transition-all placeholder-transparent
                            ${
                              errors?.endTime1
                                ? "border-red-500 focus:border-red-500"
                                : endTime1
                                ? "border-green-500 focus:border-green-500"
                                : "border-gray-300 focus:border-gray-300"
                            }
                            focus:outline-none`}                        />
                        <label
                          htmlFor="endTime1"
                          className="absolute left-10 -top-2.5 text-sm bg-white text-gray-500 transition-all 
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
                      {errors?.endTime1 && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors?.endTime1?.message}
                        </p>
                      )}
                      <TimeClockFull
                        isOpen={endView1}
                        onClose={() => setEndView1(false)}
                        onTimeSelect={(time) => {
                          setEndTime1(time);
                          setEndView1(false);
                          setValue("endTime1", time);
                          clearErrors("endTime1"); // 👈 Add this
                        }}
                      />
                    </div>
                  </div>

                  {/* ===== Shift 2 ===== */}
                  <h2 className="text-lg uppercase   text-gray-500 mb-2">
                    Shift 2
                    <span className="text-gray-500 font-normal">
                      {" "}
                      <span className="text-sm">(Optional)</span>
                      
                    </span>{" "}
                  </h2>
                  <div className="flex flex-col md:flex-row gap-4">
                    {/* Start At */}
                    <div className="w-full">
                      <div className="relative">
                        <FaRegClock className="absolute left-3 top-4 text-black" />
                        <input
                          id="startTime2"
                          type="text"
                          readOnly
                          value={startTime2 ? startTime2.format("hh:mm A") : ""}
                          onClick={() => setStartView2(true)}
                          placeholder="Start At"
                          className={`peer pl-10 pt-3 pb-3 w-full rounded border text-gray-800 transition-all placeholder-transparent
                            ${
                              errors?.startTime2
                                ? "border-red-500 focus:border-red-500"
                                : startTime2
                                ? "border-green-500 focus:border-green-500"
                                : "border-gray-300 focus:border-gray-300"
                            }
                            focus:outline-none`}                        />
                        <label
                          htmlFor="startTime2"
                          className="absolute left-10 -top-2.5 text-sm bg-white text-gray-500 transition-all 
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
                      {errors?.startTime2 && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors?.startTime2?.message}
                        </p>
                      )}
                      <TimeClockFull
                        isOpen={startView2}
                        onClose={() => setStartView2(false)}
                        onTimeSelect={(time) => {
                          setStartTime2(time);
                          setStartView2(false);
                          setValue("startTime2", time);
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
                          value={endTime2 ? endTime2.format("hh:mm A") : ""}
                          onClick={() => setEndView2(true)}
                          placeholder="Close At"
                          className={`peer pl-10 pt-3 pb-3 w-full text-gray-800 rounded border transition-all placeholder-transparent
                            ${
                              errors?.endTime2
                                ? "border-red-500 focus:border-red-500"
                                : endTime2
                                ? "border-green-500 focus:border-green-500"
                                : "border-gray-300 focus:border-gray-300"
                            }
                            focus:outline-none`}                        />
                        <label
                          htmlFor="endTime2"
                          className="absolute left-10 -top-2.5 text-sm bg-white text-gray-500 transition-all 
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
                      {errors.endTime2 && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.endTime2.message}
                        </p>
                      )}
                      <TimeClockFull
                        isOpen={endView2}
                        onClose={() => setEndView2(false)}
                        onTimeSelect={(time) => {
                          setEndTime2(time);
                          setEndView2(false);
                          setValue("endTime2", time);
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Uploads */}
                <div ref={refs.uploads} className="flex flex-col  md:flex-row justify-between gap-4 mt-3">
                  <FileUploadButton
                    label="Select Video"
                    bgColor="bg-orange"
                    Icon={HiOutlineVideoCamera}
                    accept="video/*"
                    onChange={(e) => {
                      setVideoFile(e.target.files[0]);
                      clearErrors("media"); // 👈 Add this
                    }}
                                        file={videoFile}
                    loading={loading}
                    placeholder={"No video selected"}
                    error={errors?.media} // error pass karo
                  />

                  <FileUploadButton
                    label="Select Banner"
                    bgColor="bg-orange"
                    Icon={IoImageOutline}
                    accept="image/*"
                    onChange={(e) => {
                      setBannerFile(e.target.files[0]);
                      clearErrors("media"); // 👈 Add this
                    }}
                                        file={bannerFile}
                    loading={loading}
                    placeholder={"No banner selected"}
                    error={errors?.media} // error pass karo
                  />

                  <FileUploadButton
                    label="Select QR"
                    bgColor="bg-orange"
                    Icon={IoQrCodeOutline}
                    accept="image/*"
                    onChange={(e) => {
                      setPaymentFile(e.target.files[0]);
                      clearErrors("paymentFile"); // 👈 Add this
                    }}
                                        file={paymentFile}
                    loading={loading}
                    placeholder={"No QR selected"}
                    error={errors?.paymentFile} // error pass karo
                  />
                </div>
              </div>
            </div>
            {/* Address */}
            <div className="px-6 py-5 shadow-lg rounded-lg border border-gray-300 flex flex-col gap-6 bg-white">
              <h1 className="text-md md:text-2xl lg:text-2xl font-medium text-gray uppercase">
                Address & Location
              </h1>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  icon={GrStreetView}
                  id="street"
                  label="Street"
                  placeholder="House No/Plot No/Street"
                  register={register}
                  validation={streetValidation}
                  error={errors?.street}
                  onKeyDown={streetKeyDown}
                  onInput={streetInputClean}
                  value={watchFields?.street}
                  inputRef={refs.street}

                />
                {/* City */}
                <InputField
                  id="city"
                  label="City"
                  icon={PiCityLight}
                  placeholder="City"
                  register={register}
                  validation={{
                    ...cityStateValidation,
                    required: "City is required",
                  }}
                  error={errors?.city}
                  onKeyDown={cityStateKeyDown}
                  onInput={cityStateInputClean}
                  value={watchFields?.city}
                  inputRef={refs.city}
                />
                {/* State */}
                <InputField
                  id="state"
                  icon={TbBuildingEstate}
                  label="State"
                  placeholder="State"
                  register={register}
                  validation={{
                    ...cityStateValidation,
                    required: "State is required",
                  }}
                  error={errors?.state}
                  onKeyDown={cityStateKeyDown}
                  onInput={cityStateInputClean}
                  value={watchFields?.state}
                  inputRef={refs.state}

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
                  value={watchFields?.pincode}
                  inputRef={refs.pincode}
                />{" "}
                {/* /* Location Button */}
                <div
                  ref={refs.locationSection}
                  className="flex  items-center gap-5   ">
                  <button
                    type="button"
                    onClick={() => setShowPopup(true)}
                    disabled={waitloading}
                    className={`flex items-center gap-2 px-2 py-2 font-medium rounded-md text-white transition 
    ${
      waitloading
        ? "bg-gray-400 cursor-not-allowed"
        : "bg-orange cursor-pointer hover:bg-orange-800"
    }`}
                  >
                    <MdAddLocationAlt className="text-lg" />
                    {selectedAddress?.lat && selectedAddress?.long
                      ? "Location Selected"
                      : "Current Location"}
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
    ${
      waitloading ? "bg-gray-400 cursor-not-allowed" : "bg-orange cursor-pointer"
    }`}
                  >
                    <MdGpsFixed className="text-2xl text-white" />
                  </button>
                </div>
                {locationError ? (
  <p  className="text-sm text-red-500 md:mt-2">
    Please select your location
  </p>
) : selectedAddress ? (
  <p className="md:mt-2 text-sm text-gray-800 bg-green-200 flex justify-center items-center">
    Selected Location: {selectedAddress?.landmark}
  </p>
) : null}

              </div>
            </div>

            {/* Card 3: Cuisine */}
            {/* <CuisineSelector register={register} errors={errors} /> */}
            <div ref={refs.cuisines}>      
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
              </div>


            {/* Note from Vendor (optional) */}
            <div className="relative col-span-2">
              <textarea
                id="note"
                rows={4}
                {...register("note")}
                placeholder="Enter any note (optional)"
                className="peer w-full border border-gray-300 rounded-lg text-gray-800 shadow-lg p-3 placeholder-transparent focus:outline-none focus:border-orange transition-all resize-none"
              />
              <label
                htmlFor="note"
                className="absolute left-3 -top-2.5 text-sm bg-white text-gray-500 font-semibold transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-gray-500 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:font-semibold"
              >
                Note (optional)
              </label>
            </div>

            {/* Submit */}
            
           
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
                  {waitloading && <TransparentLoader text="Getting current location"/>}

        </div>
        <div className="fixed bottom-3 px-2 w-full  max-w-2xl ">
            <button
              type="button"
              onClick={onFormSubmit}
              // disabled={isFormIncomplete}
              disabled={waitloading}
              className={`flex-1  rounded-[8px] h-11 flex items-center justify-center font-bold  text-white text-lg shadow-lg hover:shadow-xl transition-all w-full duration-300 hover:scale-[1.02] disabled:bg-orange/50 disabled:cursor-not-allowed disabled:opacity-70 disabled:text-white ${
                isFormIncomplete
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-br from-orange via-yellow cursor-pointer active:scale-95 to-orange"
              }`}
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
            </div>
      </div>
    </div>
  );
}

export default VendorRegistration;
