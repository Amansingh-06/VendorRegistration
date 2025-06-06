// import React, { useRef, useState, useEffect } from 'react';
// import { useForm } from 'react-hook-form';
// import { motion } from 'framer-motion';
// import { Upload, X } from 'lucide-react';
// import { AiOutlinePlus } from 'react-icons/ai';
// import { FaUtensils, FaTags, FaRupeeSign, FaHashtag, FaRegClock } from 'react-icons/fa';
// import Header from '../components/Header';
// import { GiKnifeFork } from 'react-icons/gi';
// import { supabase } from '../utils/supabaseClient';
// import { toast } from 'react-hot-toast';
// import { v4 as uuidv4 } from 'uuid';
// import { FaLocationCrosshairs } from 'react-icons/fa6';
// import { useAuth } from '../context/authContext';
// import { useNavigate } from 'react-router-dom';

// import {
//     InputCleanup,
//     nameKeyDownHandler,
//     nameValidation,
//     priceKeyDownHandler,
//     priceInputClean,
//     priceValidation,
//     preparationTimeInputClean,
//     preparationTimeKeyDown,
//     preparationTimeValidation,
//     numberOnlyInputClean,
//     numberOnlyKeyDownHandler,
//     numberOnlyValidation,
//     shopNameKeyDownHandler,


// } from '../utils/Validation';
// import { SUPABASE_TABLES, MESSAGES,BUCKET_NAMES,ITEM_DEFAULTS,ITEM_FIELDS } from '../utils/vendorConfig';
// import { formatToCapital } from '../utils/vendorConfig';
// import Loader from '../components/Loader';
// import BottomNav from '../components/Footer';

// const AddEditItem = () => {
//     const [categories, setCategories] = useState([]);
//     const [newCategory, setNewCategory] = useState('');
//     const [showCategoryInput, setShowCategoryInput] = useState(false);
//     const [previewImage, setPreviewImage] = useState(null);
//     const [loading, setLoading] = useState(false);
//     const categoryInputRef = useRef(null);
//     const { vendorProfile } = useAuth();
//     const fileInputRef = useRef();
//     const navigate = useNavigate()


 
//     const handleFileChange = (e) => {
//         const file = e.target.files[0]; // Ye asli File object hai
//         setPreviewImage(file);
//       }

//     useEffect(() => {
//         const fetchCategories = async () => {
//             const { data, error } = await supabase
//                 .from(SUPABASE_TABLES?.ITEM_CATEGORY)
//                 .select('*');
//             if (error) {
//                 toast.error(MESSAGES?.FETCH_FAIL);
//                 console.error(error);
//             } else {
//                 setCategories(data);
//             }
//         };
//         fetchCategories();
//     }, []);

//     const handleAddCategory = async () => {
//         const trimmed = newCategory.trim();
//         if (!trimmed) {
//             return toast.error(MESSAGES.EMPTY_CATEGORY);
//         }

//         // Check if category already exists (case-insensitive)
//         const { data: existing, error: checkError } = await supabase
//             .from(SUPABASE_TABLES?.ITEM_CATEGORY)
//             .select('*')
//             .ilike('title', trimmed);

//         if (checkError) {
//             toast.error(MESSAGES.CHECK_FAIL);
//             console.error(checkError);
//             return;
//         }

//         if (existing.length > 0) {
//             toast.error(MESSAGES.CATEGORY_EXISTS);
//             return;
//         }

//         // ✅ Show loading toast only before inserting
//         const toastId = toast.loading('Adding Category');

//         const { data, error } = await supabase
//             .from(SUPABASE_TABLES?.ITEM_CATEGORY)
//             .insert([
//                 {
//                     cat_id: uuidv4(),
//                     title: trimmed,
//                     vendor_id: vendorProfile?.v_id,
//                 }
//             ])
//             .select();

//         toast.dismiss(toastId);

//         if (error) {
//             toast.error(MESSAGES.CATEGORY_ADD_FAIL);
//             console.error(error);
//             return;
//         }

//         const addedCat = {
//             ...data[0],
//             title: data[0].title.toUpperCase(), // force uppercase for consistency
//         };

//         // ✅ Update categories first
//         setCategories(prev => [...prev, addedCat]);

//         // ✅ Then set value in form (ensure it matches dropdown <option value>)
//         setValue('category', addedCat.title.toUpperCase());
//         console.log("✅ Category selected after adding:", addedCat.title.toUpperCase());

