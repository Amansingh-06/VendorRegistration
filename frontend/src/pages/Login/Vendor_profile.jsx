import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from './../../context/authContext';
import { supabase } from '../../utils/supabaseClient';
import InputField from '../../components/InputField';
import FileUploadButton from '../../components/FileUploadButton';
import { Upload } from 'lucide-react';
import Header from '../../components/Header';
import Loader from '../../components/Loader';

function Vendorprofile() {
    const { session } = useAuth();
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm();

    const [bannerUrl, setBannerUrl] = useState('');
    const [videoUrl, setVideoUrl] = useState('');
    const [qrUrl, setQrUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [isFormIncomplete, setIsFormIncomplete] = useState(true);

    const handleUpload = async (file, folder, setter) => {
        if (!file) return;
        const fileExt = file.name.split('.').pop();
        const filePath = `${Date.now()}.${fileExt}`;
        const { data, error } = await supabase.storage.from(folder).upload(filePath, file);
        if (error) {
            alert('Upload failed');
        } else {
            const { data: publicUrl } = supabase.storage.from(folder).getPublicUrl(filePath);
            setter(publicUrl.publicUrl);
        }
    };

    const onSubmit = async (formData) => {
        if (!session?.user?.id) return alert("User not logged in");

        const insertData = {
            ...formData,
            u_id: session.user.id,
            cuisines: formData.cuisines?.split(',').map(str => str.trim()) || [],
            banner_url: bannerUrl,
            video_url: videoUrl,
            payment_qr_url: qrUrl
        };

        const { error } = await supabase
            .from('vendor_request')
            .upsert(insertData, { onConflict: 'u_id' });

        if (error) {
            console.error("Registration failed:", error.message);
            alert("Registration failed");
        } else {
            alert("Vendor registered successfully!");
            reset();
        }
    };

    return (
        <div className='flex justify-center items-center w-full min-h-screen bg-gray-100 md:px-4'>
            {loading && <Loader />}
            <div className='border border-gray-300 bg-white max-w-2xl rounded-lg shadow-lg'>
                <Header title='Profile' />
                <div className='md:p-6 p-2 rounded-lg shadow-lg'>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                        {/* Basic Info + Upload */}
                        <div className="bg-white p-6 shadow-lg rounded-lg space-y-6">
                            <h2 className="text-xl font-semibold text-gray-700">Basic Info</h2>
                            <div className="grid md:grid-cols-2 gap-4">
                                <InputField id="vendor_name" placeholder="Vendor Name" register={register} error={errors.vendor_name} />
                                <InputField id="shop_name" placeholder="Shop Name" register={register} error={errors.shop_name} />
                                <InputField id="shift1_start" placeholder="Shift 1 Start" register={register} error={errors.shift1_start} />
                                <InputField id="shift1_close" placeholder="Shift 1 Close" register={register} error={errors.shift1_close} />
                                <InputField id="shift2_start" placeholder="Shift 2 Start" register={register} error={errors.shift2_start} />
                                <InputField id="shift2_close" placeholder="Shift 2 Close" register={register} error={errors.shift2_close} />
                            </div>

                            <h2 className="text-xl font-semibold text-gray-700 pt-2">Upload Media</h2>
                            <div className="flex flex-wrap gap-6">
                                {/* Banner */}
                                <div className="space-y-2">
                                    <div className="border-2 border-dashed p-4 rounded-lg w-[160px] h-[100px] flex items-center justify-center bg-gray-50">
                                        {bannerUrl ? <img src={bannerUrl} alt="Banner" className="h-full object-cover" /> : <span className="text-gray-400">No Banner</span>}
                                    </div>
                                    <FileUploadButton
                                        label="Upload Banner"
                                        bgColor="bg-blue-600"
                                        Icon={Upload}
                                        accept="image/*"
                                        onChange={(e) => handleUpload(e.target.files[0], 'banner', setBannerUrl)}
                                        file={null}
                                        placeholder="Upload banner..."
                                    />
                                </div>

                                {/* Video */}
                                <div className="space-y-2">
                                    <div className="border-2 border-dashed p-4 rounded-lg w-[160px] h-[100px] flex items-center justify-center bg-gray-50">
                                        {videoUrl ? <video src={videoUrl} controls className="h-full" /> : <span className="text-gray-400">No Video</span>}
                                    </div>
                                    <FileUploadButton
                                        label="Upload Video"
                                        bgColor="bg-purple-600"
                                        Icon={Upload}
                                        accept="video/*"
                                        onChange={(e) => handleUpload(e.target.files[0], 'video', setVideoUrl)}
                                        file={null}
                                        placeholder="Upload video..."
                                    />
                                </div>

                                {/* QR */}
                                <div className="space-y-2">
                                    <div className="border-2 border-dashed p-4 rounded-lg w-[160px] h-[100px] flex items-center justify-center bg-gray-50">
                                        {qrUrl ? <img src={qrUrl} alt="QR" className="h-full object-cover" /> : <span className="text-gray-400">No QR</span>}
                                    </div>
                                    <FileUploadButton
                                        label="Upload QR"
                                        bgColor="bg-green-600"
                                        Icon={Upload}
                                        accept="image/*"
                                        onChange={(e) => handleUpload(e.target.files[0], 'qr', setQrUrl)}
                                        file={null}
                                        placeholder="Upload QR..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Address */}
                        <div className="bg-white p-6 shadow-lg rounded-lg space-y-4">
                            <h2 className="text-xl font-semibold text-gray-500">Address</h2>
                            <div className="grid md:grid-cols-2 gap-4">
                                <InputField id="street" placeholder="Street" register={register} error={errors.street} />
                                <InputField id="city" placeholder="City" register={register} error={errors.city} />
                                <InputField id="state" placeholder="State" register={register} error={errors.state} />
                                <InputField id="pincode" placeholder="Pincode" register={register} error={errors.pincode} />
                            </div>
                        </div>

                        {/* Cuisines */}
                        <div className="px-6 py-5 shadow-lg rounded-lg border border-gray-300 flex flex-col gap-6 bg-white">
                            <h1 className='md:text-2xl text-lg font-semibold text-gray-500 '>Available Cuisines</h1>
                            <div className="flex gap-6 flex-wrap ">
                                {['South Indian', 'North Indian', 'Chinese', 'Italian', 'Mexican'].map((cuisine, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id={cuisine}
                                            value={cuisine}
                                            {...register('cuisines', { required: 'Please select at least one cuisine' })}
                                            className="w-5 h-5 accent-orange text-white"
                                        />
                                        <label htmlFor={cuisine} className="text-gray-700 cursor-pointer">{cuisine}</label>
                                    </div>
                                ))}

                            </div>
                            {errors?.cuisines && <p className="text-red-500 text-sm">{errors?.cuisines?.message}</p>}

                        </div>

                        {/* Note */}
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
                        

                        
                            <button
                                type="button"
                                onClick={async () => {
                                    // const formValid = await trigger();           // React Hook Form validation
                                    // const customValid = validateCustomFields();  // Custom validations

                                    // if (formValid && customValid) {
                                    //     handleSubmit(onSubmit)();                   // Submit only if valid
                                    // }
                                    // Agar invalid hai to errors automatically show honge because of trigger()
                                }}
                                // disabled={isFormIncomplete}  <-- Remove disabled here, so user can click anytime
                                className={`py-3 rounded-lg w-full shadow-lg transition ${isFormIncomplete
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-primary hover:bg-indigo-800 text-white'
                                    }`}
                            >
                                {loading ? 'Editing profile..' : 'Edit profile'}
                            </button>
                        
                    </form>
                </div>

            </div>
        </div>

    );
}

export default Vendorprofile;
