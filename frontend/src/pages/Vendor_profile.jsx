import React, { useState, useEffect, useMemo, useRef } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "../utils/supabaseClient";
import Loader from "../components/Loader";
import TimeClockFull from "../components/ClockPopup";
import dayjs from "dayjs";
import moment from "moment";
import { BUCKET_NAMES, SUPABASE_TABLES } from "../utils/vendorConfig";
import ItemCategory from "../components/ItemCategory";
import { getCurrentLocation } from "../utils/address";
import { MdAddLocationAlt, MdGpsFixed } from "react-icons/md";
import { getAddressFromLatLng } from "../utils/address";
import LocationPopup from "../components/LocationPopUP";

import {
  nameValidation,
  nameKeyDownHandler,
  InputCleanup,
  shopNameValidation,
  shopNameKeyDownHandler,
  streetValidation,
  streetKeyDown,
  streetInputClean,
} from "../utils/Validation";
import { useAuth } from "../context/authContext";
import MediaUploader from "../components/MediaUploader";
import Header from "../components/Header";
import BottomNav from "../components/Footer";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useSearch } from "../context/SearchContext";
import TransparentLoader from "../components/Transparentloader";
import { FiMapPin } from "react-icons/fi";
import { getChangedFields, generateChangeDescription } from "../utils/AdminLogs";