//         toast.success(MESSAGES.CATEGORY_ADDED);

//         setNewCategory('');
//         setShowCategoryInput(false);
//     };
    
    
    
    

//     const {
//         register,
//         handleSubmit,
//         setValue,
//         trigger,
//         watch,
//         setError,clearErrors,
//         formState: { errors, isValid },
//         reset
//     } = useForm({ mode: 'onChange' });

//     const [selectedType, setSelectedType] = useState(watch('type') || '');

//     const handleChange = (e) => {
//         setSelectedType(e.target.value);
//         setValue('type', e.target.value, { shouldValidate: true });
//     };

//     const uploadFile = async (file, bucketName) => {
//         if (!file || !file.name) return null; // 👈 fixed here

//         const fileExt = file.name.split('.').pop();
//         const filePath = `${Date.now()}.${fileExt}`;

//         const { data, error } = await supabase.storage
//             .from(bucketName)
//             .upload(filePath, file, {
//                 cacheControl: '3600',
//                 upsert: true,
//             });

//         if (error) {
//             console.error('Error uploading file:', error?.message);
//             toast.error(MESSAGES?.UPLOAD_ERROR);

//             throw new Error(error?.message);
//         }

//         const { data: urlData, error: urlError } = supabase.storage
//             .from(bucketName)
//             .getPublicUrl(filePath);

//         if (urlError) {
//             console.error('Error getting public URL:', urlError?.message);
//             toast.error(MESSAGES?.PUBLIC_URL_ERROR);

//             throw new Error(urlError?.message);
//         }

//         return urlData?.publicUrl;
//     };
//     useEffect(() => {
//         console.log("vendor",vendorProfile)
//     },[])
    

//     const onSubmit = async (data) => {
//         console.log("🟡 Submitted form data:", data);

//         setLoading(true);
//         try {
//             const img_url = await uploadFile(previewImage, BUCKET_NAMES.ITEM_IMG);
           

//             const finalData = {
//                 [ITEM_FIELDS.ID]: uuidv4(),
//                 [ITEM_FIELDS.NAME]: data?.itemName || ITEM_DEFAULTS?.NAME,
//                 [ITEM_FIELDS.CUISINE]: data?.cuisine || ITEM_DEFAULTS?.CUISINE,
//                 [ITEM_FIELDS.QUANTITY]: data?.quantity || ITEM_DEFAULTS?.QUANTITY,
//                 [ITEM_FIELDS.PRICE]: parseFloat(data?.price) || ITEM_DEFAULTS?.PRICE,
//                 [ITEM_FIELDS.PREP_TIME]: parseInt(data?.prepTime) || ITEM_DEFAULTS?.PREP_TIME,
//                 [ITEM_FIELDS.VEG]: data?.type === "veg",
//                 [ITEM_FIELDS.CATEGORY]: data?.category || ITEM_DEFAULTS?.CATEGORY,
//                 [ITEM_FIELDS.IMG_URL]: img_url || ITEM_DEFAULTS?.IMG_URL,
//                 [ITEM_FIELDS.VENDOR_ID]: vendorProfile?.v_id
//             }; ``
//             console.log(finalData)
//              const { error } = await supabase.from(SUPABASE_TABLES.ITEM).insert([finalData]);

//                         if (error) {
//                             console.error('Insert Error:', error?.message);
//                             toast.error(MESSAGES?.ITEM_INSERT_FAILED);
//                             return;
//                         }
            
                      
//                         reset();
            
//             console.log("Data inserted successfully");
//             toast.success(MESSAGES?.ITEM_REGISTER_SUCCESS);
//             navigate('/home')
//             setPreviewImage(null); // Reset preview image
            

//             console.log("Final Data:", finalData);

//         } catch (err) {
//             console.error("Something went wrong:", err?.message);
//             toast.error(MESSAGES?.UNEXPECTED_ERROR);

//         } finally {
//             setLoading(false);
//         }
//     };


//     // 🔥 Extra handler for showing error manually
//     const handleClick = async () => {
//         const valid = await trigger();
//         if (!valid) {
//             console.log("Form has validation errors");
//         }
//     };
//     const selectedCat = watch('category');

   

//     // Clear file input value
//     if (fileInputRef.current) {
//         fileInputRef.current.value = '';
//     }



