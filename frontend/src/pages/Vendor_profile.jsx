import React, { useState, useEffect,useMemo,useRef } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '../utils/supabaseClient';
import Loader from '../components/Loader';
import TimeClockFull from '../components/ClockPopup';
import dayjs from 'dayjs';
import moment from 'moment';
import { BUCKET_NAMES } from '../utils/vendorConfig';

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
import Header from '../components/Header';
import BottomNav from '../components/Footer';

const cuisinesList = ['South Indian', 'North Indian', 'Chinese', 'Italian', 'Mexican'];


export default function VendorProfile() {
    const { session } = useAuth();
    const [loading, setLoading] = useState(false);
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
    const [startTime1, setStartTime1] = useState('');
    const [endTime1, setEndTime1] = useState('');
    const [startTime2, setStartTime2] = useState('');
    const [endTime2, setEndTime2] = useState('');
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
        selectedCuisines.length === 0
    );

    useEffect(() => {
        if (!session?.user?.id) return;

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
                reset({
                    vendor_name: data.v_name || '',
                    shop_name: data.shop_name || '',
                    shift1_start: data.shift1_opening_time || '',
                    shift1_close: data.shift1_closing_time || '',
                    shift2_start: data.shift2_opening_time || '',
                    shift2_close: data.shift2_closing_time || '',
                    street: data.street || '',
                    city: data.city || '',
                    state: data.state || '',
                    pincode: data.pincode || '',
                    note: data.note_from_vendor || ''
                });

                // ✅ Set time values to states
                setStartTime1(data.shift1_opening_time || '');
                setEndTime1(data.shift1_closing_time || '');
                setStartTime2(data.shift2_opening_time || '');
                setEndTime2(data.shift2_closing_time || '');

                setValue('shift1_start', data.shift1_opening_time || '');
                setValue('shift1_close', data.shift1_closing_time || '');
                setValue('shift2_start', data.shift2_opening_time || '');
                setValue('shift2_close', data.shift2_closing_time || '');

                setBannerUrl(data.banner_url || '');
                setVideoUrl(data.video_url || '');
                setQrUrl(data.payment_url || '');
                setSelectedCuisines(data.cuisines_available || []);

                setInitialFormState({
                    vendor_name: data.v_name || '',
                    shop_name: data.shop_name || '',
                    shift1_start: data.shift1_opening_time || '',
                    shift1_close: data.shift1_closing_time || '',
                    shift2_start: data.shift2_opening_time || '',
                    shift2_close: data.shift2_closing_time || '',
                    street: data.street || '',
                    city: data.city || '',
                    state: data.state || '',
                    pincode: data.pincode || '',
                    note: data.note_from_vendor || '',
                    cuisines: data.cuisines_available || [],
                    banner: data.banner_url || '',
                    video: data.video_url || '',
                    qr: data.payment_url || ''
                });

                setIsFormReady(true);
            }
            setLoading(false);
        }

        fetchVendor();
    }, [session?.user?.id, reset]);

    const isChanged = useMemo(() => {
        if (!initialFormState) return false;

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
            JSON.stringify(selectedCuisines) !== JSON.stringify(initialFormState.cuisines)
        );
    }, [watchedFields, selectedCuisines, bannerUrl, videoUrl, qrUrl, initialFormState]);

    const uploadFile = async (file, bucketName) => {
        if (!file) return null;

        const fileExt = file?.name?.split('.')?.pop();
        const filePath = `${Date.now()}.${fileExt}`;


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


    const onSubmit = async (formData) => {
        if (!session?.user?.id) return alert('User not logged in');

        setLoading(true);

        try {
            const [
                uploadedVideoUrl,
                uploadedBannerUrl,
                uploadedQrUrl
            ] = await Promise.all([
                videoFile ? uploadFile(videoFile, BUCKET_NAMES.VIDEO) : videoUrl,
                bannerFile ? uploadFile(bannerFile, BUCKET_NAMES.BANNER) : bannerUrl,
                qrFile ? uploadFile(qrFile, BUCKET_NAMES.PAYMENT) : qrUrl
            ]);

            // ✅ update preview URLs after upload
            if (bannerFile) setBannerUrl(uploadedBannerUrl);
            if (videoFile) setVideoUrl(uploadedVideoUrl);
            if (qrFile) setQrUrl(uploadedQrUrl);

            const insertData = {
                v_name: formData.vendor_name,
                shop_name: formData.shop_name,
                shift1_opening_time: formData.shift1_start,
                shift1_closing_time: formData.shift1_close,
                shift2_opening_time: formData.shift2_start,
                shift2_closing_time: formData.shift2_close,
                street: formData.street,
                city: formData.city,
                state: formData.state,
                pincode: formData.pincode,
                note_from_vendor: formData.note || '',
                cuisines_available: selectedCuisines,
                banner_url: uploadedBannerUrl,
                video_url: uploadedVideoUrl,
                payment_url: uploadedQrUrl,
                u_id: session.user.id
            };

            const { error } = await supabase
                .from('vendor_request')
                .upsert(insertData, { onConflict: 'u_id' });

            if (error) {
                alert('Save failed: ' + error.message);
            } else {
                alert('Profile updated successfully!');
            }
        } catch (err) {
            console.error('Upload failed:', err.message);
            alert('Upload failed: ' + err.message);
        }

        setLoading(false);
    };
    
    const bannerInputRef = useRef(null);
    const videoInputRef = useRef(null);
    const qrInputRef = useRef(null);

    // Helper to handle file selection and create preview URL
  

    const toggleCuisine = (cuisine) => {
        if (selectedCuisines.includes(cuisine)) {
            setSelectedCuisines(selectedCuisines.filter((c) => c !== cuisine));
        } else {
            setSelectedCuisines([...selectedCuisines, cuisine]);
        }
    };
    return (
        <div className="min-h-screen bg-gray-50 flex justify-center items-start py-8 px-4">
            {loading && <Loader />}
            
            <div className='max-w-2xl shadow-lg rounded-2xl space-y-6'>
                <Header title='Profile' />
                <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-8">

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
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Shift 1 Start */}
                                        <div>
                                            <label className="block mb-1 font-semibold text-gray-700" htmlFor="shift1_start">Shift 1 Start</label>
                                            <input
                                                type="text"
                                                id="shift1_start"
                                                value={startTime1 ? moment(startTime1, 'HH:mm:ss').format('hh:mm A') : ''}
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
                                                    const formattedTime = moment(time, 'hh:mm A').format('HH:mm:ss');
                                                    setStartTime1(formattedTime);
                                                    setStartView1(false);
                                                    setValue('shift1_start', formattedTime, { shouldDirty: true });
                                                }}
                                            />
                                        </div>

                                        {/* Shift 1 Close */}
                                        <div>
                                            <label className="block mb-1 font-semibold text-gray-700" htmlFor="shift1_close">Shift 1 Close</label>
                                            <input
                                                type="text"
                                                id="shift1_close"
                                                value={endTime1 ? moment(endTime1, 'HH:mm:ss').format('hh:mm A') : ''}
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
                                                    const formattedTime = moment(time, 'hh:mm A').format('HH:mm:ss');
                                                    setEndTime1(formattedTime);
                                                    setEndView1(false);
                                                    setValue('shift1_close', formattedTime, { shouldDirty: true });
                                                }}
                                            />
                                        </div>

                                        {/* Shift 2 Start (Optional) */}
                                        <div>
                                            <label className="block mb-1 font-semibold text-gray-700" htmlFor="shift2_start">Shift 2 Start (Optional)</label>
                                            <input
                                                type="text"
                                                id="shift2_start"
                                                value={startTime2 && startTime2 !== '00:00:00' ? moment(startTime2, 'HH:mm:ss').format('hh:mm A') : ''}
                                                onClick={() => setStartView2(true)}
                                                readOnly
                                                {...register('shift2_start')}
                                                className="input-field w-full rounded-md border p-2 border-gray-300"
                                            />
                                            <TimeClockFull
                                                isOpen={startView2}
                                                onClose={() => setStartView2(false)}
                                                onTimeSelect={(time) => {
                                                    const formattedTime = moment(time, 'hh:mm A').format('HH:mm:ss');
                                                    setStartTime2(formattedTime);
                                                    setStartView2(false);
                                                    setValue('shift2_start', formattedTime, { shouldDirty: true });
                                                }}
                                            />
                                        </div>

                                        {/* Shift 2 Close (Optional) */}
                                        <div>
                                            <label className="block mb-1 font-semibold text-gray-700" htmlFor="shift2_close">Shift 2 Close (Optional)</label>
                                            <input
                                                type="text"
                                                id="shift2_close"
                                                value={endTime2 && endTime2 !== '00:00:00' ? moment(endTime2, 'HH:mm:ss').format('hh:mm A') : ''}
                                                onClick={() => setEndView2(true)}
                                                readOnly
                                                {...register('shift2_close')}
                                                className="input-field w-full rounded-md border p-2 border-gray-300"
                                            />
                                            <TimeClockFull
                                                isOpen={endView2}
                                                onClose={() => setEndView2(false)}
                                                onTimeSelect={(time) => {
                                                    const formattedTime = moment(time, 'hh:mm A').format('HH:mm:ss');
                                                    setEndTime2(formattedTime);
                                                    setEndView2(false);
                                                    setValue('shift2_close', formattedTime, { shouldDirty: true });
                                                }}
                                            />
                                        </div>
                                    </div>

                                </div>
                            </section>

                            {/* Media Uploads */}
                            <section>
                                <div className="flex gap-6 justify-between items-start flex-wrap">
                                    {/* Banner Image */}
                                    <div className="w-32 flex flex-col items-center">
                                        {bannerUrl ? (
                                            <img
                                                src={bannerUrl}
                                                alt="banner"
                                                className="h-32 w-32 object-contain rounded"
                                            />
                                        ) : (
                                            <div className="h-32 w-32 bg-gray-200 flex items-center justify-center text-gray-500 rounded">
                                                No banner selected
                                            </div>
                                        )}
                                        <button
                                            type="button"
                                            className="mt-3 w-32 px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                                            onClick={() => bannerInputRef.current.click()}
                                        >
                                            Select Banner
                                        </button>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            ref={bannerInputRef}
                                            className="hidden"
                                            onChange={(e) => handleFileChange(e, setBannerUrl, setBannerFile)}
                                        />
                                    </div>

                                    {/* Video */}
                                    <div className="w-32 flex flex-col items-center">
                                        {videoUrl ? (
                                            <video
                                                src={videoUrl}
                                                controls
                                                className="h-32 w-32 object-contain rounded"
                                            />
                                        ) : (
                                            <div className="h-32 w-32 bg-gray-200 flex items-center justify-center text-gray-500 rounded">
                                                No video selected
                                            </div>
                                        )}
                                        <button
                                            type="button"
                                            className="mt-3 w-32 px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700"
                                            onClick={() => videoInputRef.current.click()}
                                        >
                                            Select Video
                                        </button>
                                        <input
                                            type="file"
                                            accept="video/*"
                                            ref={videoInputRef}
                                            className="hidden"
                                            onChange={(e) => handleFileChange(e, setVideoUrl, setVideoFile)}
                                        />
                                    </div>

                                    {/* QR Code */}
                                    <div className="w-32 flex flex-col items-center">
                                        {qrUrl ? (
                                            <img
                                                src={qrUrl}
                                                alt="QR code"
                                                className="h-32 w-32 object-contain rounded"
                                            />
                                        ) : (
                                            <div className="h-32 w-32 bg-gray-200 flex items-center justify-center text-gray-500 rounded">
                                                No QR selected
                                            </div>
                                        )}
                                        <button
                                            type="button"
                                            className="mt-3 w-32 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
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
                                disabled={loading || isFormIncomplete || !isChanged}
                                className={`mt-4 px-4 w-full py-2 rounded text-white ${loading || isFormIncomplete || !isChanged
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-indigo-600 hover:bg-indigo-700'
                                    }`}
                            >
                                {loading ? 'Saving...' : 'Save Profile'}
                            </button>

                        </form>
                    </div>
                    <BottomNav/>

                </div>

            </div>
        </div>
    );
}