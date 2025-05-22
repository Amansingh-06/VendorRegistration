import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaVideo, FaImage, FaLocationArrow, FaUserAlt, FaStore } from 'react-icons/fa';
import TimePicker from 'react-time-picker';
import 'react-time-picker/dist/TimePicker.css';
import 'react-clock/dist/Clock.css';
import { supabase } from './supabaseClient';

function VendorRegistration() {
    const [videoFile, setVideoFile] = useState(null);
    const [bannerFile, setBannerFile] = useState(null);
    const [startTime, setStartTime] = useState('09:00');
    const [endTime, setEndTime] = useState('22:00');
    const [loading, setLoading] = useState(false);

    const { register, handleSubmit, setValue, formState: { errors }, watch } = useForm();

    const watchName = watch('name');
    const watchShopName = watch('shopName');
    const watchAddress = watch('address');

    // File upload function
    const uploadFile = async (file, bucketName) => {
        if (!file) return null;

        const filePath = `${Date.now()}_${file.name}`;

        const { data, error } = await supabase.storage
            .from(bucketName)
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false,
            });

        if (error) {
            console.error('Error uploading file:', error.message);
            return null;
        }

        const { data: urlData, error: urlError } = supabase.storage
            .from(bucketName)
            .getPublicUrl(filePath);

        if (urlError) {
            console.error('Error getting public URL:', urlError.message);
            return null;
        }

        return urlData.publicUrl;
    };

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            // Upload files
            const videoUrl = await uploadFile(videoFile, 'videos');
            const bannerUrl = await uploadFile(bannerFile, 'banners');

            const shopData = {
                your_name: data.name,
                shop_name: data.shopName,
                address: data.address,
                start_at: startTime,   // Ensure startTime is state or prop
                close_at: endTime,     // Ensure endTime is state or prop
                cuisines: data.cuisines ? data.cuisines.join(',') : null,
                video_url: videoUrl,
                banner_url: bannerUrl,
            };

            const { error } = await supabase.from('shops').insert([shopData]);

            if (error) {
                alert('Failed to register vendor: ' + error.message);
            } else {
                alert('Vendor registered successfully!');
                // Reset form and files after successful submission
                setVideoFile(null);
                setBannerFile(null);
                setStartTime('09:00');
                setEndTime('22:00');
            }
        } catch (err) {
            alert('Unexpected error: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const isFormIncomplete = !watchName || !watchShopName || !watchAddress || !videoFile || !bannerFile || loading;
    
    return (
        <div className="flex justify-center items-center w-full min-h-screen bg-gray-100 md:px-4">
            <div className="border border-gray-300 bg-white w-full max-w-2xl md:p-8 p-4 rounded-lg shadow-lg">
                <h1 className="text-3xl font-bold mb-8 text-center text-indigo-600">Vendor Registration</h1>

                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6" noValidate>
                    {/* Name and Shop Name */}
                    <div className="flex flex-col gap-5">
                        <div className="relative flex items-center">
                            <FaUserAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Your Name"
                                {...register('name', { required: 'Name is required' })}
                                className="pl-10 p-3 w-full rounded border border-gray-300 focus:outline-none focus:border-indigo-500 transition"
                            />
                        </div>
                        {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}

                        <div className="relative flex items-center">
                            <FaStore className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Shop Name"
                                {...register('shopName', { required: 'Shop name is required' })}
                                className="pl-10 p-3 w-full rounded border border-gray-300 focus:outline-none focus:border-indigo-500 transition"
                            />
                        </div>
                        {errors.shopName && <p className="text-red-500 text-sm">{errors.shopName.message}</p>}
                    </div>

                    {/* Address */}
                    <textarea
                        placeholder="Complete Address"
                        rows={4}
                        {...register('address', { required: 'Address is required' })}
                        className="p-3 w-full rounded border border-gray-300 resize-none focus:outline-none focus:border-indigo-500 transition"
                    ></textarea>
                    {errors.address && <p className="text-red-500 text-sm">{errors.address.message}</p>}

                    {/* Location Button */}
                    <div>
                        <button type="button" className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded transition">
                            <FaLocationArrow /> Select Location
                        </button>
                    </div>

                    {/* Timings */}
                    <div className="flex md:flex-row flex-wrap items-center gap-6 text-gray-700">
                        <div className="flex items-center gap-5">
                            <label className="font-medium text-sm">Start At:</label>
                            <TimePicker
                                onChange={(value) => {
                                    setStartTime(value);
                                    setValue('startTime', value);
                                }}
                                value={startTime}
                                disableClock
                                format="h:mm a"
                                className="border-gray-300! text-lg! w-36! focus:border-indigo-500! focus:outline-none!"
                            />
                            {errors.startTime && <p className="text-red-500 text-sm">{errors.startTime.message}</p>}
                        </div>

                        <div className="flex items-center gap-5">
                            <label className="font-medium text-sm">Close At:</label>
                            <TimePicker
                                onChange={(value) => {
                                    setEndTime(value);
                                    setValue('endTime', value);
                                }}
                                value={endTime}
                                disableClock
                                format="h:mm a"
                                className="border-gray-300! text-lg! w-36! focus:border-indigo-500! focus:outline-none!"
                            />
                            {errors.endTime && <p className="text-red-500 text-sm">{errors.endTime.message}</p>}
                        </div>
                    </div>

                    {/* File Uploads */}
                    <div className="flex flex-col md:flex-row gap-6 mt-4">
                        <div className="flex items-center gap-3 flex-1 min-w-[180px]">
                            <label className="cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-md flex items-center gap-2 transition">
                                <FaVideo /> Upload Video
                                <input
                                    type="file"
                                    accept="video/*"
                                    onChange={(e) => setVideoFile(e.target.files[0])}
                                    className="hidden"
                                />
                            </label>
                            <span
                                className="text-sm text-gray-600 truncate max-w-[150px]"
                                title={videoFile ? videoFile.name : 'No video chosen'}
                            >
                                {loading && videoFile ? 'Uploading video...' : (videoFile ? videoFile.name : 'No video chosen')}
                            </span>
                        </div>

                        <div className="flex items-center gap-3 flex-1 min-w-[180px]">
                            <label className="cursor-pointer bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-md flex items-center gap-2 transition">
                                <FaImage /> Upload Banner
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setBannerFile(e.target.files[0])}
                                    className="hidden"
                                />
                            </label>
                            <span
                                className="text-sm text-gray-600 truncate max-w-[150px]"
                                title={bannerFile ? bannerFile.name : 'No banner chosen'}
                            >
                                {loading && bannerFile ? 'Uploading banner...' : (bannerFile ? bannerFile.name : 'No banner chosen')}
                            </span>
                        </div>
                    </div>

                    {/* Cuisine */}
                    <div className="flex flex-col gap-3 mt-6">
                        <p className="font-semibold text-lg text-gray-700">Available Cuisine</p>
                        <div className="flex gap-6 flex-wrap">
                            {['South Indian', 'North Indian', 'Chinese', 'Italian', 'Mexican'].map((cuisine, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id={cuisine}
                                        value={cuisine}
                                        {...register('cuisines')}
                                        className="w-5 h-5 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <label htmlFor={cuisine} className="select-none cursor-pointer text-gray-700">
                                        {cuisine}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isFormIncomplete}
                        className={`py-3 mt-8 rounded transition
              ${isFormIncomplete ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-700 hover:bg-indigo-800 text-white'}
            `}
                    >
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default VendorRegistration;