//     return (
//         <motion.form
//             onSubmit={handleSubmit(onSubmit)}
//             initial={{ opacity: 0, y: 10 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.4 }}
//             className="max-w-2xl w-full mx-auto  bg-white rounded-2xl shadow-lg font-poppins  "
//             noValidate
//         >
//             {loading && <Loader />}
//             <Header title="Add Item" />
//             <div className='max-w-2xl w-full mx-auto px-2 md:px-8  py-8 bg-white rounded-2xl shadow-lg font-poppins space-y-8'>
//                 <div className="grid gap-8">
//                     {/* Item Name */}
//                     <div className='  px-6 py-8 bg-white rounded-2xl shadow-lg font-poppins space-y-8'>
//                     <div className="relative">
//                         <FaUtensils className="absolute left-3 top-4 text-black text-md" />
//                         <input
//                             id="itemName"
//                             {...register('itemName', nameValidation)}
//                             onKeyDown={nameKeyDownHandler}
//                             onInput={InputCleanup}
//                             type="text"
//                             placeholder="Item Name"
//                             className={`peer w-full pl-10 pr-3 py-3 rounded-md border ${errors?.itemName ? 'border-red' : 'border-gray-300'
//                                 } focus:outline-none focus:border-orange placeholder-transparent`}
//                         />
//                         <label
//                             htmlFor="itemName"
//                             className="absolute left-10 -top-2.5 text-sm bg-white text-black  transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-gray-500 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:font-semibold peer-not-placeholder-shown:font-semibold"
//                         >
//                             Item Name
//                         </label>
//                         {errors?.itemName && (
//                             <p className="text-red text-sm mt-1">{errors?.itemName.message}</p>
//                         )}
//                     </div>

                  

//                     {/* Quantity */}
//                     <div className="relative">
//                         <FaHashtag className="absolute left-3 top-4 text-black text-md" />
//                             <input
//                                 id="quantity"
//                                 {...register('quantity', {
//                                     validate: (value) => {
//                                         if (!value) return true; // optional field
//                                         if (!/^[a-zA-Z0-9]+$/.test(value)) {
//                                             return "Only letters and digits allowed. No spaces or special characters.";
//                                         }
//                                         return true;
//                                     }
//                                 })}
//                                 onKeyDown={shopNameKeyDownHandler}
//                                 type="text"
//                                 placeholder="Quantity (optional)"
//                                 className={`peer w-full pl-10 pr-3 py-3 rounded-md border ${errors.quantity ? 'border-red' : 'border-gray-300'
//                                     } focus:outline-none focus:border-orange placeholder-transparent`}
//                             />


//                         <label
//                             htmlFor="quantity"
//                             className="absolute left-10 -top-2.5 text-sm bg-white text-black  transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-gray-500 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:font-semibold peer-not-placeholder-shown:font-semibold"
//                         >
//                             Quantity (optional)
//                         </label>
//                         {errors.quantity && (
//                             <p className="text-red text-sm mt-1">{errors.quantity.message}</p>
//                         )}
//                     </div>

//                     {/* Price */}
//                     <div className="relative">
//                         <FaRupeeSign className="absolute left-3 top-4 text-black text-md" />
//                         <input
//                             id="price"
//                             {...register('price', priceValidation)}
//                             onKeyDown={priceKeyDownHandler}
//                             onInput={priceInputClean}
//                             type="text"
//                             placeholder="Price"
//                             className={`peer w-full pl-10 pr-3 py-3 rounded-md border ${errors?.price ? 'border-red' : 'border-gray-300'
//                                 } focus:outline-none focus:border-orange placeholder-transparent`}
//                         />
//                         <label
//                             htmlFor="price"
//                             className="absolute left-10 -top-2.5 text-sm bg-white text-black  transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-gray-500 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:font-semibold peer-not-placeholder-shown:font-semibold"
//                         >
//                             Price
//                         </label>
//                         {errors?.price && (
//                             <p className="text-red text-sm mt-1">{errors?.price.message}</p>
//                         )}
//                     </div>

