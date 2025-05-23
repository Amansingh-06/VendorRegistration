import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaVideo, FaImage, FaUserAlt, FaStore, FaRegClock } from 'react-icons/fa';
import { MdAddLocationAlt, MdOutlineCloudUpload } from "react-icons/md";

import TimePicker from 'react-time-picker';
import 'react-time-picker/dist/TimePicker.css';
import 'react-clock/dist/Clock.css';
import { supabase } from './supabaseClient';
import LocationPopup from './LocationPopUP';
import Loader from './Loader';
import toast from 'react-hot-toast';
import TimeClockFull from './ClockPopup';

function VendorRegistration() {
    const [videoFile, setVideoFile] = useState(null);
    const [bannerFile, setBannerFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [startView, setStartView] = useState(false);
    const [endView, setEndView] = useState(false);
        const [startTime, setStartTime] = useState(null)
    const [endTime,setEndTime] = useState(null)

    const { register, handleSubmit, setValue, formState: { errors }, watch, reset } = useForm();

    const watchName = watch('name');
    const watchShopName = watch('shopName');
    const watchStreet = watch('street')
    const watchCity = watch('city')
    const watchState = watch('state')
    const watchPincode = watch('pincode')

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

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            // Upload files in parallel, if any upload fails, it throws and catch will handle
            const [videoUrl, bannerUrl] = await Promise.all([
                uploadFile(videoFile, 'videos'),
                uploadFile(bannerFile, 'banners'),
            ]);

            const shopData = {
                your_name: data.name,
                shop_name: data.shopName,
                street: data.street,
                city: data.city,
                state: data.state,
                pincode:data.pincode,
                start_at: startTime.format('hh:mm A'),
                close_at: endTime.format('hh:mm A'),
                cuisines: data.cuisines || [],
                video_url: videoUrl,
                banner_url: bannerUrl,
            };
            console.log(startTime.format('hh:mm A'), endTime.format('hh:mm A'))
            const { error } = await supabase.from('shops').insert([shopData]);

            if (error) {
                console.error('Insert Error:', error.message);
                toast.error("Failed to register vendor");
                return; // Stop execution on insert error
            }

            // Reset form and states only on success
            setVideoFile(null);
            setBannerFile(null);
            setStartTime(null);
            setEndTime(null);
            reset();
            toast.success("User registered successfully");
        } catch (err) {
            // Handles all upload errors and unexpected errors
            console.error('Unexpected Error:', err.message);
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };
    

    const isFormIncomplete = !watchName || !watchShopName || !watchStreet ||!watchCity ||!watchPincode || !watchState  || !bannerFile || loading;

    return (
        <div className="flex justify-center items-center w-full min-h-screen bg-gray-100 md:px-4">
            {loading && <Loader/>}
            <div className="border border-gray-300 bg-white w-full max-w-2xl md:p-8 p-2 rounded-lg shadow-lg">
                <h1 className="text-3xl font-bold mb-8 text-center text-primary">Vendor Registration</h1>

                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
                    {/* Card 1: Name, Shop Name, Timings, Upload */}
                    <div className="px-6 py-5 shadow-lg rounded-lg border border-gray-300  flex flex-col gap-8 bg-white ">
                        {/* Name & Shop Name */}
                        <div className="grid md:grid-cols-2 gap-4">
                            {/* Name */}
                            <div className="relative">
                                <FaUserAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-black" />
                                <input
                                    id="name"
                                    type="text"
                                    {...register('name', { required: 'Name is required' })}
                                    className="peer pl-10 pt-3 pb-3 w-full rounded border border-gray-300 focus:outline-none focus:orange placeholder-transparent"
                                    placeholder="Your Name"
                                />
                                <label htmlFor="name" className="absolute left-10 -top-2.5 text-sm bg-white text-black  transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-gray-500 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:font-semibold peer-not-placeholder-shown:font-semibold">
                                    Your Name
                                </label>
                            </div>

                            {/* Shop Name */}
                            <div className="relative">
                                <FaStore className="absolute left-3 top-1/2 -translate-y-1/2 text-black" />
                                <input
                                    id="shopname"
                                    type="text"
                                    {...register('shopName', { required: 'Shop name is required' })}
                                    className="peer pl-10 pt-3 pb-3 w-full rounded border border-gray-300 focus:outline-none focus:orange placeholder-transparent"
                                    placeholder="Shop Name"
                                />
                                <label htmlFor="shopname" className="absolute left-10 -top-2.5 text-sm bg-white text-black transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-gray-500 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:font-semibold peer-not-placeholder-shown:font-semibold">
                                    Shop Name
                                </label>
                            </div>
                        </div>

                        {/* Timings */}
                        <div className="flex flex-col md:flex-row md:gap-22 gap-4">
                            {/* Start Time Input */}
                            <div className="flex flex-col gap-1 ">
                                <label className="font-medium">Start At:</label>
                                <div className="relative w-[200px]">
                                    <input
                                        type="text"
                                        readOnly
                                        value={startTime ? startTime.format('hh:mm A') : ''}
                                        onClick={() => setStartView(true)}
                                        placeholder="Select Start Time"
                                        className="w-full py-2 pl-10 pr-3 border border-gray-300 rounded cursor-pointer bg-white placeholder:text-sm"
                                    />
                                    <FaRegClock
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-black cursor-pointer"
                                        onClick={() => setStartView(true)}
                                    />
                                </div>
                                {errors.startTime && (
                                    <p className="text-red-500 text-sm">{errors.startTime.message}</p>
                                )}
                                <TimeClockFull
                                    isOpen={startView}
                                    onClose={() => setStartView(false)}
                                    onTimeSelect={(time) => {
                                        setStartTime(time);
                                        setStartView(false); // Close popup
                                        setValue('startTime', time); // react-hook-form me set karna ho to
                                    }}
                                />
                            </div>

                            {/* Close Time Input */}
                            <div className="flex flex-col gap-1">
                                <label className="font-medium">Close At:</label>
                                <div className="relative w-[200px]">
                                    <input
                                        type="text"
                                        readOnly
                                        value={endTime ? endTime.format('hh:mm A') : ''}
                                        onClick={() => setEndView(true)}
                                        placeholder="Select Close Time"
                                        className="w-full py-2 pl-10 pr-3 border border-gray-300 rounded cursor-pointer bg-white placeholder:text-sm"
                                    />
                                    <FaRegClock
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-black cursor-pointer"
                                        onClick={() => setEndView(true)}
                                    />
                                </div>
                                {errors.endTime && (
                                    <p className="text-red-500 text-sm">{errors.endTime.message}</p>
                                )}
                                <TimeClockFull
                                    isOpen={endView}
                                    onClose={() => setEndView(false)}
                                    onTimeSelect={(time) => {
                                        setEndTime(time);
                                        setEndView(false);
                                        setValue('endTime', time);
                                    }}
                                />
                            </div>
                        </div>


                        {/* Uploads */}
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex items-center gap-3 flex-1 min-w-[180px]">
                                <label className="cursor-pointer bg-indigo text-white py-2 px-4 rounded-md flex items-center gap-2 transition">
                                    <MdOutlineCloudUpload />
                                Upload Video
                                    <input
                                        type="file"
                                        accept="video/*"
                                        onChange={(e) => setVideoFile(e.target.files[0])}
                                        className="hidden"
                                    />
                                </label>
                                <span className="text-sm text-gray-600 truncate max-w-[80px]" title={videoFile?.name}>
                                    {loading && videoFile ? 'Uploading...' : (videoFile ? videoFile.name : 'No video')}
                                </span>
                            </div>

                            <div className="flex items-center gap-3 flex-1 min-w-[180px]">
                                <label className="cursor-pointer bg-green text-white py-2 px-3 rounded-md flex items-center gap-2 transition">
                                    <MdOutlineCloudUpload />
                                Upload Banner
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setBannerFile(e.target.files[0])}
                                        className="hidden"
                                    />
                                </label>
                                <span className="text-sm text-gray-600 truncate max-w-[80px]" title={bannerFile?.name}>
                                    {loading && bannerFile ? 'Uploading...' : (bannerFile ? bannerFile.name : 'No banner')}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Address + Location */}
                    <div className="px-6 py-5 shadow-lg rounded-lg border border-gray-300 flex flex-col gap-8 bg-white">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {['street', 'city', 'state', 'pincode'].map((field) => (
                                <div key={field} className="relative">
                                    <input
                                        id={field}
                                        type="text"
                                        {...register(field, { required: `${field.charAt(0).toUpperCase() + field.slice(1)} is required` })}
                                        className="peer p-3 w-full border border-gray-300 rounded placeholder-transparent focus:outline-none focus:orange"
                                        placeholder={field}
                                    />
                                    <label htmlFor={field} className="absolute left-3 -top-2.5 text-sm bg-white text-black font-semibold transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-gray-500 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:font-semibold ">
                                        {field.charAt(0).toUpperCase() + field.slice(1)}
                                    </label>
                                    {errors[field] && <p className="text-red-500 text-sm">{errors[field].message}</p>}
                                </div>
                            ))}
                        </div>

                        <button
                            type="button"
                            onClick={() => setShowPopup(true)}
                            className="flex items-center gap-2 bg-blue text-white px-4 py-2 rounded transition w-max"
                        >
                            <MdAddLocationAlt />
                             Location
                        </button>
                        {showPopup && <LocationPopup onClose={() => setShowPopup(false)} />}
                    </div>

                    {/* Card 3: Cuisine */}
                    <div className="px-6 py-5 shadow-lg rounded-lg border border-gray-300 bg-white">
                        <p className="font-semibold text-lg text-gray-700 mb-3">Available Cuisine</p>
                        <div className="flex gap-6 flex-wrap">
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

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={isFormIncomplete}
                        className={`py-3 mt-4 rounded-lg shadow-lg transition ${isFormIncomplete ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary hover:bg-indigo-800 text-white'}`}
                    >
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>

            </div>
        </div>
    );
}

export default VendorRegistration;
