import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '../utils/supabaseClient';
import Loader from '../components/Loader';
import TimeClockFull from '../components/ClockPopup';
import dayjs from 'dayjs';
import moment from 'moment';

import {
    nameValidation,
    nameKeyDownHandler,
    InputCleanup,
    shopNameValidation,
    shopNameKeyDownHandler,
    streetValidation,
    streetKeyDown,
    streetInputClean,
} from '../utils/Validation';
import { useAuth } from '../context/authContext';
import MediaUploader from '../components/MediaUploader';

const cuisinesList = ['South Indian', 'North Indian', 'Chinese', 'Italian', 'Mexican'];

export default function VendorProfile() {
    const { session } = useAuth();
    const [loading, setLoading] = useState(false);
    const [bannerUrl, setBannerUrl] = useState('');
    const [videoUrl, setVideoUrl] = useState('');
    const [qrUrl, setQrUrl] = useState('');
    const [selectedCuisines, setSelectedCuisines] = useState([]);
    const [isFormReady, setIsFormReady] = useState(false);
    const [startTime1, setStartTime1] = useState(null);
        const [endTime1, setEndTime1] = useState(null);
        const [startTime2, setStartTime2] = useState(null);
        const [endTime2, setEndTime2] = useState(null);
        const [startView1, setStartView1] = useState(false);
        const [endView1, setEndView1] = useState(false);
        const [startView2, setStartView2] = useState(false);
        const [endView2, setEndView2] = useState(false);
    

    const {
        register,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors }
    } = useForm({ mode: 'onChange' });

    const watchedFields = watch();

    const isFormIncomplete = isFormReady && (
        !watchedFields.vendor_name ||
        !watchedFields.shop_name ||
        !watchedFields.shift1_start ||
        !watchedFields.shift1_close ||
        !watchedFields.street ||
        !watchedFields.city ||
        !watchedFields.state ||
        !watchedFields.pincode ||
        !watchedFields?.startTime1 ||
        !watchedFields?.endTime1 ||
        selectedCuisines.length === 0
    );

    useEffect(() => {
        if (!session?.user?.id) return;
        console.log('Fetching vendor data for user ID:', session.user.id);

        async function fetchVendor() {
            setLoading(true);
            const { data, error } = await supabase
                .from('vendor_request')
                .select('*')
                .eq('u_id', session.user.id)
                .single();

            if (error) {
                console.error('Error fetching vendor:', error.message);
            } else if (data) {
                console.log("🎯 Data from Supabase:", data);

                reset({
                    vendor_name: data.v_name || '',
                    shop_name: data.shop_name || '',
                    shift1_startTime1: data.shift1_opening_time || '',
                    shift1_endTime1: data.shift1_closing_time || '',
                    shift2_startTime2: data.shift2_opening_time || '',
                    shift2_endTime2: data.shift2_closing_time || '',
                    street: data.street || '',
                    city: data.city || '',
                    state: data.state || '',
                    pincode: data.pincode || '',
                    note: data.note_from_vendor || ''
                });

                if (data.shift1_opening_time) {
                    setStartTime1(data.shift1_opening_time);
                    setValue('shift1_start', data.shift1_opening_time);
                }
                if (data.shift1_closing_time) {
                    setEndTime1(data.shift1_closing_time);
                    setValue('shift1_close', data.shift1_closing_time);
                }
                if (data.shift2_opening_time) {
                    setStartTime2(data.shift2_opening_time);
                    setValue('shift2_start', data.shift2_opening_time);
                }
                if (data.shift2_closing_time) {
                    setEndTime2(data.shift2_closing_time);
                    setValue('shift2_close', data.shift2_closing_time);
                }

                setBannerUrl(data.banner_url || '');
                setVideoUrl(data.video_url || '');
                setQrUrl(data.payment_url || '');
                setSelectedCuisines(data.cuisines_available || []);
                setIsFormReady(true);
            }
            setLoading(false);
        }

        fetchVendor();
    }, [session?.user?.id, reset]);
    
    const handleUpload = async (file, folder, setter) => {
        if (!file) return;
        setLoading(true);
        const fileExt = file.name.split('.').pop();
        const filePath = `${Date.now()}.${fileExt}`;
        const { error } = await supabase.storage.from(folder).upload(filePath, file);

        if (error) {
            alert('Upload failed: ' + error.message);
        } else {
            const { data: publicUrl } = supabase.storage.from(folder).getPublicUrl(filePath);
            setter(publicUrl.publicUrl);
        }
        setLoading(false);
    };

    const onSubmit = async (formData) => {
        if (!session?.user?.id) return alert('User not logged in');

        setLoading(true);
        const insertData = {
            v_name: formData.vendor_name,
            shop_name: formData.shop_name,
            shift1_opening_time: formData.shift1_startTime1,
            shift1_closing_time: formData.shift1_endTime1,
            shift2_opening_time: formData.shift2_startTime2,
            shift2_closing_time: formData.shift2_endTime2,
            street: formData.street,
            city: formData.city,
            state: formData.state,
            pincode: formData.pincode,
            note_from_vendor: formData.note || '',
            cuisines_available: selectedCuisines,
            banner_url: bannerUrl,
            video_url: videoUrl,
            payment_url: qrUrl,
            u_id: session.user.id
        };

        const { error } = await supabase.from('vendor_request').upsert(insertData, { onConflict: 'u_id' });

        if (error) {
            alert('Save failed: ' + error.message);
        } else {
            alert('Profile updated successfully!');
        }
        setLoading(false);
    };

    const toggleCuisine = (cuisine) => {
        if (selectedCuisines.includes(cuisine)) {
            setSelectedCuisines(selectedCuisines.filter((c) => c !== cuisine));
        } else {
            setSelectedCuisines([...selectedCuisines, cuisine]);
        }
    };
    console.log(isFormIncomplete, isFormReady)
    console.log(loading)
    return (
        <div className="min-h-screen bg-gray-50 flex justify-center items-start py-8 px-4">
            {loading && <Loader />}
            <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-8">
                <h1 className="text-3xl font-bold text-indigo-700 mb-6">Vendor Profile</h1>

                <div className="max-w-2xl mx-auto px-4 py-8">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">

                        {/* Basic Info */}
                        <section>
                            <h2 className="text-xl font-semibold text-gray-700 mb-4">Basic Information</h2>
                            <div className="grid gap-6 md:grid-cols-2">

                                {/* Vendor Name */}
                                <div>
                                    <label className="block mb-1 font-semibold text-gray-700" htmlFor="vendor_name">Vendor Name</label>
                                    <input
                                        id="vendor_name"
                                        {...register('vendor_name', nameValidation)}
                                        placeholder="Vendor Name"
                                        className={`input-field w-full rounded-md border p-2 ${errors.vendor_name ? 'border-red-500' : 'border-gray-300'}`}
                                        onKeyDown={nameKeyDownHandler}
                                        onBlur={InputCleanup}
                                    />
                                    {errors.vendor_name && <p className="text-red-500 text-sm">{errors.vendor_name.message}</p>}
                                </div>

                                {/* Shop Name */}
                                <div>
                                    <label className="block mb-1 font-semibold text-gray-700" htmlFor="shop_name">Shop Name</label>
                                    <input
                                        id="shop_name"
                                        {...register('shop_name', shopNameValidation)}
                                        placeholder="Shop Name"
                                        className={`input-field w-full rounded-md border p-2 ${errors.shop_name ? 'border-red-500' : 'border-gray-300'}`}
                                        onKeyDown={shopNameKeyDownHandler}
                                        onBlur={InputCleanup}
                                    />
                                    {errors.shop_name && <p className="text-red-500 text-sm">{errors.shop_name.message}</p>}
                                </div>

                                {/* Shift 1 Start */}
                                <div>
                                    <label className="block mb-1 font-semibold text-gray-700" htmlFor="shift1_start">Shift 1 Start</label>
                                    <input
                                        type="text"
                                        id="shift1_start"
                                        value={startTime1 ? moment(startTime1, 'hh:mm A').format('hh:mm A') : ''}
                                        onClick={() => setStartView1(true)}
                                        readOnly
                                        {...register('shift1_start', { required: "Shift 1 Start is required" })}
                                        className={`input-field w-full rounded-md border p-2 ${errors.shift1_start ? 'border-red-500' : 'border-gray-300'}`}
                                    />
                                    {errors.shift1_start && <p className="text-red-500 text-sm">{errors.shift1_start.message}</p>}
                                    <TimeClockFull
                                                                                    isOpen={startView1}
                                                                                    onClose={() => setStartView1(false)}
                                                                                    onTimeSelect={(time) => {
                                                                                        setStartTime1(time);
                                                                                        setStartView1(false);
                                                                                        setValue('shift1_start', time);
                                                                                    }}
                                                                                />
                                </div>

                                {/* Shift 1 Close */}
                                <div>
                                    <label className="block mb-1 font-semibold text-gray-700" htmlFor="shift1_close">Shift 1 Close</label>
                                    <input
                                        type="text"
                                        id="shift1_close"
                                        value={endTime1 ? moment(endTime1, 'hh:mm A').format('hh:mm A') : ''}
                                        onClick={() => setEndView1(true)}
                                        readOnly
                                        {...register('shift1_close', { required: "Shift 1 Close is required" })}
                                        className={`input-field w-full rounded-md border p-2 ${errors.shift1_close ? 'border-red-500' : 'border-gray-300'}`}
                                    />
                                    {errors.shift1_close && <p className="text-red-500 text-sm">{errors.shift1_close.message}</p>}
                                    <TimeClockFull
                                        isOpen={endView1}
                                        onClose={() => setEndView1(false)}
                                        onTimeSelect={(time) => {
                                            setEndTime1(time);
                                            setEndView1(false);
                                            setValue('shift1_close', time);
                                        }}
                                    />
                                </div>

                                {/* Optional Shifts */}
                                <div>
                                    <label className="block mb-1 font-semibold text-gray-700" htmlFor="shift2_start">Shift 2 Start (Optional)</label>
                                    <input
                                        type="text"
                                        id="shift2_start"
                                        value={startTime2 ? moment(startTime2, 'HH:mm:ss').format('HH:mm') : ''}
                                        onClick={() => setStartView2(true)}
                                        readOnly
                                        {...register('shift2_start')}
                                        className="input-field w-full rounded-md border p-2 border-gray-300"
                                    />
                                </div>
                                <div>
 <TimeClockFull
                                                isOpen={startView2}
                                                onClose={() => setStartView2(false)}
                                        onTimeSelect={(time) => {
                                            const formattedTime = moment(time, 'hh:mm A').format('HH:mm:ss'); // always store as HH:mm:ss

                                                    setStartTime2(time);
                                                    setStartView2(false);
                                                    setValue('shift2_start', formattedTime);
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <label className="block mb-1 font-semibold text-gray-700" htmlFor="shift2_close">Shift 2 Close (Optional)</label>
                                            <input
                                                type="text"
                                                id="shift2_close"
                                        value={endTime2 ? moment(endTime2, 'hh:mm A').format('hh:mm A') : ''}
                                                onClick={() => setEndView2(true)}
                                                readOnly
                                                {...register('shift2_close')}
                                        className="input-field w-full rounded-md border p-2 border-gray-300"
                                    />
                                </div>
                                <TimeClockFull
                                    isOpen={endView2}
                                    onClose={() => setEndView2(false)}
                                    onTimeSelect={(time) => {
                                        setEndTime2(time);
                                        setEndView2(false);
                                        setValue('shift2_close', time);
                                    }}
                                />
                            </div>
                        </section>

                        {/* Media Uploads */}
                        <section>
                            <h2 className="text-xl font-semibold text-gray-700 mb-4">Media Uploads</h2>
                            <div className="grid gap-6 md:grid-cols-3">

                                {/* 📸 Banner Image */}
                                <MediaUploader
                                    label="Banner Image"
                                    accept="image/*"
                                    fileUrl={bannerUrl}
                                    type="image"
                                    borderColor="border-indigo-300"
                                    bgColor="bg-indigo-50"
                                    textColor="text-indigo-600"
                                    onChange={(file) => handleUpload(file, 'banner', setBannerUrl)}
                                />

                                {/* 🎞 Promo Video */}
                                <MediaUploader
                                    label="Promo Video"
                                    accept="video/*"
                                    fileUrl={videoUrl}
                                    type="video"
                                    borderColor="border-purple-400"
                                    bgColor="bg-purple-50"
                                    textColor="text-purple-600"
                                    onChange={(file) => handleUpload(file, 'video', setVideoUrl)}
                                />

                                {/* 💵 QR Code */}
                                <MediaUploader
                                    label="Payment QR Code"
                                    accept="image/*"
                                    fileUrl={qrUrl}
                                    type="image"
                                    borderColor="border-green-400"
                                    bgColor="bg-green-50"
                                    textColor="text-green-600"
                                    onChange={(file) => handleUpload(file, 'qr', setQrUrl)}
                                />
                            </div>
                        </section>


                        {/* Address Section */}
                        <section>
                            <h2 className="text-xl font-semibold text-gray-700 mb-4">Address</h2>
                            <div className="grid gap-6 md:grid-cols-2">
                                {/* Street with validation */}
                                <div>
                                    <label className="block mb-1 font-semibold text-gray-700" htmlFor="street">Street</label>
                                    <input
                                        id="street"
                                        {...register('street', streetValidation)}
                                        placeholder="Street"
                                        className={`input-field w-full rounded-md border p-2 ${errors.street ? 'border-red-500' : 'border-gray-300'}`}
                                        onKeyDown={streetKeyDown}
                                        onBlur={streetInputClean}
                                    />
                                    {errors.street && <p className="text-red-500 text-sm">{errors.street.message}</p>}
                                </div>

                                {/* City */}
                                <div>
                                    <label className="block mb-1 font-semibold text-gray-700" htmlFor="city">City</label>
                                    <input
                                        id="city"
                                        {...register('city', { required: "City is required" })}
                                        placeholder="City"
                                        className={`input-field w-full rounded-md border p-2 ${errors.city ? 'border-red-500' : 'border-gray-300'}`}
                                    />
                                    {errors.city && <p className="text-red-500 text-sm">{errors.city.message}</p>}
                                </div>

                                {/* State */}
                                <div>
                                    <label className="block mb-1 font-semibold text-gray-700" htmlFor="state">State</label>
                                    <input
                                        id="state"
                                        {...register('state', { required: "State is required" })}
                                        placeholder="State"
                                        className={`input-field w-full rounded-md border p-2 ${errors.state ? 'border-red-500' : 'border-gray-300'}`}
                                    />
                                    {errors.state && <p className="text-red-500 text-sm">{errors.state.message}</p>}
                                </div>

                                {/* Pincode */}
                                <div>
                                    <label className="block mb-1 font-semibold text-gray-700" htmlFor="pincode">Pincode</label>
                                    <input
                                        id="pincode"
                                        {...register('pincode', { required: "Pincode is required" })}
                                        placeholder="Pincode"
                                        className={`input-field w-full rounded-md border p-2 ${errors.pincode ? 'border-red-500' : 'border-gray-300'}`}
                                    />
                                    {errors.pincode && <p className="text-red-500 text-sm">{errors.pincode.message}</p>}
                                </div>
                            </div>
                        </section>

                        {/* Cuisines */}
                        <section>
                            <h2 className="text-xl font-semibold text-gray-700 mb-4">Available Cuisines</h2>
                            <div className="flex flex-wrap gap-3">
                                {cuisinesList.map((cuisine) => (
                                    <button
                                        key={cuisine}
                                        type="button"
                                        onClick={() => toggleCuisine(cuisine)}
                                        className={`px-4 py-2 rounded-full border transition ${selectedCuisines.includes(cuisine)
                                            ? 'bg-indigo-600 text-white border-indigo-600'
                                            : 'bg-white text-gray-700 border-gray-300'
                                            }`}
                                    >
                                        {cuisine}
                                    </button>
                                ))}
                            </div>
                        </section>

                        {/* Additional Note */}
                        <section>
                            <label className="block mb-1 font-semibold text-gray-700" htmlFor="note">Additional Note (Optional)</label>
                            <textarea
                                id="note"
                                {...register('note')}
                                rows={3}
                                placeholder="Write anything you want here..."
                                className="w-full rounded-md border border-gray-300 p-2"
                            />
                        </section>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={!isFormIncomplete}
                            className="w-full bg-indigo-700 text-white py-3 rounded-md font-semibold hover:bg-indigo-800 disabled:bg-indigo-300"
                        >
                            {loading ? 'Saving...' : 'Save Profile'}
                        </button>
                    </form>
                </div>

            </div>
        </div>
    );
}