//                     {/* Preparation Time */}
//                     <div className="relative">
//                         <FaRegClock className="absolute left-3 top-4 text-black text-md" />
//                         <input
//                             id="prepTime"
//                             {...register('prepTime', numberOnlyValidation)}
//                             onKeyDown={numberOnlyKeyDownHandler}
//                             onInput={numberOnlyInputClean}
//                             type="text"
//                             placeholder="Preparation Time"
//                             className={`peer w-full pl-10 pr-3 py-3 rounded-md border ${errors?.prepTime ? 'border-red-500' : 'border-gray-300'
//                                 } focus:outline-none focus:border-orange placeholder-transparent`}
//                         />
//                         <label
//                             htmlFor="prepTime"
//                             className="absolute left-10 -top-2.5 text-sm bg-white text-black  transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-gray-500 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:font-semibold peer-not-placeholder-shown:font-semibold"
//                         >
//                             Preparation Time(in min)
//                         </label>
//                         {errors?.prepTime && (
//                             <p className="text-red text-sm mt-1">{errors?.prepTime.message}</p>
//                         )}
//                         </div>
//                 </div>
//                     <div className='  px-6 py-6 bg-white rounded-2xl shadow-lg font-poppins space-y-8 flex flex-col gap-6'>
//                         {/* Type */}

//                         <div className="mb-6">
//                             <h3 className="text-base font-semibold text-gray-600 mb-2">Select Type</h3>
//                             <div className="flex gap-8">

//                                 {/* Veg Option */}
//                                 <label className="cursor-pointer">
//                                     <input
//                                         type="radio"
//                                         value="veg"
//                                         {...register('type', { required: 'Please select type' })}
//                                         className="hidden"
//                                         checked={selectedType === "veg"}
//                                         onChange={handleChange}
//                                     />
//                                     <div
//                                         className={`flex items-center gap-3 md:px-5 px-2 py-3 rounded-xl border cursor-pointer transition-shadow shadow-sm
//               ${selectedType === "veg"
//                                                 ? "border-green-600 bg-green-100 shadow-lg"
//                                                 : "border-gray-300 hover:border-green-500"
//                                             }`}
//                                     >
//                                         {/* Outer circle */}
//                                         <div
//                                             className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors duration-300
//                 ${selectedType === "veg"
//                                                     ? "border-green-600 bg-green-600"
//                                                     : "border-green-600 bg-transparent"
//                                                 }`}
//                                         >
//                                             {/* Inner dot */}
//                                             {/* <div
//                                                 className={`w-3 h-3 rounded-full bg-white transition-transform duration-300
//                                                          ${selectedType === "veg" ? "scale-100" : "scale-0"
//                                                     }`}
//                                             /> */}
//                                         </div>

//                                         <span
//                                             className={`md:text-md text-sm font-medium transition-colors duration-300
//                                               ${selectedType === "veg"
//                                                     ? "text-green-700"
//                                                     : "text-gray-800"
//                                                 }`}
//                                         >
//                                             Veg
//                                         </span>
//                                     </div>
//                                 </label>

//                                 {/* Non-Veg Option */}
//                                 <label className="cursor-pointer">
//                                     <input
//                                         type="radio"
//                                         value="nonveg"
//                                         {...register('type', { required: 'Please select type' })}
//                                         className="hidden"
//                                         checked={selectedType === "nonveg"}
//                                         onChange={handleChange}
//                                     />
//                                     <div
//                                         className={`flex items-center gap-3 md:px-5 px-2 py-3 rounded-xl border cursor-pointer transition-shadow shadow-sm
//               ${selectedType === "nonveg"
//                                                 ? "border-red-600 bg-red-100 shadow-lg"
//                                                 : "border-gray-300 hover:border-red-500"
//                                             }`}
//                                     >
//                                         {/* Outer circle */}
//                                         <div
//                                             className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors duration-300
//                 ${selectedType === "nonveg"
//                                                     ? "border-red-600 bg-red-600"
//                                                     : "border-red-600 bg-transparent"
//                                                 }`}
//                                         >
//                                             {/* Inner dot */}
//                                             {/* <div
//                                                 className={`w-3 h-3 rounded-full bg-white transition-transform duration-300
//                   ${selectedType === "nonveg" ? "scale-100" : "scale-0"
//                                                     }`}
//                                             /> */}
//                                         </div>

//                                         <span
//                                             className={`md:text-md text-sm font-medium transition-colors duration-300
//                 ${selectedType === "nonveg"
//                                                     ? "text-red-700"
//                                                     : "text-gray-800"
//                                                 }`}
//                                         >
//                                             Non-Veg
//                                         </span>
//                                     </div>
//                                 </label>
//                             </div>

//                             {errors.type && (
//                                 <p className="text-red-500 text-sm mt-2">{errors.type.message}</p>
//                             )}
//                         </div>


                      

