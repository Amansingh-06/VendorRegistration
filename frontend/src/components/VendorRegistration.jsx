import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaUserAlt, FaStore, FaRegClock } from 'react-icons/fa';
import { MdAddLocationAlt, MdGpsFixed } from "react-icons/md";
import { HiOutlineVideoCamera } from "react-icons/hi2";
import { IoImageOutline, IoQrCodeOutline } from "react-icons/io5";
import { FaRegUser } from "react-icons/fa";
import { AiOutlineShop } from "react-icons/ai";
import FileUploadButton from './FileUploadButton';
import {
    BUCKET_NAMES,
    DEFAULTS,
    FORM_FIELDS,
    SUPABASE_TABLES,
    TOAST_MESSAGES,
    TIME_FORMAT
} from '../utils/vendorConfig';




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

function VendorRegistration() {
    const [videoFile, setVideoFile] = useState(null);
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


    const { register, handleSubmit, setValue, formState: { errors }, watch, reset } = useForm({ mode: 'onChange' });

    const watchFields = {
        name: watch(FORM_FIELDS.NAME),
        shopName: watch(FORM_FIELDS.SHOP_NAME),
        street: watch(FORM_FIELDS.STREET),
        city: watch(FORM_FIELDS.CITY),
        state: watch(FORM_FIELDS.STATE),
        pincode: watch(FORM_FIELDS.PINCODE),
        cuisines: watch(FORM_FIELDS.CUISINES)
      };


    // File upload function
    const uploadFile = async (file, bucketName) => {
        if (!file) return null;

        const fileExt = file.name.split('.').pop();
        const filePath = `${Date.now()}.${fileExt}`;

        const { data, error } = await supabase.storage
            .from(bucketName)
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: true,
            });

        if (error) {
            console.error('Error uploading file:', error.message);
            toast.error("Error uploading file");
            throw new Error(error.message); // Throw error to stop further processing
        }

        const { data: urlData, error: urlError } = supabase.storage
            .from(bucketName)
            .getPublicUrl(filePath);

        if (urlError) {
            console.error('Error getting public URL:', urlError.message);
            throw new Error(urlError.message); // Throw error to stop further processing
        }

        return urlData.publicUrl;
    };

    const formatTime = (time) => time ? time.format(TIME_FORMAT) : DEFAULTS.TIME;

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            const [videoUrl, bannerUrl, paymentQRUrl] = await Promise.all([
                uploadFile(videoFile, BUCKET_NAMES.VIDEO),
                uploadFile(bannerFile, BUCKET_NAMES.BANNER),
                uploadFile(paymentFile, BUCKET_NAMES.PAYMENT)
            ]);

            const shopData = {
                your_name: data[FORM_FIELDS.NAME],
                shop_name: data[FORM_FIELDS.SHOP_NAME],
                street: data[FORM_FIELDS.STREET],
                city: data[FORM_FIELDS.CITY],
                state: data[FORM_FIELDS.STATE],
                pincode: data[FORM_FIELDS.PINCODE],
                Shift1_start_at: formatTime(startTime1),
                Shift1_close_at: formatTime(endTime1),
                Shift2_start_at: formatTime(startTime2),
                Shift2_close_at: formatTime(endTime2),
                cuisines: data[FORM_FIELDS.CUISINES] || [],
                video_url: videoUrl || DEFAULTS.VIDEO_URL,
                banner_url: bannerUrl || DEFAULTS.BANNER_URL,
                paymentsqr_url: paymentQRUrl,
                note_from_vendor: data[FORM_FIELDS.NOTE]?.trim() || DEFAULTS.NOTE
            };

            const { error } = await supabase.from(SUPABASE_TABLES.TABLE).insert([shopData]);

            if (error) {
                console.error('Insert Error:', error.message);
                toast.error(TOAST_MESSAGES.REGISTER_FAILED);
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

            toast.success(TOAST_MESSAGES.REGISTER_SUCCESS);
        } catch (err) {
            console.error('Unexpected Error:', err.message);
            toast.error(TOAST_MESSAGES.UNEXPECTED_ERROR);
        } finally {
            setLoading(false);
        }
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

    const isBannerOrVideoMissing = !bannerFile && !videoFile;

    const isFormIncomplete =
        !watchFields.name ||
        !watchFields.shopName ||
        !watchFields.street ||
        !watchFields.city ||
        !watchFields.state ||
        !watchFields.pincode ||
        !paymentFile ||
        !watchFields.cuisines ||
        watchFields.cuisines.length === 0 ||
        (!bannerFile && !videoFile) ||
        loading ||
        Object.keys(errors).length > 0;
    return (
        <div className="flex justify-center items-center w-full min-h-screen bg-gray-100 md:px-4">
            {loading && <Loader />}
            <div className="border border-gray-300 bg-white w-full max-w-2xl md:p-8 p-2 rounded-lg shadow-lg">
                <h1 className="text-3xl font-bold mb-8 md:text-left text-center text-yellow">Vendor Registration</h1>
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-7  py-4" noValidate>
                    {/* Card 1: Name, Shop Name, Timings, Upload */}
                    <div className="px-6 py-5 shadow-lg rounded-lg border border-gray-300  flex flex-col gap-6 bg-white ">
                        {/* Name & Shop Name */}
                        <h1 className='md:text-2xl text-lg font-semibold text-gray-500'>Basic Details</h1>
                        <div className=' flex flex-col gap-5'>
                            <div className="grid md:grid-cols-2 gap-4 ">
                                {/* Name */}
                                <div className="relative">
                                    {/* <FaUserAlt className="absolute left-3 top-4.5 text-black" /> */}
                                    <FaRegUser className="absolute left-3 top-4.5 text-black text-lg" />
                                    <input
                                        id="name"
                                        type="text"
                                        placeholder="Your Name"
                                        {...register("name", nameValidation)}
                                        onKeyDown={nameKeyDownHandler}
                                        onInput={InputCleanup}
                                        className="peer pl-10 pt-3 pb-3 w-full rounded border border-gray-300 focus:outline-none  focus:border-orange transition-all placeholder-transparent"
                                    />
                                    <label htmlFor="name" className="absolute left-10 -top-2 text-sm bg-white text-black  transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-gray-500 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:font-semibold peer-not-placeholder-shown:font-semibold">
                                        Your Name
                                    </label>
                                    {errors.name && (
                                        <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                                    )}
                                </div>

                                {/* Shop Name */}
                                <div className="relative">
                                    {/* <FaStore className="absolute left-3 top-4.5 text-black" /> */}
                                    <AiOutlineShop className="absolute left-3 top-4.5 text-black text-lg" />
                                    <input
                                        id="shopname"
                                        placeholder="Shop Name"
                                        {...register("shopName", shopNameValidation)}
                                        onKeyDown={shopNameKeyDownHandler}
                                        onInput={InputCleanup}
                                        className="peer pl-10 pt-3 pb-3 w-full rounded border border-gray-300 focus:outline-none  focus:border-orange transition-all placeholder-transparent"
                                    />
                                    <label htmlFor="shopname" className="absolute left-10 -top-2.5 text-sm bg-white text-black transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-gray-500 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:font-semibold peer-not-placeholder-shown:font-semibold">
                                        Shop Name
                                    </label>
                                    {errors.shopName && (
                                        <p className="text-red-500 text-sm mt-1">{errors.shopName.message}</p>
                                    )}

                                </div>
                            </div>

                            {/* Timings */}
                            {/* ===== Shift 1 ===== */}
                            <div>
                            <h2 className="text-lg font-semibold text-gray-700 mb-2">Shift 1</h2>

                            <div className="flex flex-col md:flex-row gap-4 mb-6">
                                {/* Start At */}
                                <div className="w-full">
                                    <div className="relative">
                                        <FaRegClock className="absolute left-3 top-4.5 text-black" />
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
                                            Start At
                                        </label>
                                    </div>
                                    {errors.startTime1 && <p className="text-red-500 text-sm mt-1">{errors.startTime1.message}</p>}
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
                                        <FaRegClock className="absolute left-3 top-4.5 text-black" />
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
                                            Close At
                                        </label>
                                    </div>
                                    {errors.endTime1 && <p className="text-red-500 text-sm mt-1">{errors.endTime1.message}</p>}
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
                            <h2 className="text-lg  font-semibold text-gray-700 mb-2">Shift 2</h2>
                            <div className="flex flex-col md:flex-row gap-4">
                                {/* Start At */}
                                <div className="w-full">
                                    <div className="relative">
                                        <FaRegClock className="absolute left-3 top-4.5 text-black" />
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
                                            Start At
                                        </label>
                                    </div>
                                    {errors.startTime2 && <p className="text-red-500 text-sm mt-1">{errors.startTime2.message}</p>}
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
                                        <FaRegClock className="absolute left-3 top-4.5 text-black" />
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
                                            Close At
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
                                    label="Upload Video"
                                    bgColor="bg-blue"
                                    Icon={HiOutlineVideoCamera}
                                    accept="video/*"
                                    onChange={(e) => setVideoFile(e.target.files[0])}
                                    file={videoFile}
                                    loading={loading}
                                />

                                <FileUploadButton
                                    label="Upload Banner"
                                    bgColor="bg-green"
                                    Icon={IoImageOutline}
                                    accept="image/*"
                                    onChange={(e) => setBannerFile(e.target.files[0])}
                                    file={bannerFile}
                                    loading={loading}
                                />

                                <FileUploadButton
                                    label="Upload QR"
                                    bgColor="bg-yellow"
                                    Icon={IoQrCodeOutline}
                                    accept="image/*"
                                    onChange={(e) => setPaymentFile(e.target.files[0])}
                                    file={paymentFile}
                                    loading={loading}
                                />
                            </div>
                        </div>
                    </div>
                    {/* Address */}
                    <div className="px-6 py-5 shadow-lg rounded-lg border border-gray-300 flex flex-col gap-6 bg-white">
                        <h1 className='md:text-2xl text-lg font-semibold text-gray-500'>Address & Location</h1>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                            {/* Street */}
                            <div className="relative">
                                <input
                                    id="street"
                                    type="text"
                                    {...register("street", streetValidation)}
                                    onKeyDown={streetKeyDown}
                                    onInput={streetInputClean}
                                    className="peer p-3 w-full border border-gray-300 rounded placeholder-transparent focus:outline-none  focus:border-orange transition-all"
                                    placeholder="Street"
                                />
                                <label htmlFor="street" className="absolute left-3 -top-2.5 text-sm bg-white text-black  transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-gray-500 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:font-semibold peer-not-placeholder-shown:font-semibold">
                                    Street
                                </label>
                                {errors.street && <p className="text-red-500 text-sm">{errors.street.message}</p>}
                            </div>

                            {/* City */}
                            <div className="relative">
                                <input
                                    id="city"
                                    type="text"
                                    {...register("city", { ...cityStateValidation, required: "City is required" })}
                                    onKeyDown={cityStateKeyDown}
                                    onInput={cityStateInputClean}
                                    className="peer p-3 w-full border border-gray-300 rounded placeholder-transparent focus:outline-none  focus:border-orange transition-all"
                                    placeholder="City"
                                />
                                <label htmlFor="city" className="absolute left-3 -top-2.5 text-sm bg-white text-black  transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-gray-500 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:font-semibold">
                                    City
                                </label>
                                {errors.city && <p className="text-red-500 text-sm">{errors.city.message}</p>}
                            </div>

                            {/* State */}
                            <div className="relative">
                                <input
                                    id="state"
                                    type="text"
                                    {...register("state", { ...cityStateValidation, required: "State is required" })}
                                    onKeyDown={cityStateKeyDown}
                                    onInput={cityStateInputClean}
                                    className="peer p-3 w-full border border-gray-300 rounded placeholder-transparent focus:outline-none  focus:border-orange transition-all"
                                    placeholder="State"
                                />
                                <label htmlFor="state" className="absolute left-3 -top-2.5 text-sm bg-white text-black  transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-gray-500 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:font-semibold">
                                    State
                                </label>
                                {errors.state && <p className="text-red-500 text-sm">{errors.state.message}</p>}
                            </div>

                            {/* Pincode */}
                            <div className="relative">
                                <input
                                    id="pincode"
                                    type="text"
                                    maxLength={6}
                                    inputMode="numeric"
                                    {...register("pincode", pincodeValidation)}
                                    onKeyDown={pincodeKeyDown}
                                    onInput={pincodeInputClean}
                                    className="peer p-3 w-full border border-gray-300 rounded placeholder-transparent focus:outline-none  focus:border-orange transition-all"
                                    placeholder="Pincode"
                                />
                                <label htmlFor="pincode" className="absolute left-3 -top-2.5 text-sm bg-white text-black  transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-gray-500 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:font-semibold">
                                    Pincode
                                </label>
                                {errors.pincode && <p className="text-red-500 text-sm">{errors.pincode.message}</p>}
                            </div>
                            {/* /* Location Button */}
                            <div className='flex items-center gap-5  '>
                                <button
                                    type="button"
                                    onClick={() => setShowPopup(true)

                                    }
                                    className="flex items-center gap-2 bg-blue text-white px-4 py-2 rounded-md hover:bg-blue-700 transition" >
                                    <MdAddLocationAlt className="text-lg" />
                                    Location
                                    {console.log(location)}
                                </button>
                                {showPopup && (
                                    <LocationPopup
                                        setLocation={setLocation}
                                        show={showPopup}
                                        onClose={() => setShowPopup(false)}
                                    />
                                )}
                                <button className='flex justify-center items-center rounded-full p-2 bg-teal '><MdGpsFixed className='text-2xl text-white' /></button>

                            </div>

                        </div>

                    </div>

                    {/* Card 3: Cuisine */}
                    <div className="px-6 py-5 shadow-lg rounded-lg border border-gray-300 flex flex-col gap-6 bg-white">
                        <h1 className='md:text-2xl text-lg font-semibold text-gray-500 '>Available Cuisines</h1>
                        <div className="flex gap-6 flex-wrap ">
                            {['South Indian', 'North Indian', 'Chinese', 'Italian', 'Mexican'].map((cuisine, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id={cuisine}
                                        value={cuisine}
                                        {...register('cuisines')}
                                        className="w-5 h-5 text-indigo-600"
                                    />
                                    <label htmlFor={cuisine} className="text-gray-700 cursor-pointer">{cuisine}</label>
                                </div>
                            ))}
                        </div>
                    </div>
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
                        type="submit"
                        disabled={isFormIncomplete}
                        className={`py-3  rounded-lg shadow-lg transition ${isFormIncomplete ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary hover:bg-indigo-800 text-white'}`}
                    >
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>

            </div>
        </div>
    );
}

export default VendorRegistration;
