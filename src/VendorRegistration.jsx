import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaVideo, FaImage, FaLocationArrow, FaUserAlt, FaStore,FaRegClock } from 'react-icons/fa';
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
    

    const isFormIncomplete = !watchName || !watchShopName || !watchStreet ||!watchCity ||!watchPincode || !watchState || !videoFile || !bannerFile || loading;

    return (
        <div className="flex justify-center items-center w-full min-h-screen bg-gray-100 md:px-4">
            {loading && <Loader/>}
            <div className="border border-gray-300 bg-white w-full max-w-2xl md:p-8 p-2 rounded-lg shadow-lg">
                <h1 className="text-3xl font-bold mb-8 text-center text-primary">Vendor Registration</h1>

                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3" noValidate>
                    {/* Name and Shop Name */}
                    <div className=' p-2 py-5 shadow-lg flex flex-col gap-3 rounded-lg  border-gray-300 border-1 '>

                        {/* Name & Shop Name Inputs with Floating Labels */}
                        <div className="flex flex-col gap-5">
                            {/* Name */}
                            <div className="relative w-full">
                                <FaUserAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-black" />
                                <input
                                    id='name'
                                    type="text"
                                    {...register('name', { required: 'Name is required' })}
                                    className="peer pl-10 pt-3  pb-3 w-full rounded border border-gray-300 focus:outline-none focus:border-indigo-500 placeholder-transparent"
                                    placeholder="Your Name"
                                />
                                <label htmlFor='name' className="absolute left-10 -top-2.5 text-black  bg-white text-sm transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:-top-2.5 peer-focus:text-sm peer-focus:font-semibold peer-not-placeholder-shown:font-semibold ">
                                    Your Name
                                </label>
                                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                            </div>

                            {/* Shop Name */}
                            <div className="relative w-full">
                                <FaStore className="absolute left-3 top-1/2 -translate-y-1/2 text-black" />
                                <input
                                    id='shopname'
                                    type="text"
                                    {...register('shopName', { required: 'Shop name is required' })}
                                    className="peer pl-10 pt-3 pb-3 w-full rounded border border-gray-300 focus:outline-none focus:border-indigo-500 placeholder-transparent"
                                    placeholder="Shop Name"
                                />
                                <label htmlFor='shopname' className="absolute left-10 -top-2.5 bg-white text-black text-sm transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:-top-2.5 peer-focus:text-sm peer-focus:font-semibold peer-not-placeholder-shown:font-semibold">
                                    Shop Name
                                </label>
                                {errors.shopName && <p className="text-red-500 text-sm mt-1">{errors.shopName.message}</p>}
                            </div>
                        </div>

                        {/* Address Subcategory */}
                        <div className="flex flex-col gap-5 mt-6">
                            {/* <p className="font-semibold text-lg text-gray-700">Complete Address</p> */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="relative">
                                    <input
                                        id='street'
                                        type="text"
                                        {...register('street', { required: 'Street is required' })}
                                        className="peer p-3 w-full border border-gray-300 rounded placeholder-transparent focus:outline-none focus:border-indigo-500"
                                        placeholder="Street Address"
                                    />
                                    <label htmlFor='street' className="absolute left-3 bg-white -top-2.5 text-black text-sm transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:-top-2.5 peer-focus:text-sm peer-focus:font-semibold peer-not-placeholder-shown:font-semibold">
                                        Street Address
                                    </label>
                                    {errors.street && <p className="text-red-500 text-sm mt-1">{errors.street.message}</p>}
                                </div>

                                <div className="relative">
                                    <input
                                        id='city'
                                        type="text"
                                        {...register('city', { required: 'City is required' })}
                                        className="peer p-3 w-full border border-gray-300 rounded placeholder-transparent focus:outline-none focus:border-indigo-500"
                                        placeholder="City"
                                    />
                                    <label htmlFor='city' className="absolute left-3 bg-white -top-2.5 text-black text-sm transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:-top-2.5  peer-focus:text-sm peer-focus:font-semibold peer-not-placeholder-shown:font-semibold">
                                        City
                                    </label>
                                    {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>}
                                </div>

                                <div className="relative">
                                    <input
                                        id='state'
                                        type="text"
                                        {...register('state', { required: 'State is required' })}
                                        className="peer p-3 w-full border border-gray-300 rounded placeholder-transparent focus:outline-none focus:border-indigo-500"
                                        placeholder="State"
                                    />
                                    <label htmlFor='state' className="absolute left-3 -top-2.5 bg-white text-black text-sm transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:-top-2.5 peer-focus:text-sm peer-focus:font-semibold peer-not-placeholder-shown:font-semibold">
                                        State
                                    </label>
                                    {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state.message}</p>}
                                </div>

                                <div className="relative">
                                    <input
                                        id='pincode'
                                        type="text"
                                        {...register('pincode', { required: 'Pincode is required' })}
                                        className="peer p-3 w-full border border-gray-300 rounded placeholder-transparent focus:outline-none focus:border-indigo-500"
                                        placeholder="Pincode"
                                    />
                                    <label htmlFor='pincode' className="absolute left-3 -top-2.5 text-black bg-white text-sm transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:-top-2.5 peer-focus:text-sm peer-focus:font-semibold peer-not-placeholder-shown:font-semibold">
                                        Pincode
                                    </label>
                                    {errors.pincode && <p className="text-red-500 text-sm mt-1">{errors.pincode.message}</p>}
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Location Button */}
                    <div className=' p-2 py-5 flex flex-col gap-5 shadow-lg  border-gray-300 border-1 rounded-lg'>
                    <div>
                        <button type="button"
                            onClick={()=>setShowPopup(true)}
                            className="flex items-center gap-2 bg-blue hover:bg-indigo text-white px-4 py-2 rounded transition">
                            <FaLocationArrow /> Select Location
                        </button>
                        {showPopup && <LocationPopup onClose={()=>setShowPopup(false)}/>}
                    </div>

                    {/* Timings */}
                    <div className="flex md:flex-row flex-wrap items-center gap-6 text-gray-700">
                        <div className="flex items-center gap-5">
                            <label className="font-medium text-lg">Start At:</label>
                                <FaRegClock
                                    className='text-2xl'
                                    onClick={() => setStartView(true)} />
                                {startTime && (
                                    <p className='text-sm'>Start At: {startTime.format('hh:mm A')}</p>
                                )}
                                {errors.startTime && <p className="text-red-500 text-sm">{errors.startTime.message}</p>}
                                <TimeClockFull
                                    isOpen={startView}
                                    onClose={() => setStartView(false)}
                                    onTimeSelect={(time) => setStartTime(time)}
                                />
                        </div>

                        <div className="flex items-center gap-5">
                            <label className="font-medium text-lg">Close At:</label>
                                <FaRegClock
                                    className='text-2xl -ml-1'
                                    onClick={() => setEndView(true)} />
                                {endTime && (
                                    <p className='text-sm'>Close At: { endTime.format('hh:mm A')}</p>
                                )}
                                {errors.endTime && <p className="text-red-500 text-sm">{errors.endTime.message}</p>}
                                <TimeClockFull
                                    isOpen={endView}
                                    onClose={() => setEndView(false)}
                                    onTimeSelect={(time) => setEndTime(time)}
                                />
                        </div>
                    </div>

                    {/* File Uploads */}
                    <div className="flex flex-col md:flex-row gap-6 mt-4">
                        <div className="flex items-center gap-3 flex-1 min-w-[180px]">
                            <label className="cursor-pointer bg-indigo hover:bg-indigo-700 text-white py-2 px-4 rounded-md flex items-center gap-2 transition">
                                <FaVideo /> Upload Video
                                <input
                                    type="file"
                                    accept="video/*"
                                    onChange={(e) => setVideoFile(e.target.files[0])}
                                    className="hidden"
                                />
                            </label>
                            <span
                                className="text-sm text-gray-600 truncate max-w-[100px] "
                                title={videoFile ? videoFile.name : 'No video chosen'}
                            >
                                {loading && videoFile ? 'Uploading video...' : (videoFile ? videoFile.name : 'No video chosen')}
                            </span>
                        </div>

                        <div className="flex items-center gap-3 flex-1 min-w-[180px]">
                            <label className="cursor-pointer bg-green hover:bg-green-700 text-white py-2 px-3 rounded-md flex items-center gap-2 transition">
                                <FaImage /> Upload Banner
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setBannerFile(e.target.files[0])}
                                    className="hidden"
                                />
                            </label>
                            <span
                                className="text-sm text-gray-600 truncate max-w-[100px]"
                                title={bannerFile ? bannerFile.name : 'No banner chosen'}
                            >
                                {loading && bannerFile ? 'Uploading banner...' : (bannerFile ? bannerFile.name : 'No banner chosen')}
                            </span>
                        </div>
                    </div>
                    </div>
                    <div className=' p-2 py-5 shadow-lg  border-gray-300 border-1 rounded-lg '>

                    {/* Cuisine */}
                    <div className="flex flex-col gap-3 -mt-2 ">
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
</div>
                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isFormIncomplete}
                        className={`py-3 mt-5  rounded-lg shadow-lg transition
              ${isFormIncomplete ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary hover:bg-indigo-800 text-white'}
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