//                     {/* Cuisine */}
//                     <div className="relative">
//                         <GiKnifeFork className="absolute left-3 top-4 text-black font-semibold text-md pointer-events-none" />
//                         <select
//                             {...register('cuisine', { required: 'Cuisine is required' })}
//                             className={`w-full px-9 py-3 rounded-md border ${errors.cuisine ? 'border-red' : 'border-gray-300'
//                                 } text-black focus:outline-none focus:border-orange`}
//                         >
//                             <option value="">Select Cuisine</option>
//                             <option value="Indian">Indian</option>
//                             <option value="Chinese">Chinese</option>
//                             <option value="Italian">Italian</option>
//                         </select>
//                         <label className="absolute left-9 -top-2.5 text-sm bg-white px-1 text-gray-500 font-semibold">
//                             Cuisine
//                         </label>
//                         {errors?.cuisine && (
//                             <p className="text-red text-sm mt-1">{errors?.cuisine?.message}</p>
//                         )}
//                     </div>

//                     {/* Category with Add new */}
//                     <div className='relative -mt-6'>
//                         <label className="mb-1 block font-semibold text-gray-500">Category</label>
//                             <select
//                                 {...register('category', { required: 'Category is required' })}
//                                 className={`w-full px-4 py-3 border rounded-md text-black ${errors.category ? 'border-red' : 'border-gray-300'
//                                     } focus:outline-none focus:border-orange`}
//                             >
//                                 <option value="">Select category</option>
//                                 {categories?.map((cat) => (
//                                     <option key={cat?.cat_id} value={cat?.title?.toUpperCase()}>
//                                         {cat?.title?.toUpperCase()}
//                                     </option>
//                                 ))}
//                             </select>


//                             {errors?.category && (
//                                 <p className="text-red text-sm mt-1">{errors?.category?.message}</p>
//                             )}


//                         {showCategoryInput ? (
//                             <div className="mt-3 space-y-2">
//                                 {/* Input and buttons wrapper */}
//                                 <div className="flex flex-col md:flex-row md:items-center md:space-x-2 w-full">
//                                     {/* Input */}
//                                         <input
//                                             type="text"
//                                             placeholder="Add New Category"
//                                             className="w-full border border-gray-300 rounded-md px-3 py-2 text-black"
//                                             value={newCategory}
//                                             onChange={(e) => setNewCategory(e.target.value)}
//                                             onKeyDown={(e) => {
//                                                 const key = e.key;
//                                                 const isLetter = /^[a-zA-Z]$/.test(key);
//                                                 const allowedKeys = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete'];

//                                                 if (!(isLetter || allowedKeys.includes(key))) {
//                                                     e.preventDefault(); // ❌ Prevent anything except letters and navigation keys
//                                                 }

//                                                 if (key === 'Enter') {
//                                                     e.preventDefault();
//                                                     handleAddCategory();
//                                                 }
//                                             }}
//                                             ref={categoryInputRef}
//                                         />


//                                     {/* Buttons for md screen and up */}
//                                         <div className="hidden md:flex items-center space-x-2">
//                                             <button
//                                                 type="button"
//                                                 onClick={handleAddCategory}
//                                                 disabled={!newCategory.trim()} // 🚫 Disable when empty or only spaces
//                                                 className={`px-4 py-2 rounded-md text-white 
//       ${!newCategory.trim()
//                                                         ? 'bg-gray-300 cursor-not-allowed'
//                                                         : 'bg-orange-500 hover:bg-orange'}
//     `}
//                                             >
//                                                 Add
//                                             </button>

//                                             <button
//                                                 type="button"
//                                                 onClick={() => {
//                                                     setShowCategoryInput(false);
//                                                     setNewCategory('');
//                                                 }}
//                                                 className="text-red hover:text-red-700"
//                                                 aria-label="Cancel adding category"
//                                             >
//                                                 <X />
//                                             </button>
//                                         </div>

//                                 </div>

//                                 {/* Buttons for small screen only */}
//                                 <div className="flex justify-end space-x-2 md:hidden">
//                                         <button
//                                             type="button"
//                                             onClick={handleAddCategory}
//                                             disabled={!newCategory.trim()} // 🚫 Disable when empty or only spaces
//                                             className={`px-4 py-2 rounded-md text-white 
//       ${!newCategory.trim()
//                                                     ? 'bg-gray-300 cursor-not-allowed'
//                                                     : 'bg-orange-500 hover:bg-orange'}
//     `}
//                                         >
//                                             Add
//                                         </button>
//                                     <button
//                                         type="button"
//                                         onClick={() => {
//                                             setShowCategoryInput(false);
//                                             setNewCategory('');
//                                         }}
//                                         className="text-red hover:text-red-700"
//                                         aria-label="Cancel adding category"
//                                     >
//                                         <X />
//                                     </button>
//                                 </div>
//                             </div>