export default function VendorProfile() {
  const { vendorProfile, selectedVendorId, session, refreshVendorProfile } =
    useAuth();
  const vendorId = vendorProfile?.v_id || selectedVendorId; // ✅ fallback
  const [isLocationUpdated, setIsLocationUpdated] = useState(false);

  const [loading, setLoading] = useState(false);
  const [selectedCuisineIds, setSelectedCuisineIds] = useState([]);
  const [locationError, setLocationError] = useState(false);
  const [err, setErr] = useState(null);
  //   const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [location, setLocation] = useState(null);
  const [waitloading, setWaitLoading] = useState(false);
  // 1. Default null
  const [position, setPosition] = useState(null);
  const [fetchedAddress, setFetchedAddress] = useState("");

  // 2. Inside fetchVendor useEffect:

  const { selectedAddress, setSelectedAddress } = useSearch();

  const [selectedCuisines, setSelectedCuisines] = useState([]);
  const [isFormReady, setIsFormReady] = useState(false);
  const [initialFormState, setInitialFormState] = useState(null);
  const [bannerUrl, setBannerUrl] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);

  const [videoUrl, setVideoUrl] = useState(null);
  const [videoFile, setVideoFile] = useState(null);

  const [qrUrl, setQrUrl] = useState(null);
  const [qrFile, setQrFile] = useState(null);

  const handleFileChange = (e, setUrl, setFile) => {
    const file = e.target.files[0];
    if (!file) return;
    setUrl(URL.createObjectURL(file));
    setFile(file);
  };

  // ⏰ New time states added
  const [startTime1, setStartTime1] = useState("");
  const [endTime1, setEndTime1] = useState("");
  const [startTime2, setStartTime2] = useState("");
  const [endTime2, setEndTime2] = useState("");
  const [startView1, setStartView1] = useState(false);
  const [endView1, setEndView1] = useState(false);
  const [startView2, setStartView2] = useState(false);
  const [endView2, setEndView2] = useState(false);
  const [cuisines, setCuisines] = useState([]);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({ mode: "onChange" });
  const navigate = useNavigate();

  const watchedFields = watch();

  const isFormIncomplete =
    isFormReady &&
    (!watchedFields.vendor_name ||
      !watchedFields.shop_name ||
      !watchedFields.shift1_start ||
      !watchedFields.shift1_close ||
      !watchedFields.street ||
      !watchedFields.city ||
      !watchedFields.state ||
      !watchedFields.pincode ||
      selectedCuisineIds.length === 0);
  console.log("Address", selectedAddress);
  useEffect(() => {
    const fetchCuisines = async () => {
      const { data, error } = await supabase
        .from("item_category")
        .select("c_id, name");

      if (error) {
        console.error("Error fetching cuisines:", error.message);
      } else {
        setCuisines(data || []);
      }
    };

    fetchCuisines();
  }, []);
  console.log("cuisine", cuisines);
  const handleCurrentLocation = async () => {
    setWaitLoading(true);
    const toastId = toast.loading("Getting current Location");

    try {
      const { success, error: locError } = await getCurrentLocation(
        ({ lat, lng }) => {
          // Prevent unnecessary state update
          setPosition({ lat, lng });
          setLocation({ lat, lng });
          setIsLocationUpdated(true);
        },
        setErr,
        setSelectedAddress
      );

      toast.dismiss(toastId);

      if (!success || locError) {
        console.log("location returned", locError);
        return;
      }

      setLocationError(false);
      console.log("✅ Current location fetched");
      setWaitLoading(false);
    } catch (err) {
      toast.dismiss(toastId);
      console.error("❌ Location Error:", err);
    }
  };

  useEffect(() => {
    if (!vendorId) return;

    async function fetchVendor() {
      setLoading(true);
      const { data, error } = await supabase
        .from("vendor_request")
        .select("*")
        .eq("v_id", vendorId)
        .single();

      if (error) {
        console.error("Error fetching vendor:", error.message);
      } else if (data) {
        console.log("data", data);
        reset({
          vendor_name: data.v_name || "",
          shop_name: data.shop_name || "",
          shift1_start: data.shift1_opening_time || "",
          shift1_close: data.shift1_closing_time || "",
          shift2_start: data.shift2_opening_time || "",
          shift2_close: data.shift2_closing_time || "",
          street: data.street || "",
          city: data.city || "",
          state: data.state || "",
          pincode: data.pincode || "",
          note: data.note_from_vendor === 'NA' ? '' : data.note_from_vendor || '',
        });
        if (data.latitude && data.longitude) {
          const loc = {
            lat: Number(data.latitude),
            lng: Number(data.longitude),
          };
          setPosition(loc);
          setLocation(loc); // 👈 Important for form comparison and submit
          setSelectedAddress(loc);
          console.log("Long,lat", data?.longitude, data?.latitude);
        }

        // ✅ Set time values to states
        setStartTime1(data.shift1_opening_time || "");
        setEndTime1(data.shift1_closing_time || "");
        setStartTime2(data.shift2_opening_time || "");
        setEndTime2(data.shift2_closing_time || "");

        setValue("shift1_start", data.shift1_opening_time || "");
        setValue("shift1_close", data.shift1_closing_time || "");
        setValue("shift2_start", data.shift2_opening_time || "");
        setValue("shift2_close", data.shift2_closing_time || "");

        setBannerUrl(data.banner_url || "");
        setVideoUrl(data.video_url || "");
        setQrUrl(data.payment_url || "");
        setSelectedCuisineIds(data.categories_available || []);

        setInitialFormState({
          vendor_name: data.v_name || "",
          shop_name: data.shop_name || "",
          shift1_start: data.shift1_opening_time || "",
          shift1_close: data.shift1_closing_time || "",
          shift2_start: data.shift2_opening_time || "",
          shift2_close: data.shift2_closing_time || "",
          street: data.street || "",
          city: data.city || "",
          state: data.state || "",
          pincode: data.pincode || "",
          note: data.note_from_vendor === 'NA' ? '' : data.note_from_vendor || '',
          cuisines: data.categories_available || [],
          banner: data.banner_url || "",
          video: data.video_url || "",
          qr: data.payment_url || "",
          longitude: data.longitude || "",
          latitude: data.latitude || "",
        });

        setIsFormReady(true);
      }
      setLoading(false);
    }

    fetchVendor();
  }, [vendorId, reset]);

  useEffect(() => {
    console.log(
      "📍 Checking lat/lng:",
      initialFormState?.latitude,
      initialFormState?.longitude
    );

    const fetchReadableAddress = async () => {
      if (initialFormState.latitude && initialFormState.longitude) {
        console.log("📦 Coordinates found, fetching address...");
        const response = await getAddressFromLatLng(
          initialFormState.latitude,
          initialFormState.longitude
        );
        const addressData = response?.results?.[0];
        console.log("addressData", addressData);

        if (addressData) {
          const components = addressData.address_components;

          const getComponent = (type) =>
            components.find((c) => c.types.includes(type))?.long_name || "";

          // ✅ Extract parts
          const area =
            getComponent("sublocality_level_1") || getComponent("locality");
          const city =
            getComponent("locality") ||
            getComponent("administrative_area_level_2");
          const state = getComponent("administrative_area_level_1");
          const pincode = getComponent("postal_code");
          const formatted = addressData.formatted_address;

          // ✅ More accurate landmark like "Fazalganj Industrial Estate"
          const landmark =
            getComponent("neighborhood") ||
            getComponent("premise") ||
            getComponent("sublocality_level_2") ||
            getComponent("point_of_interest") ||
            getComponent("establishment");

          const addressToSet = {
            area,
            landmark,
            city,
            state,
            pincode,
            full: formatted,
            lat: initialFormState?.latitude,
            long: initialFormState?.longitude,
          };

          // setFetchedAddress(addressToSet);
          setSelectedAddress(addressToSet);

          console.log("✅ fetchedAddress:", addressToSet);
        } else {
          console.log("⚠️ No address data found");
        }
      } else {
        console.log("❌ Latitude or Longitude missing");
      }
    };

    fetchReadableAddress();
  }, [initialFormState?.latitude, initialFormState?.longitude]);

  const isChanged = useMemo(() => {
    if (!initialFormState) return false;

    const areCuisinesSame = (() => {
      const a = [...selectedCuisineIds].map(String).sort();
      const b = [...(initialFormState.cuisines || [])].map(String).sort();

      if (a.length !== b.length) return false;
      return a.every((val, index) => val === b[index]);
    })();

    console.log("selectedAddresssssss", selectedAddress);
    const isLocationSame =
      selectedAddress?.lat != null && selectedAddress?.long != null
        ? String(initialFormState?.latitude) === String(selectedAddress?.lat) &&
          String(initialFormState?.longitude) === String(selectedAddress?.long)
        : true;

    console.log(
      "initial lat/lng:",
      initialFormState.latitude,
      initialFormState.longitude
    );
    console.log(
      "current lat/lng:",
      selectedAddress?.lat,
      selectedAddress?.long
    );
    console.log(location);

    return (
      watchedFields.vendor_name !== initialFormState.vendor_name ||
      watchedFields.shop_name !== initialFormState.shop_name ||
      watchedFields.shift1_start !== initialFormState.shift1_start ||
      watchedFields.shift1_close !== initialFormState.shift1_close ||
      watchedFields.shift2_start !== initialFormState.shift2_start ||
      watchedFields.shift2_close !== initialFormState.shift2_close ||
      watchedFields.street !== initialFormState.street ||
      watchedFields.city !== initialFormState.city ||
      watchedFields.state !== initialFormState.state ||
      watchedFields.pincode !== initialFormState.pincode ||
      watchedFields.note !== initialFormState.note ||
      bannerUrl !== initialFormState.banner ||
      videoUrl !== initialFormState.video ||
      qrUrl !== initialFormState.qr ||
      !areCuisinesSame ||
      !isLocationSame // ✅ Location check added
    );
  }, [
    watchedFields,
    selectedCuisineIds,
    bannerUrl,
    videoUrl,
    qrUrl,
    selectedAddress,
    initialFormState,
  ]);

  const uploadFile = async (file, bucketName) => {
    if (!file) return null;

    const fileExt = file?.name?.split(".")?.pop();
    const filePath = `${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (error) {
      console.error("Error uploading file:", error?.message);
      toast.error("Error uploading file");
      throw new Error(error?.message); // Throw error to stop further processing
    }

    const { data: urlData, error: urlError } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    if (urlError) {
      console.error("Error getting public URL:", urlError?.message);
      throw new Error(urlError?.message); // Throw error to stop further processing
    }

    return urlData?.publicUrl;
  };

  console.log(cuisines, "cusine");
const formRef = useRef();
  const onSubmit = async (formData) => {
    if (!session?.user?.id) return alert("User not logged in");
  
    if (isFormIncomplete) {
      toast.error("Please fill all required fields.");
      return;
    }
  
    if (!isChanged) {
      toast.error("No changes made.");
      return;
    }
  
    setLoading(true);
  
    try {
      const [uploadedVideoUrl, uploadedBannerUrl, uploadedQrUrl] =
        await Promise.all([
          videoFile ? uploadFile(videoFile, BUCKET_NAMES.VIDEO) : videoUrl,
          bannerFile ? uploadFile(bannerFile, BUCKET_NAMES.BANNER) : bannerUrl,
          qrFile ? uploadFile(qrFile, BUCKET_NAMES.PAYMENT) : qrUrl,
        ]);
  
      if (bannerFile) setBannerUrl(uploadedBannerUrl);
      if (videoFile) setVideoUrl(uploadedVideoUrl);
      if (qrFile) setQrUrl(uploadedQrUrl);
  
      const insertData = {
        v_name: formData?.vendor_name,
        shop_name: formData?.shop_name,
        shift1_opening_time: formData?.shift1_start,
        shift1_closing_time: formData?.shift1_close,
        shift2_opening_time: formData?.shift2_start,
        shift2_closing_time: formData?.shift2_close,
        street: formData?.street,
        city: formData?.city,
        state: formData?.state,
        pincode: formData.pincode,
        note_from_vendor: formData?.note || "",
        categories_available: selectedCuisineIds,
        banner_url: uploadedBannerUrl,
        video_url: uploadedVideoUrl,
        payment_url: uploadedQrUrl,
        latitude: selectedAddress?.lat || null,
        longitude: selectedAddress?.long || null,
        v_id: vendorId,
        u_id: vendorProfile?.u_id,
        updated_at: new Date(),
      };
  
      const { error } = await supabase
        .from(SUPABASE_TABLES.VENDOR)
        .upsert(insertData, { onConflict: "v_id" });
  
        if (error) {
          console.error("❌ Supabase error:", error);
          toast.error("Update Fail");
        } else {
          toast.success("Profile Updated Successfully");
        
          // ✅ 1. Log only if admin is acting on another vendor
          if (selectedVendorId && selectedVendorId !== vendorProfile?.v_id) {
            const { data: { user: currentUser } } = await supabase.auth.getUser();
        
            const newState = {
              vendor_name: formData?.vendor_name,
              shop_name: formData?.shop_name,
              shift1_start: formData?.shift1_start,
              shift1_close: formData?.shift1_close,
              shift2_start: formData?.shift2_start,
              shift2_close: formData?.shift2_close,
              street: formData?.street,
              city: formData?.city,
              state: formData?.state,
              pincode: formData.pincode,
              note: formData?.note || '',
              cuisines: selectedCuisineIds,
              banner: uploadedBannerUrl,
              video: uploadedVideoUrl,
              qr: uploadedQrUrl,
              longitude: selectedAddress?.long || '',
              latitude: selectedAddress?.lat || '',
            };
        
            const changes = getChangedFields(initialFormState, newState);
            const description = `Vendor profile updated for vendor ID ${selectedVendorId}. Changes: ${generateChangeDescription(changes)}`;
        
            await supabase.from("admin_logs").insert([
              {
                log_id: crypto.randomUUID(),
                admin_id: currentUser.id,
                title: "Vendor Profile Updated",
                description,
                timestamp: new Date(),
              },
            ]);
          }
        
          // ✅ 2. Refresh the vendor profile after update
          await refreshVendorProfile();
          navigate("/home");
        }
        
    } catch (err) {
      console.error("Upload failed:", err.message);
      toast.error("Upload failed");
    }
  
    setLoading(false);
  };
  

  const bannerInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const qrInputRef = useRef(null);

  // Helper to handle file selection and create preview URL
  console.log("🍜 All cuisines:", cuisines); // should contain c_id and name
  console.log("✅ Selected IDs:", selectedCuisineIds); // should be array of strings

  useEffect(() => {
    console.log("🍜 All cuisines:", cuisines);
    console.log("✅ Selected IDs:", selectedCuisineIds);

    if (cuisines.length > 0 && selectedCuisineIds.length > 0) {
      const cuisineIds = cuisines.map((c) => c?.c_id?.toString().trim());
      const selectedIds = selectedCuisineIds.map((id) => id?.toString().trim());

      console.log("🔍 All cuisine IDs:", cuisineIds);
      console.log("🔍 SelectedCuisineIds (trimmed):", selectedIds);

      const matched = cuisines.filter((cuisine) =>
        selectedIds.includes(cuisine?.c_id?.toString().trim())
      );

      console.log("✅ Matched Cuisines:", matched);

      setSelectedCuisines(matched);
    } else {
      console.warn("⛔ Skipped matching - one of the arrays is empty");
    }
  }, [selectedCuisineIds, cuisines]);

  console.log("selected", selectedCuisines);

  console.log({
    isFormIncomplete,
    isChanged,
    loading,
    vendor_name: watchedFields.vendor_name,
    shop_name: watchedFields.shop_name,
    selectedCuisineIds,
    selectedAddress,
    fetchedAddress,
  });

  return (
    <div className=" flex justify-center items-start ">
      {loading && <Loader />}

      {/* <div className="max-w-2xl shadow-lg rounded-2xl "> */}
        {/* <Header title="Profile" /> */}
        
      {/* </div> */}
      <div className="  max-w-2xl w-full md:mt-8 mt-3  pt-10  shadow-lg bg-gray-100  md:p-6 p-2">
          <div className="max-w-2xl mx-auto  ">
            <form ref={formRef} onSubmit={handleSubmit(onSubmit)} className="space-y-6 mb-24 ">
              {/* Basic Info */}
              <section className="flex flex-col rounded-lg bg-white border-gray-300 border-1 shadow-lg px-4 py-6">
                <h2 className="text-md md:text-2xl lg:text-2xl font-medium text-gray uppercase mb-4">
                  Basic Information
                </h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {/* Vendor Name */}
                  <div>
                    <label
                      className="block mb-1 font-medium text-sm text-gray-500"
                      htmlFor="vendor_name"
                    >
                      Vendor Name
                    </label>
                    <input
                      id="vendor_name"
                      {...register("vendor_name", nameValidation)}
                      placeholder="Vendor Name"
                      className={`input-field w-full rounded-lg text-gray-800 border p-2 ${
                        errors.vendor_name
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      onKeyDown={nameKeyDownHandler}
                      onBlur={InputCleanup}
                    />
                    {errors.vendor_name && (
                      <p className="text-red-500 text-sm">
                        {errors.vendor_name.message}
                      </p>
                    )}
                  </div>

                  {/* Shop Name */}
                  <div>
                    <label
                      className="block mb-1 font-medium text-sm text-gray-500"
                      htmlFor="shop_name"
                    >
                      Shop Name
                    </label>
                    <input
                      id="shop_name"
                      {...register("shop_name", shopNameValidation)}
                      placeholder="Shop Name"
                      className={`input-field w-full text-gray-800 rounded-lg border p-2 ${
                        errors.shop_name ? "border-red-500" : "border-gray-300"
                      }`}
                      onKeyDown={shopNameKeyDownHandler}
                      onBlur={InputCleanup}
                    />
                    {errors.shop_name && (
                      <p className="text-red-500 text-sm">
                        {errors.shop_name.message}
                      </p>
                    )}
                  </div>

                  {/* Shift 1 Start */}
                  <div className="grid md:grid-cols-2 gap-6  md:col-span-2">
                    {/* Shift 1 Start */}
                    <div>
                      <label
                        className="block mb-1 font-medium text-sm text-gray-500"
                        htmlFor="shift1_start"
                      >
                        Shift 1 Start
                      </label>
                      <input
                        type="text"
                        id="shift1_start"
                        value={
                          startTime1
                            ? moment(startTime1, "HH:mm:ss").format("hh:mm A")
                            : ""
                        }
                        onClick={() => setStartView1(true)}
                        readOnly
                        {...register("shift1_start", {
                          required: "Shift 1 Start is required",
                        })}
                        className={`input-field w-full rounded-lg text-gray-800 border p-2 ${
                          errors.shift1_start
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                      />
                      {errors.shift1_start && (
                        <p className="text-red-500 text-sm">
                          {errors.shift1_start.message}
                        </p>
                      )}
                      <TimeClockFull
                        isOpen={startView1}
                        onClose={() => setStartView1(false)}
                        onTimeSelect={(time) => {
                          console.log(time);
                          // time yaha moment object ho sakta hai ya string, usko moment me parse karo
                          // backend ke liye HH:mm:ss format me bhejo
                          const backendTime = time.format("HH:mm:ss");

                          setStartTime1(backendTime); // state me backend format me save karo (string)
                          setValue("shift1_start", backendTime); // form ke liye backend format (string)
                          setStartView1(false);
                        }}
                      />
                    </div>

                    {/* Shift 1 Close */}
                    <div>
                      <label
                        className="block mb-1 font-medium text-gray-500 text-sm"
                        htmlFor="shift1_close"
                      >
                        Shift 1 Close
                      </label>
                      <input
                        type="text"
                        id="shift1_close"
                        value={
                          endTime1
                            ? moment(endTime1, "HH:mm:ss").format("hh:mm A")
                            : ""
                        }
                        onClick={() => setEndView1(true)}
                        readOnly
                        {...register("shift1_close", {
                          required: "Shift 1 Close is required",
                        })}
                        className={`input-field w-full text-gray-800 rounded-lg border p-2 ${
                          errors.shift1_close
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                      />
                      {errors.shift1_close && (
                        <p className="text-red-500 text-sm">
                          {errors.shift1_close.message}
                        </p>
                      )}
                      <TimeClockFull
                        isOpen={endView1}
                        onClose={() => setEndView1(false)}
                        onTimeSelect={(time) => {
                          const backendTime = time.format("HH:mm:ss");
                          setEndTime1(backendTime);
                          setEndView1(false);
                          setValue("shift1_close", backendTime);
                        }}
                      />
                    </div>

                    {/* Shift 2 Start (Optional) */}
                    <div>
                      <label
                        className="block mb-1 font-medium text-gray-500 text-sm"
                        htmlFor="shift2_start"
                      >
                        Shift 2 Start (Optional)
                      </label>
                      <input
                        type="text"
                        id="shift2_start"
                        placeholder="e.g. 03:30 pm"

                        value={
                          startTime2 && startTime2 !== "00:00:00"
                            ? moment(startTime2, "HH:mm:ss").format("hh:mm A")
                            : ""
                        }
                        onClick={() => setStartView2(true)}
                        readOnly
                        {...register("shift2_start")}
                        className="input-field w-full text-gray-800 rounded-lg border p-2 border-gray-300"
                      />
                      <TimeClockFull
                        isOpen={startView2}
                        onClose={() => setStartView2(false)}
                        onTimeSelect={(time) => {
                          const backendTime = time.format("HH:mm:ss");
                          setStartTime2(backendTime);
                          setStartView2(false);
                          setValue("shift2_start", backendTime);
                        }}
                      />
                    </div>

                    {/* Shift 2 Close (Optional) */}
                    <div>
                      <label
                        className="block mb-1 font-medium text-gray-500 text-sm"
                        htmlFor="shift2_close"
                      >
                        Shift 2 Close (Optional)
                      </label>
                      <input
                        type="text"
                        id="shift2_close"
                        placeholder="e.g. 03:30 pm"
                        value={
                          endTime2 && endTime2 !== "00:00:00"
                            ? moment(endTime2, "HH:mm:ss").format("hh:mm A")
                            : ""
                        }
                        onClick={() => setEndView2(true)}
                        readOnly
                        {...register("shift2_close")}
                        className="input-field w-full rounded-lg text-gray-800 border p-2 border-gray-300"
                      />
                      <TimeClockFull
                        isOpen={endView2}
                        onClose={() => setEndView2(false)}
                        onTimeSelect={(time) => {
                          const backendTime = time.format("HH:mm:ss");
                          setEndTime2(backendTime);
                          setEndView2(false);
                          setValue("shift2_close", backendTime);
                        }}
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* Media Uploads */}
            <section className="flex flex-col rounded-lg  bg-white  border-gray-300 border-1 shadow-lg px-4 py-6">
            <h2 className="text-md md:text-2xl lg:text-2xl font-medium text-gray uppercase mb-4">
                  Proofs
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                  {/* Banner Image */}
                  <div className="flex flex-col items-center border-dashed rounded-lg border-primary border-2 p-4">
                    {bannerUrl ? (
                      <img
                        src={bannerUrl}
                        alt="banner"
                        className="h-32 w-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="h-32 w-full bg-gray-200 flex items-center justify-center text-gray-500 rounded">
                        No banner selected
                      </div>
                    )}
                    <button
                      type="button"
                      className="mt-3 w-full px-3 py-1 bg-gradient-to-br from-orange via-yellow cursor-pointer active:scale-95 to-orange text-white rounded-lg"
                      onClick={() => bannerInputRef.current.click()}
                    >
                      Select Banner
                    </button>
                    <input
                      type="file"
                      accept="image/*"
                      ref={bannerInputRef}
                      className="hidden"
                      onChange={(e) =>
                        handleFileChange(e, setBannerUrl, setBannerFile)
                      }
                    />
                  </div>

                  {/* Video */}
                  <div className="flex flex-col items-center p-4 border-dashed border-primary rounded-lg border-2">
                    {videoUrl ? (
                      <video
                        src={videoUrl}
                        controls
                        className="h-32 w-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="h-32 w-full bg-gray-200 flex items-center justify-center text-gray-500 rounded">
                        No video selected
                      </div>
                    )}
                    <button
                      type="button"
                      className="mt-3 w-full px-3 py-1 bg-gradient-to-br from-orange via-yellow cursor-pointer active:scale-95 to-orange text-white rounded-lg "
                      onClick={() => videoInputRef.current.click()}
                    >
                      Select Video
                    </button>
                    <input
                      type="file"
                      accept="video/*"
                      ref={videoInputRef}
                      className="hidden"
                      onChange={(e) =>
                        handleFileChange(e, setVideoUrl, setVideoFile)
                      }
                    />
                  </div>

                  {/* QR Code */}
                  <div className="flex flex-col items-center p-4 border-dashed border-primary rounded-lg border-2">
                    {qrUrl ? (
                      <img
                        src={qrUrl}
                        alt="QR code"
                        className="h-32 w-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="h-32 w-full bg-gray-200 flex items-center justify-center text-gray-500 rounded">
                        No QR selected
                      </div>
                    )}
                    <button
                      type="button"
                      className="mt-3 w-full px-3 py-1 bg-gradient-to-br from-orange via-yellow cursor-pointer active:scale-95 to-orange rounded-[8px] text-white "
                      onClick={() => qrInputRef.current.click()}
                    >
                      Select QR
                    </button>
                    <input
                      type="file"
                      accept="image/*"
                      ref={qrInputRef}
                      className="hidden"
                      onChange={(e) => handleFileChange(e, setQrUrl, setQrFile)}
                    />
                  </div>
                </div>
              </section>

              {/* Address Section */}
              <section className="flex flex-col rounded-lg  border-gray-300 border-1 bg-white shadow-lg px-4 py-6">
                <h2 className="text-md md:text-2xl lg:text-2xl font-medium text-gray uppercase mb-4">
                  Address
                </h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {/* Street with validation */}
                  <div>
                    <label
                      className="block mb-1 text-sm font-medium text-gray-500"
                      htmlFor="street"
                    >
                      House No. / Plot No. / Street Name
                    </label>
                    <input
                      id="street"
                      {...register("street", streetValidation)}
                      placeholder="House No. / Plot No. / Street Name"
                      className={`input-field w-full text-gray-800 rounded-lg border p-2 ${
                        errors.street ? "border-red-500" : "border-gray-300"
                      }`}
                      onKeyDown={streetKeyDown}
                      onInput={streetInputClean}
                    />
                    {errors.street && (
                      <p className="text-red-500 text-sm">
                        {errors.street.message}
                      </p>
                    )}
                  </div>

                  {/* City */}
                  <div>
                    <label
                      className="block mb-1 text-sm font-medium text-gray-500"
                      htmlFor="city"
                    >
                      City
                    </label>
                    <input
                      id="city"
                      {...register("city", { required: "City is required" })}
                      placeholder="City"
                      className={`input-field w-full rounded-lg text-gray-800 border p-2 ${
                        errors.city ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.city && (
                      <p className="text-red-500 text-sm">
                        {errors.city.message}
                      </p>
                    )}
                  </div>

                  {/* State */}
                  <div>
                    <label
                      className="block mb-1 text-sm font-medium text-gray-500"
                      htmlFor="state"
                    >
                      State
                    </label>
                    <input
                      id="state"
                      {...register("state", { required: "State is required" })}
                      placeholder="State"
                      className={`input-field w-full rounded-lg text-gray-800 border p-2 ${
                        errors.state ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.state && (
                      <p className="text-red-500 text-sm">
                        {errors.state.message}
                      </p>
                    )}
                  </div>

                  {/* Pincode */}
                  <div>
                    <label
                      className="block mb-1 text-sm font-medium text-gray-500"
                      htmlFor="pincode"
                    >
                      Pincode
                    </label>
                    <input
                      id="pincode"
                      {...register("pincode", {
                        required: "Pincode is required",
                      })}
                      placeholder="Pincode"
                      className={`input-field w-full rounded-lg text-gray-800 border p-2 ${
                        errors.pincode ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.pincode && (
                      <p className="text-red-500 text-sm">
                        {errors.pincode.message}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2  ">
                    <button
                      type="button"
                      onClick={() => setShowPopup(true)}
                      disabled={waitloading}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white transition 
                                        ${
                                          waitloading
                                            ? "bg-gray-400 cursor-not-allowed"
                                            : "bg-gradient-to-br from-orange via-yellow cursor-pointer active:scale-95 to-orange"
                                        }`}
                    >
                      <MdAddLocationAlt className="text-lg" />
                      {isLocationUpdated
  ? "Updated Location"
  : selectedAddress?.lat && selectedAddress?.long
  ? "Update Location"
  : "Current Location"}

                    </button>

                    {/* Popup */}
                    {showPopup && (
                      <LocationPopup
                        setLocation={(loc) => {
                          setLocation(loc);
                        setSelectedAddress(loc);
                        setIsLocationUpdated(true);
                          // setShowPopup(false);
                        }}
                        show={showPopup}
                        onClose={() => setShowPopup(false)}
                      />
                    )}

                    <button
                      type="button"
                      onClick={handleCurrentLocation}
                      disabled={waitloading}
                      className={`flex justify-center items-center rounded-full p-2 
                                        ${
                                          waitloading
                                            ? "bg-gray-400 cursor-not-allowed"
                                            : "bg-gradient-to-br from-orange via-yellow  active:scale-95 to-orange cursor-pointer"
                                        }`}
                    >
                      <MdGpsFixed className="text-2xl text-white" />
                    </button>
                  </div>
                  {selectedAddress || location || fetchedAddress ? (
                    <p className="mt-2 text-sm text-gray-700 bg-orange-200 w-fit p-1 px-2 rounded-lg">
                      <FiMapPin className="inline-block mr-1" />
                      {selectedAddress?.area && selectedAddress?.city
                        ? `${selectedAddress.area}, ${selectedAddress.city}`
                        : selectedAddress?.landmark
                        // ? selectedAddress.landmark
                        // : fetchedAddress?.area && fetchedAddress?.city
                        // ? `${fetchedAddress.area}, ${fetchedAddress.city}`
                      // : fetchedAddress?.landmark || "N/A"
                    }
                    </p>
                  ) : null}
                </div>
              </section>

              {/* Cuisines */}
              <ItemCategory
                value={selectedCuisineIds}
                onChange={setSelectedCuisineIds}
                error={
                  !selectedCuisineIds.length
                    ? "Please select at least one."
                    : ""
                }
              />

              {/* Additional Note */}
              <section className="flex flex-col rounded-lg  border-gray-300 border-1 bg-white shadow-lg px-4 py-6">
                <label
                  className="block mb-1 font-medium text-gray uppercase"
                  htmlFor="note"
                >
                  Additional Note (Optional)
                </label>
                <textarea
                  id="note"
                  {...register("note")}
                  rows={3}
                  placeholder="Write anything you want here..."
                  className="w-full rounded-lg text-gray-800 border border-gray-300 p-2"
                />
              </section>

              {/* Submit */}
              
          </form>
          
            {waitloading && <TransparentLoader/>}
        </div>
       
          <BottomNav />
      </div>
      <div className="max-w-2xl md:bottom-17 w-full bottom-13 fixed md:px-4 px-2">
          <button
                onClick={() => {
                  if (formRef.current) formRef.current.requestSubmit(); // ✅ triggers native submit
                }}
                disabled={loading}
                title={
                  loading
                    ? "Saving..."
                    : isFormIncomplete
                    ? "Please fill all required fields"
                    : !isChanged
                    ? "No changes made"
                    : ""
                }
                className={` md:mb-5 h-11 font-bold mb-8 px-4 w-full py-2 rounded-lg text-white ${
                  loading || isFormIncomplete || !isChanged
                    ? "bg-gray-400 cursor-not-allowed"
                    : " bg-gradient-to-br from-orange via-yellow cursor-pointer active:scale-95 to-orange"
                }`}
              >
                {loading ? "Saving..." : "Save Profile"}
              </button>
          </div>
    </div>
  );
}
