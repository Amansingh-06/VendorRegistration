import React, { useRef, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Upload, X } from 'lucide-react';
import { AiOutlinePlus } from 'react-icons/ai';
import { FaUtensils, FaTags, FaRupeeSign, FaHashtag, FaRegClock } from 'react-icons/fa';
import Header from '../components/Header';
import { GiKnifeFork } from 'react-icons/gi';
import { supabase } from '../utils/supabaseClient';
import { toast } from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';
import { FaLocationCrosshairs } from 'react-icons/fa6';
import { useAuth } from '../context/authContext';

import {
    InputCleanup,
    nameKeyDownHandler,
    nameValidation,
    priceKeyDownHandler,
    priceInputClean,
    priceValidation,
    preparationTimeInputClean,
    preparationTimeKeyDown,
    preparationTimeValidation,
    numberOnlyInputClean,
    numberOnlyKeyDownHandler,
    numberOnlyValidation,


} from '../utils/Validation';
import { SUPABASE_TABLES, MESSAGES,BUCKET_NAMES,ITEM_DEFAULTS,ITEM_FIELDS } from '../utils/vendorConfig';
import { formatToCapital } from '../utils/vendorConfig';
import Loader from '../components/Loader';

const AddEditItem = () => {
    const [categories, setCategories] = useState([]);
    const [newCategory, setNewCategory] = useState('');
    const [showCategoryInput, setShowCategoryInput] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const categoryInputRef = useRef(null);
    const { vendorProfile } = useAuth();

 
    const handleFileChange = (e) => {
        const file = e.target.files[0]; // Ye asli File object hai
        setPreviewImage(file);
      }

    useEffect(() => {
        const fetchCategories = async () => {
            const { data, error } = await supabase
                .from(SUPABASE_TABLES?.ITEM_CATEGORY)
                .select('*');
            if (error) {
                toast.error(MESSAGES?.FETCH_FAIL);
                console.error(error);
            } else {
                setCategories(data);
            }
        };
        fetchCategories();
    }, []);

    const handleAddCategory = async () => {
        const trimmed = newCategory.trim();
        if (!trimmed) return toast.error(MESSAGES.EMPTY_CATEGORY);

        // Case-insensitive check
        const { data: existing, error: checkError } = await supabase
            .from(SUPABASE_TABLES?.ITEM_CATEGORY)
            .select('*')
            .ilike('title', trimmed); // ilike => case-insensitive match

        if (checkError) {
            toast.error(MESSAGES?.CHECK_FAIL);
            console.error(checkError);
            return;
        }

        if (existing.length > 0) {
            toast.error(MESSAGES?.CATEGORY_EXISTS);
            return;
        }

        // Save exactly as user typed
        const { data, error } = await supabase
            .from(SUPABASE_TABLES?.ITEM_CATEGORY)
            .insert([
                {
                    cat_id: uuidv4(),     // ✅ add random UUID
                    title: trimmed  ,      // ✅ user input as-is
                    vendor_id: vendorProfile?.v_id // Add vendor_id if needed
                }
            ])
            .select();
    

        if (error) {
            toast.error(MESSAGES?.CATEGORY_ADD_FAIL);
            console.error(error);
            return;
        }

        toast.success(MESSAGES.CATEGORY_ADDED);
        setCategories([...categories, { ...data[0], title: data[0].title.toUpperCase() }]); // capitalize for UI
        setNewCategory('');
        setShowCategoryInput(false);
    };
    

    const {
        register,
        handleSubmit,
        setValue,
        trigger,
        setError,clearErrors,
        formState: { errors, isValid },
        reset
    } = useForm({ mode: 'onChange' });

    const uploadFile = async (file, bucketName) => {
        if (!file || !file.name) return null; // 👈 fixed here

        const fileExt = file.name.split('.').pop();
        const filePath = `${Date.now()}.${fileExt}`;

        const { data, error } = await supabase.storage
            .from(bucketName)
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: true,
            });

        if (error) {
            console.error('Error uploading file:', error?.message);
            toast.error(MESSAGES?.UPLOAD_ERROR);

            throw new Error(error?.message);
        }

        const { data: urlData, error: urlError } = supabase.storage
            .from(bucketName)
            .getPublicUrl(filePath);

        if (urlError) {
            console.error('Error getting public URL:', urlError?.message);
            toast.error(MESSAGES?.PUBLIC_URL_ERROR);

            throw new Error(urlError?.message);
        }

        return urlData?.publicUrl;
    };
    useEffect(() => {
        console.log("vendor",vendorProfile)
    },[])
    

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            const img_url = await uploadFile(previewImage, BUCKET_NAMES.ITEM_IMG);
           

            const finalData = {
                [ITEM_FIELDS.ID]: uuidv4(),
                [ITEM_FIELDS.NAME]: data?.itemName || ITEM_DEFAULTS?.NAME,
                [ITEM_FIELDS.CUISINE]: data?.cuisine || ITEM_DEFAULTS?.CUISINE,
                [ITEM_FIELDS.QUANTITY]: data?.quantity || ITEM_DEFAULTS?.QUANTITY,
                [ITEM_FIELDS.PRICE]: parseFloat(data?.price) || ITEM_DEFAULTS?.PRICE,
                [ITEM_FIELDS.PREP_TIME]: parseInt(data?.prepTime) || ITEM_DEFAULTS?.PREP_TIME,
                [ITEM_FIELDS.VEG]: data?.type === "veg",
                [ITEM_FIELDS.CATEGORY]: data?.category || ITEM_DEFAULTS?.CATEGORY,
                [ITEM_FIELDS.IMG_URL]: img_url || ITEM_DEFAULTS?.IMG_URL,
                [ITEM_FIELDS.VENDOR_ID]: vendorProfile?.v_id
              };``
             const { error } = await supabase.from(SUPABASE_TABLES.ITEM).insert([finalData]);

                        if (error) {
                            console.error('Insert Error:', error?.message);
                            toast.error(MESSAGES?.ITEM_INSERT_FAILED);
                            return;
                        }
            
                      
                        reset();
            
            console.log("Data inserted successfully");
            toast.success(MESSAGES?.ITEM_REGISTER_SUCCESS);
            setPreviewImage(null); // Reset preview image
            

            console.log("Final Data:", finalData);

        } catch (err) {
            console.error("Something went wrong:", err?.message);
            toast.error(MESSAGES?.UNEXPECTED_ERROR);

        } finally {
            setLoading(false);
        }
    };


    // 🔥 Extra handler for showing error manually
    const handleClick = async () => {
        const valid = await trigger();
        if (!valid) {
            console.log("Form has validation errors");
        }
  };
    return (
        <motion.form
            onSubmit={handleSubmit(onSubmit)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-2xl w-full mx-auto  bg-white rounded-2xl shadow-lg font-poppins "
            noValidate
        >
            {loading && <Loader />}
            <Header title="Add Item" />
            <div className='max-w-2xl w-full mx-auto px-6 py-8 bg-white rounded-2xl shadow-lg font-poppins space-y-8'>
                <div className="grid gap-8">
                    {/* Item Name */}
                    <div className=' w-full mx-auto px-6 py-8 bg-white rounded-2xl shadow-lg font-poppins space-y-8'>
                    <div className="relative">
                        <FaUtensils className="absolute left-3 top-4 text-black text-md" />
                        <input
                            id="itemName"
                            {...register('itemName', nameValidation)}
                            onKeyDown={nameKeyDownHandler}
                            onInput={InputCleanup}
                            type="text"
                            placeholder="Item Name"
                            className={`peer w-full pl-10 pr-3 py-3 rounded-md border ${errors?.itemName ? 'border-red' : 'border-gray-300'
                                } focus:outline-none focus:border-orange placeholder-transparent`}
                        />
                        <label
                            htmlFor="itemName"
                            className="absolute left-10 -top-2.5 text-sm bg-white text-black  transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-gray-500 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:font-semibold peer-not-placeholder-shown:font-semibold"
                        >
                            Item Name
                        </label>
                        {errors?.itemName && (
                            <p className="text-red text-sm mt-1">{errors?.itemName.message}</p>
                        )}
                    </div>

                  

                    {/* Quantity */}
                    <div className="relative">
                        <FaHashtag className="absolute left-3 top-4 text-black text-md" />
                        <input
                            id="quantity"
                            {...register('quantity', {
                                validate: (value) => {
                                    if (!value) return true; // allow empty
                                    if (!/^\d+$/.test(value)) return "Only digits allowed (no spaces or symbols)";
                                    return true;
                                }
                            })}
                            onKeyDown={numberOnlyKeyDownHandler}
                            onInput={numberOnlyInputClean}
                            type="number"
                            placeholder="Quantity (optional)"
                            className={`peer w-full pl-10 pr-3 py-3 rounded-md border ${errors.quantity ? 'border-red' : 'border-gray-300'
                                } focus:outline-none focus:border-orange placeholder-transparent`}
                        />

                        <label
                            htmlFor="quantity"
                            className="absolute left-10 -top-2.5 text-sm bg-white text-black  transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-gray-500 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:font-semibold peer-not-placeholder-shown:font-semibold"
                        >
                            Quantity (optional)
                        </label>
                        {errors.quantity && (
                            <p className="text-red text-sm mt-1">{errors.quantity.message}</p>
                        )}
                    </div>

                    {/* Price */}
                    <div className="relative">
                        <FaRupeeSign className="absolute left-3 top-4 text-black text-md" />
                        <input
                            id="price"
                            {...register('price', priceValidation)}
                            onKeyDown={priceKeyDownHandler}
                            onInput={priceInputClean}
                            type="text"
                            placeholder="Price"
                            className={`peer w-full pl-10 pr-3 py-3 rounded-md border ${errors?.price ? 'border-red' : 'border-gray-300'
                                } focus:outline-none focus:border-orange placeholder-transparent`}
                        />
                        <label
                            htmlFor="price"
                            className="absolute left-10 -top-2.5 text-sm bg-white text-black  transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-gray-500 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:font-semibold peer-not-placeholder-shown:font-semibold"
                        >
                            Price
                        </label>
                        {errors?.price && (
                            <p className="text-red text-sm mt-1">{errors?.price.message}</p>
                        )}
                    </div>

                    {/* Preparation Time */}
                    <div className="relative">
                        <FaRegClock className="absolute left-3 top-4 text-black text-md" />
                        <input
                            id="prepTime"
                            {...register('prepTime', numberOnlyValidation)}
                            onKeyDown={numberOnlyKeyDownHandler}
                            onInput={numberOnlyInputClean}
                            type="text"
                            placeholder="Preparation Time"
                            className={`peer w-full pl-10 pr-3 py-3 rounded-md border ${errors?.prepTime ? 'border-red-500' : 'border-gray-300'
                                } focus:outline-none focus:border-orange placeholder-transparent`}
                        />
                        <label
                            htmlFor="prepTime"
                            className="absolute left-10 -top-2.5 text-sm bg-white text-black  transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-gray-500 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:font-semibold peer-not-placeholder-shown:font-semibold"
                        >
                            Preparation Time(in min)
                        </label>
                        {errors?.prepTime && (
                            <p className="text-red text-sm mt-1">{errors?.prepTime.message}</p>
                        )}
                        </div>
                </div>
                <div className='px-6 py-8 bg-white rounded-2xl shadow-lg font-poppins space-y-8 flex flex-col gap-2'>
                    {/* Type */}
                        <div className="flex gap-6 ">
                            <label className="relative cursor-pointer">
                                <input
                                    type="radio"
                                    value="veg"
                                    {...register('type', { required: 'Please select type' })}
                                    className="peer sr-only"
                                />
                                <div className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 peer-checked:border-green-500 peer-checked:bg-green-50 transition">
                                    <div className="w-4 h-4 rounded-full border-2 border-green-500 peer-checked:bg-green-500 transition" />
                                    <span className="text-sm text-gray-700">Veg</span>
                                </div>
                            </label>

                            <label className="relative cursor-pointer">
                                <input
                                    type="radio"
                                    value="nonveg"
                                    {...register('type', { required: 'Please select type' })}
                                    className="peer sr-only"
                                />
                                <div className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 peer-checked:border-red-500 peer-checked:bg-red-50 transition">
                                    <div className="w-4 h-4 rounded-full border-2 border-red-500 peer-checked:bg-red-500 transition" />
                                    <span className="text-sm text-gray-700">Non-Veg</span>
                                </div>
                            </label>
                          
                        </div>
                        {errors.type && (
                            <p className="text-red-500 text-sm -mt-10">{errors?.type?.message}</p>
                        )}

                      

                    {/* Cuisine */}
                    <div className="relative">
                        <GiKnifeFork className="absolute left-3 top-4 text-black font-semibold text-md pointer-events-none" />
                        <select
                            {...register('cuisine', { required: 'Cuisine is required' })}
                            className={`w-full px-9 py-3 rounded-md border ${errors.cuisine ? 'border-red' : 'border-gray-300'
                                } text-black focus:outline-none focus:border-orange`}
                        >
                            <option value="">Select Cuisine</option>
                            <option value="Indian">Indian</option>
                            <option value="Chinese">Chinese</option>
                            <option value="Italian">Italian</option>
                        </select>
                        <label className="absolute left-9 -top-2.5 text-sm bg-white px-1 text-black font-semibold">
                            Cuisine
                        </label>
                        {errors?.cuisine && (
                            <p className="text-red text-sm mt-1">{errors?.cuisine?.message}</p>
                        )}
                    </div>

                    {/* Category with Add new */}
                    <div>
                        <label className="mb-1 block font-semibold text-black">Category</label>
                        <select
                            {...register('category', { required: 'Category is required' })}
                            className={`w-full px-4 py-3 border rounded-md text-black ${errors.category ? 'border-red' : 'border-gray-300'
                                } focus:outline-none focus:border-orange`}
                        >
                            <option value="">Select category</option>
                            {categories?.map((cat) => (
                                <option key={cat?.id} value={cat?.title?.toUpperCase()}>
                                    {cat?.title}
                                </option>
                            ))}
                        </select>
                        {errors?.category && (
                            <p className="text-red text-sm mt-1">{errors?.category?.message}</p>
                        )}

                        {showCategoryInput ? (
                            <div className="mt-3 space-y-2">
                                {/* Input and buttons wrapper */}
                                <div className="flex flex-col md:flex-row md:items-center md:space-x-2 w-full">
                                    {/* Input */}
                                    <input
                                        type="text"
                                        placeholder="Add New Category"
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-black"
                                        value={newCategory}
                                        onChange={(e) => setNewCategory(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                handleAddCategory();
                                            }
                                        }}
                                        ref={categoryInputRef}
                                    />

                                    {/* Buttons for md screen and up */}
                                    <div className="hidden md:flex items-center space-x-2">
                                        <button
                                            type="button"
                                            onClick={handleAddCategory}
                                            className="bg-orange-500 hover:bg-orange text-white px-4 py-2 rounded-md"
                                        >
                                            Add
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowCategoryInput(false);
                                                setNewCategory('');
                                            }}
                                            className="text-red hover:text-red-700"
                                            aria-label="Cancel adding category"
                                        >
                                            <X />
                                        </button>
                                    </div>
                                </div>

                                {/* Buttons for small screen only */}
                                <div className="flex justify-end space-x-2 md:hidden">
                                    <button
                                        type="button"
                                        onClick={handleAddCategory}
                                        className="bg-orange-500 hover:bg-orange text-white px-4 py-2 rounded-md"
                                    >
                                        Add
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowCategoryInput(false);
                                            setNewCategory('');
                                        }}
                                        className="text-red hover:text-red-700"
                                        aria-label="Cancel adding category"
                                    >
                                        <X />
                                    </button>
                                </div>
                            </div>

                        ) : (
                            <button
                                type="button"
                                onClick={() => setShowCategoryInput(true)}
                                className="mt-3 flex items-center gap-1 text-sm text-orange hover:underline"
                            >
                                <AiOutlinePlus /> Add New Category
                            </button>
                        )}
                    </div>
                   </div>
                    {/* Upload Image (Optional) */}
                    <div className=' w-full mx-auto px-6 py-8 bg-white rounded-2xl shadow-lg font-poppins space-y-8'>
                    <div className="grid md:grid-cols-2 gap-4 ">
                        {/* Image Preview Box */}
                        <div className="relative border-2 border-dashed border-gray-400 rounded-md p-4 flex items-center justify-center text-sm text-gray-500 cursor-pointer h-40">
                            {previewImage ? (
                                <>
                                    <img
                                        src={URL.createObjectURL(previewImage)}
                                        alt="Preview"
                                        className="object-contain h-full w-full"
                                    />
                                    <X
                                        className="absolute top-2 right-2 w-4 h-4 text-red cursor-pointer"
                                        onClick={() => setPreviewImage(null)}
                                    />
                                </>
                            ) : (
                                <span className="absolute text-gray-500 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                                    No image uploaded
                                </span>
                            )}
                        </div>


                        {/* Upload Input */}
                        <label className="border p-4 rounded-md flex items-center bg-green justify-center cursor-pointer transition">
                            <Upload className="w-5 h-5 mr-2" />
                            Upload Photo
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                {...register("image")}
                                onChange={handleFileChange}
                            />
                        </label>
                    </div>
                    </div>
                    <button
                        type="submit"
                        onClick={handleClick}
                        className={`w-full py-3 rounded-lg text-white font-semibold transition ${isValid ? "bg-primary" : "bg-secondary"
                            }`}
                    >
                        Submit
                    </button>
                </div>
            
            </div>
            
        </motion.form>
    );
};

export default AddEditItem;