//                         ) : (
//                             <button
//                                 type="button"
//                                 onClick={() => setShowCategoryInput(true)}
//                                 className="mt-3 flex items-center gap-1 text-sm text-orange hover:underline"
//                             >
//                                 <AiOutlinePlus /> Add New Category
//                             </button>
//                         )}
//                     </div>
//                    </div>
//                     {/* Upload Image (Optional) */}
//                     <div className='  px-6 py-8 bg-white rounded-2xl shadow-lg font-poppins space-y-8'>
//                     <div className="grid md:grid-cols-2 gap-4 ">
//                         {/* Image Preview Box */}
//                             {/* Image Preview + Remove */}
//                             <div className="relative border-2 border-dashed border-gray-400 rounded-md p-4 flex items-center justify-center text-sm text-gray-500 cursor-pointer h-40">
//                                 {previewImage ? (
//                                     <>
//                                         <img
//                                             src={URL.createObjectURL(previewImage)}
//                                             alt="Preview"
//                                             className="object-contain h-full w-full"
//                                         />
//                                         <X
//                                             className="absolute top-2 right-2 w-4 h-4 text-red cursor-pointer"
//                                             onClick={() => {
//                                                 setPreviewImage(null);
//                                                 if (fileInputRef.current) {
//                                                     fileInputRef.current.value = '';
//                                                 }
//                                             }}
//                                         />
//                                     </>
//                                 ) : (
//                                     <span className="absolute text-gray-500 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
//                                         No image uploaded
//                                     </span>
//                                 )}
//                             </div>

//                             {/* Upload Input */}
//                             <label className="border p-4 rounded-md flex items-center bg-green justify-center cursor-pointer transition">
//                                 <Upload className="w-5 h-5 mr-2" />
//                                 Upload Photo
//                                 <input
//                                     type="file"
//                                     accept="image/*"
//                                     className="hidden"
//                                     {...register("image")}
//                                     ref={fileInputRef}
//                                     onChange={handleFileChange}
//                                 />
//                             </label>

//                     </div>
//                     </div>
//                     <button
//                         type="submit"
//                         onClick={handleClick}
//                         className={`w-full py-3 mb-8 rounded-lg text-white font-semibold transition ${isValid ? "bg-primary cursor-pointer" : "bg-secondary cursor-disable"
//                             }`}
//                     >
//                         Submit
//                     </button>
//                 </div>
//                 <BottomNav/>
            
//             </div>
            
//         </motion.form>
//     );
// };

// export default AddEditItem;
import React, { useState, useRef,useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FaUtensils, FaRupeeSign, FaRegClock, FaHashtag ,FaTimes} from 'react-icons/fa';
import FormInput from '../components/FormInput';
import TypeRadio from '../components/TypeRadio';
import ImageUploader from '../components/ImageUploader';
import Header from '../components/Header';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import { toast } from 'react-hot-toast'; // ya tum jahan se use kar rahe ho
import { supabase } from '../utils/supabaseClient';
import { v4 as uuidv4 } from 'uuid';
import BottomNav from '../components/Footer';


const AddEditItem = ({ defaultValues = {}, onSubmitSuccess }) => {
    const location = useLocation();
    const itemData = location.state?.itemData || null;
    const isEditMode = itemData !== null;
    console.log(itemData)
    const {vendorProfile} = useAuth()
    console.log(itemData)
    const { register, handleSubmit, setValue, watch, formState: { errors, isValid } } = useForm({
        defaultValues: {
            itemName: itemData?.item_name || '',
            price: itemData?.item_price || '',
            prepTime: itemData?.prep_time || '',
            quantity: itemData?.item_quantity || '',
            cuisine: itemData?.item_cuisine || '',
            category: itemData?.item_category || '',
            type: itemData?.veg ||'' // ✅ Convert boolean to string
        },
        mode: 'onChange'
    });
   
    const [previewImage, setPreviewImage] = useState(itemData?.img_url || null);;
    const [selectedType, setSelectedType] = useState(itemData?.type || '');
    const [categories, setCategories] = useState([]);
    const [newCategory, setNewCategory] = useState('');
    const [showCategoryInput, setShowCategoryInput] = useState(false);
    const [cuisines, setCuisines] = useState([]);
    const [selectedCuisine, setSelectedCuisine] = useState(null);
    const fileInputRef = useRef();

    useEffect(() => {
        const fetchCuisines = async () => {
            const { data, error } = await supabase
                .from('cusion')
                .select('*')
                .order('name', { ascending: true });

            if (error) {
                console.error('Failed to fetch cuisines:', error.message);
            } else {
                setCuisines(data);
            }
        };

        fetchCuisines();
    }, []);

    const handleCuisineChange = (e) => {
        const name = e.target.value;
        const cuisine = cuisines.find(c => c.name === name);
        setSelectedCuisine(cuisine); // poora object bhi mil gaya
    };
      

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) setPreviewImage(file);
    };
    useEffect(() => {
        const fetchCategories = async () => {
            const { data, error } = await supabase
                .from('item_category')
                .select('title')
                .eq('vendor_id', vendorProfile?.v_id); // if vendor-specific

            if (error) {
                console.error('Failed to fetch categories:', error.message);
            } else {
                const categoryList = data.map((row) => row.title);
                setCategories(categoryList);
                console.log(data)
            }
        };

        fetchCategories();
        console.log("cat", categories)
        console.log("v",vendorProfile?.v_id)
    }, [vendorProfile?.id]);
      


    const handleAddCategory = async () => {
        console.log(vendorProfile);
        const trimmed = newCategory.trim();

        // 🔍 Validate input: only characters
        if (!trimmed || !/^[a-zA-Z]+$/.test(trimmed)) {
            toast.error("Only characters allowed");
            return;
        }

        const inputLower = trimmed.toLowerCase();

        // 🔍 Check in local dropdown (case-insensitive)
        const exists = categories.some(cat => cat.toLowerCase() === inputLower);
        if (exists) {
            toast.error("Category already exists");
            return;
        }

        // ✅ Check in Supabase before insert
        const { data: existing, error: fetchError } = await supabase
            .from('item_category')
            .select('title')
            .eq('vendor_id', vendorProfile?.v_id);

        if (fetchError) {
            toast.error("Failed to check existing categories");
            return;
        }

        const serverExists = existing?.some(
            cat => cat.title.toLowerCase() === inputLower // ✅ fix field name
        );

        if (serverExists) {
            toast.error("Category already exists in database");
            return;
        }

        // ✅ Insert into Supabase
        const { data, error } = await supabase
            .from('item_category')
            .insert([{ title: trimmed, vendor_id: vendorProfile?.v_id, cat_id : uuidv4() }])
            .select();

        if (error) {
            console.error('Insert failed:', error.message);
            toast.error("Failed to add category");
            return;
        }

        const insertedCategory = data[0]?.title;
        setCategories((prev) => [...prev, insertedCategory]);
        setValue('category', insertedCategory); // ✅ auto select
        setNewCategory('');
        setShowCategoryInput(false);
        toast.success("Category added");
    };
      
    

    const onSubmit = async (formData) => {
        console.log(isEditMode)
        console.log(formData.type)
        const payload = {
            item_id:uuidv4(),
            item_name: formData.itemName,
            item_price: formData.price,
            prep_time: formData.prepTime,
            item_quantity: formData.quantity,
            item_cuisine: formData.cuisine,
            item_category: formData.category,
            veg: formData.type,
            img_url: previewImage, // ya upload logic ke baad
            vendor_id: vendorProfile?.v_id, // required for insert
        };
        console.log(vendorProfile?.v_id)
        if (isEditMode) {
            // 🔁 EDIT LOGIC
            const { data, error } = await supabase
                .from('item')
                .update(payload)
                .eq('item_id', itemData.item_id);

            if (error) {
                console.error('Update failed:', error.message);
            } else {
                console.log('✅ Item updated');
                if (onSubmitSuccess) onSubmitSuccess(data);
            }
        } else {
            // ➕ ADD LOGIC
            const { data, error } = await supabase
                .from('item')
                .insert(payload);

            if (error) {
                console.error('Insert failed:', error.message);
            } else {
                console.log('✅ Item added');
                if (onSubmitSuccess) onSubmitSuccess(data);
            }
        }
    };
    console.log('type', itemData?.veg)

    useEffect(() => {
        if (itemData && categories.length > 0) {
            setValue('type', itemData?.veg);
            setSelectedType(itemData?.veg);
            setValue('cuisine', itemData.item_cuisine);
            setValue('category', itemData.item_category);
            console.log('category',itemData?.item_category)
        }
    }, [itemData, categories, setValue]); // ⬅️ Include categories
    
    console.log(selectedCuisine)
      
    return (
        <div className='w-full min-h-screen mx-auto flex justify-center bg-gray-100'>
            <div className='max-w-2xl w-full mb-15'>
                <Header title='Add Item'/>
                <div className='max-w-2xl w-full  space-y-6 rounded-2xl shadow-lg '>
                    <form onSubmit={handleSubmit(onSubmit)} className="w-full  mx-auto px-6 py-8 space-y-6 bg-white">
                        <div className='flex flex-col gap-6 rounded-2xl shadow-lg  p-5'>
                        <FormInput
                            id="itemName"
                            label="Item Name"
                            icon={FaUtensils}
                            register={register}
                            validation={{ required: 'Item name is required' }}
                            error={errors.itemName}
                        />
                        
                            <FormInput
                                id="price"
                                label="Price"
                                icon={FaRupeeSign}
                                register={register}
                                validation={{ required: 'Price is required' }}
                                error={errors.price}
                            />
                            <FormInput
                                id="prepTime"
                                label="Preparation Time"
                                icon={FaRegClock}
                                register={register}
                                validation={{ required: 'Time is required' }}
                                error={errors.prepTime}
                            />
                            <FormInput
                                id="quantity"
                                label="Quantity"
                                icon={FaHashtag}
                                register={register}
                                validation={{ required: 'Quantity is required' }}
                                error={errors.quantity}
                            />
                        </div>
                        <TypeRadio
                            selectedType={selectedType}
                            setSelectedType={setSelectedType}
                            register={register}
                            setValue={setValue}
                            error={errors.type}
                        />
                        <div>
                            <label className="block mb-1 font-medium text-gray-700">Select Cuisine</label>
                            <select
                                {...register('cuisine', { required: 'Cuisine is required' })}
                                className="w-full px-4 py-2 border rounded-md"
                                defaultValue=""
                                onChange={(e) => {
                                    register('cuisine').onChange(e);  // React Hook Form onChange
                                    handleCuisineChange(e);           // Custom handler for showing details
                                }}
                            >
                                <option value="" disabled>-- Select Cuisine --</option>
                                {cuisines.map(c => (
                                    <option key={c.c_id} value={c.c_name}>{c.name}</option>
                                ))}
                            </select>
                            {errors.cuisine && <p className="text-red text-sm mt-1">{errors.cuisine.message}</p>}
                        </div>
                        <div>
                            <label className="block mb-1 font-medium text-gray-700">Select Category</label>
                            <select
                                {...register('category', { required: 'Category is required' })}
                                className="w-full px-4 py-2 border rounded-md"
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setValue('category', val);
                                }}
                            >
                                <option value="">-- Select Category --</option>
                                {categories.map((cat, i) => (
                                    <option key={i} value={cat}>{cat}</option>
                                ))}
                            </select>
                            {errors.category && <p className="text-red text-sm mt-1">{errors.category.message}</p>}

                            <p
                                className="mt-2 text-sm text-orange-500 cursor-pointer hover:underline"
                                onClick={() => setShowCategoryInput((prev) => !prev)}
                            >
                                + Add New Category
                            </p>

                            {showCategoryInput && (
                                <div className="mt-2 flex flex-col sm:flex-row sm:items-center gap-2">
                                    <input
                                        type="text"
                                        value={newCategory}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (/^[a-zA-Z]*$/.test(val)) setNewCategory(val);
                                        }}
                                        placeholder="Add new category"
                                        className="flex-1 px-3 py-2 border rounded-md"
                                    />
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={handleAddCategory}
                                            disabled={!newCategory.trim()}
                                            className="bg-blue-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
                                        >
                                            Add
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setNewCategory('');
                                                setShowCategoryInput(false);
                                            }}
                                            className="p-2 rounded-full hover:bg-gray-200"
                                            title="Cancel"
                                        >
                                            <FaTimes className="text-gray-500 w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <ImageUploader
                            previewImage={previewImage}
                            setPreviewImage={setPreviewImage}
                            fileInputRef={fileInputRef}
                            register={register}
                            onChange={handleImageChange}
                        />
                        <button
                            type="submit"
                            className={`w-full py-3 rounded-lg text-white font-semibold ${isValid ? 'bg-blue-600' : 'bg-gray-400 cursor-not-allowed'}`}
                        >
                            Submit
                        </button>
                    </form>
                </div>
                
            </div>
            <BottomNav />
        </div>
    );
};

export default AddEditItem;