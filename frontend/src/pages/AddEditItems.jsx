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
import React, { useState, useRef,useEffect,useMemo } from 'react';
import { useForm,Controller } from 'react-hook-form';
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
import ItemCategory from '../components/ItemCategory';
import { SUPABASE_TABLES, MESSAGES, BUCKET_NAMES, ITEM_DEFAULTS, ITEM_FIELDS } from '../utils/vendorConfig';
import { useNavigate } from 'react-router-dom';
import Loader from '../components/Loader';
import { useFetch } from '../context/FetchContext';
import { uploadFile } from '../utils/uploadFile';
import TransparentLoader from '../components/Transparentloader';



const AddEditItem = ({ defaultValues = {}, onSubmitSuccess }) => {
    const [categories, setCategories] = useState([]);
    const [newCategory, setNewCategory] = useState('');
    const [selectedType, setSelectedType] = useState()
    // const [cuisines,setCuisines]=useState([])
        const [showCategoryInput, setShowCategoryInput] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [catLoader,setCatLoader]=useState(false)
        const categoryInputRef = useRef(null);
    const { vendorProfile, selectedVendorId ,session} = useAuth();
    const vendorId = vendorProfile?.v_id || selectedVendorId; // ✅ fallback
    const fileInputRef = useRef();
        const navigate = useNavigate()
    const location = useLocation();
    const itemData = location.state?.itemData || null;
    const isEditMode = itemData !== null;
    console.log(itemData)
    console.log(itemData)
    const {fetchItems}=useFetch()

    const { register, handleSubmit,control, setValue,watch,reset, formState: { errors ,isValid},trigger } = useForm({
        defaultValues: {
            itemName: '',
            quantity: '',
            price: '',
            prepTime: '',
            category: '',
            cuisine: [],
            type: null,
            priceMultiplier:"1",
          },
    });
    const watchedFields = watch()

    console.log(itemData)


    useEffect(() => {
        if (!vendorId) return; // ⛔ Don't run until v_id is available
        const fetchCategories = async () => {
            const { data, error } = await supabase
                .from(SUPABASE_TABLES?.ITEM_CATEGORY_BY_VENDOR)
                .select('*')
                .eq(ITEM_FIELDS?.VENDOR_ID, vendorId);  // ✅ correct eq syntax

            if (error) {
                toast.error(MESSAGES?.FETCH_FAIL);
                console.error(error);
            } else {
                setCategories(data);
            }
        };
        fetchCategories();
    }, [vendorId]); // ✅ include vendor_id as dependency

    useEffect(() => {
        register('cuisine', {
            required: 'Cuisine is required',
        });
    }, [register]);
      
    const isFormChanged = useMemo(() => {
        if (!itemData) return true;

        const hasTextChanged =
            watchedFields.itemName !== itemData.item_name ||
            watchedFields.quantity !== itemData.item_quantity?.toString() || // ✅ "15" === "15"
            watchedFields.price !== itemData.item_price?.toString() ||       // ✅ "125" === "125"
            watchedFields.prepTime !== itemData.prep_time?.toString() ||    // ✅ "20" === "20"
            watchedFields.category !== itemData.vendor_created_category_id ||
            JSON.stringify(watchedFields.cuisine || []) !== JSON.stringify(itemData.item_category_id || []) ||
            watchedFields.type !== (itemData.veg ? "veg" : "nonveg") ||
        (selectedVendorId && watchedFields.priceMultiplier !== itemData.price_multiplier?.toString()); // ✅ add ||
        console.log("watchedFields", watchedFields?.priceMultiplier)
        console.log("itemData", itemData?.price_multiplier)


            const hasImageChanged =
            (previewImage && typeof previewImage === "object") || // ✅ new image uploaded
            (!previewImage && itemData.img_url && itemData.img_url !== "NA"); // ✅ image removed (was present earlier)
          

        return hasTextChanged || hasImageChanged;
    }, [watchedFields, previewImage, itemData]);
    
    console.log(isFormChanged, "isform")
    
    


    const handleAddCategory = async () => {
                const trimmed = newCategory.trim();
                if (!trimmed) {
                    return toast.error(MESSAGES.EMPTY_CATEGORY);
        }
        setCatLoader(true)
        
        // Check if category already exists (case-insensitive)
                const { data: existing, error: checkError } = await supabase
                    .from(SUPABASE_TABLES?.ITEM_CATEGORY_BY_VENDOR)
                    .select('*')
            .ilike('title', trimmed)
                    .eq('vendor_id', vendorId); // ✅ vendor-specific check
        
                if (checkError) {
                    toast.error(MESSAGES.CHECK_FAIL);
                    console.error(checkError);
                    return;
                }
        
                if (existing.length > 0) {
                    toast.error(MESSAGES.CATEGORY_EXISTS);
                    setCatLoader(false)
                    return;

        }
        

        
                // ✅ Show loading toast only before inserting
                // const toastId = toast.loading('Adding Category');
        
                const { data, error } = await supabase
                    .from(SUPABASE_TABLES?.ITEM_CATEGORY_BY_VENDOR)
                    .insert([
                        {
                            cat_id: uuidv4(),
                            title: trimmed,
                            vendor_id: vendorId,
                        }
                    ])
                    .select();
        
        // toast.dismiss(toastId);
        
        if (error) {
                    setCatLoader(false)
                    toast.error(MESSAGES.CATEGORY_ADD_FAIL);
                    console.error(error);
                    return;
                }
        
                const addedCat = {
                    ...data[0],
                    title: data[0].title.toUpperCase(), // force uppercase for consistency
                };
        
                // ✅ Update categories first
                setCategories(prev => [...prev, addedCat]);
        
                // ✅ Then set value in form (ensure it matches dropdown <option value>)
        setValue('category', addedCat.cat_id, {
            shouldValidate: true,
            shouldDirty: true,
            shouldTouch: true,
        });

        // ✅ Manually trigger validation
        await trigger('category');
        setCatLoader(false)
                toast.success(MESSAGES.CATEGORY_ADDED);
        
                setNewCategory('');
                setShowCategoryInput(false);
            };

    useEffect(() => {
        if (isEditMode && itemData) {
            console.log(itemData?.item_category_id)
            reset({
                itemName: itemData?.item_name || '',
                quantity: itemData.item_quantity?.toString() || '',
                price: itemData.item_price?.toString() || '',
                prepTime: itemData.prep_time?.toString() || '',
                category: itemData.vendor_created_category_id || '',
                cuisine: Array.isArray(itemData.item_category_id)
                    ? itemData.item_category_id
                    : JSON.parse(itemData?.item_category_id || '[]'),
                type: itemData.veg ? 'veg' : 'nonveg',
                note: itemData.item_description === 'NA' ? '' : itemData.item_description || '',
                priceMultiplier: selectedVendorId
                ? itemData.price_multiplier?.toString() || ''
                : '', // 🆕 only if vendor is self
            });
            
            if (itemData.img_url && itemData.img_url !== "NA") {
                setPreviewImage(itemData.img_url); // ✅ Real image
              } else {
                setPreviewImage(null); // ✅ No image, so set null
              }
              
              

            setSelectedType(itemData.veg ? 'veg' : 'nonveg');
        }
    }, [isEditMode, itemData, reset]);
              

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPreviewImage(file);
        }
    };
    const formRef = useRef();

    const getChangedFields = (oldData, newData) => {
        const changed = {};
      
        for (const key in newData) {
          let oldVal = oldData[key];
          let newVal = newData[key];
      
          // 🧠 Normalize both values for better comparison
          if (Array.isArray(oldVal) || Array.isArray(newVal)) {
            // If either is array, convert both to sorted strings
            oldVal = Array.isArray(oldVal) ? oldVal.sort().join(",") : String(oldVal);
            newVal = Array.isArray(newVal) ? newVal.sort().join(",") : String(newVal);
          } else {
            oldVal = oldVal !== null && oldVal !== undefined ? String(oldVal).trim() : "";
            newVal = newVal !== null && newVal !== undefined ? String(newVal).trim() : "";
          }
      
          // ✅ Skip if they are same
          if (oldVal === newVal) continue;
      
          // 🧹 Optional rule: NA vs "" → treat as same
          if ((oldVal === "NA" && newVal === "") || (oldVal === "" && newVal === "NA")) continue;
      
          changed[key] = {
            before: oldVal,
            after: newVal,
          };
        }
      
        return changed;
      };
      
      
      const generateChangeDescription = (changes) => {
        return Object.entries(changes)
          .map(([key, value]) => `${key} changed from "${value.before}" to "${value.after}"`)
          .join(", ");
      };
            
    
      const onSubmit = async (data) => {
        if (isEditMode && !isFormChanged) {
          toast.error("No updates found!");
          return;
        }
      
        try {
          setLoading(true);
      
          const typeBool = data.type === 'veg';
      
          const itemFields = {
            item_name: data?.itemName.trim(),
            prep_time: parseInt(data.prepTime.trim()),
            item_price: data?.price.trim(),
            item_quantity: data?.quantity.trim(),
            veg: typeBool,
            vendor_created_category_id: data?.category,
            item_category_id: data.cuisine,
            item_description: data?.note?.trim() || '',
          };
      
          if (selectedVendorId) {
            itemFields.price_multiplier = parseFloat(data?.priceMultiplier);
          }
      
          let imageUrl = itemData?.img_url || null;
      
          if (previewImage === null) {
            imageUrl = "NA";
          } else if (typeof previewImage !== 'string') {
            imageUrl = await uploadFile(previewImage, BUCKET_NAMES.ITEM_IMG, itemFields?.item_name || "unknown");
          }
      
          itemFields.img_url = imageUrl;
      
          let response, insertPayload, updatePayload;
      
          if (isEditMode) {
            // 🔁 UPDATE logic
            updatePayload = {
              ...itemFields,
              updated_at: new Date(),
            };
      
            response = await supabase
              .from(SUPABASE_TABLES?.ITEM)
              .update(updatePayload)
              .eq('item_id', itemData.item_id);
          } else {
            // ➕ INSERT logic
            insertPayload = {
              ...itemFields,
              item_id: uuidv4(),
              vendor_id: vendorId,
              created_at: new Date(),
              updated_at: new Date(),
            };
            console.log("➡️ Insert Payload:", insertPayload);
      
            response = await supabase
              .from(SUPABASE_TABLES?.ITEM)
              .insert([insertPayload]);
          }
      
          const { error } = response;
          if (error) {
            toast.error(isEditMode ? "Item update failed!" : "Item save failed!");
            console.error(error);
          } else {
            toast.success(isEditMode ? "Item updated successfully!" : "Item saved successfully!");
      
            // ✅ Admin Logs (Only if admin is logged in)
            if (selectedVendorId) {
              const { data: { user: currentUser } } = await supabase.auth.getUser();
              const title = isEditMode ? "Updated Item" : "Added Item";
              const action = isEditMode ? "updated" : "added";
              const itemName = itemFields.item_name;
      
              let description = `Item "${itemName}" was ${action} for vendor ID ${selectedVendorId}.`;
      
              if (isEditMode) {
                const changes = getChangedFields(itemData, itemFields);
                if (Object.keys(changes).length > 0) {
                  const changeDetails = generateChangeDescription(changes);
                  description += ` Changes: ${changeDetails}`;
                } else {
                  description += " No fields were changed.";
                }
              }
      
              await supabase.from("admin_logs").insert([
                {
                  admin_id: session?.user?.id,
                  title,
                  description,
                  timestamp: new Date(),
                },
              ]);
            }
      
            await fetchItems(true);
            navigate('/manage-items');
            onSubmitSuccess?.();
          }
        } catch (err) {
          console.error("❌ Unexpected error:", err);
          toast.error("Something went wrong!");
        } finally {
          setLoading(false);
        }
      };
      
    
            
    
  
console.log("iTemData",itemData)
 
    // console.log(vendorProfile?.v_id)
    console.log("isValid", isValid)
    console.log("isFormChanged", isFormChanged)
   
    return (
        <div className='w-full  mx-auto flex justify-center'>
            {loading && <Loader/>}
            <div className='max-w-2xl w-full bg-gray-100    '>
                {/* <Header title={isEditMode ? 'Edit Item' : 'Add Item'} /> */}
            <div className='max-w-2xl w-full  pt-6  space-y-6 rounded-2xl   '>
                    
                    <form ref={formRef}  onSubmit={handleSubmit(onSubmit)} className="w-full h-full  mx-auto md:px-6 mb-20  p-2 py-8 space-y-6   bg-gray-100">
                        <div className='flex flex-col gap-6 rounded-lg shadow-lg border-1 border-gray-300 bg-white  p-5'>
                        <h1 className="text-md md:text-2xl lg:text-2xl font-medium text-gray">ITEM DETAILS</h1>
                        <FormInput
                                id="itemName"
                                label="Item Name"
                                icon={FaUtensils}
                                register={register}
                                validation={{ required: 'Item name is required' }}
                                error={errors.itemName}
                                watch={watch}
                                inputProps={{
                                    onInput: (e) => {
                                        e.target.value = e.target.value.replace(/[^A-Za-z\s]/g, '');
                                    },
                                }}
                            />

                            <FormInput
                                id="price"
                                label="Price"
                                icon={FaRupeeSign}
                                register={register}
                                validation={{ required: 'Price is required' }}
                                error={errors.price}
                                watch={watch}

                                inputProps={{
                                    onInput: (e) => {
                                        e.target.value = e.target.value.replace(/[^0-9.]/g, '');
                                    },
                                }}
                            />

                            <FormInput
                                id="prepTime"
                                label="Preparation Time(in min)"
                                icon={FaRegClock}
                                register={register}
                                validation={{ required: 'Time is required' }}
                                error={errors.prepTime}
                                watch={watch}

                                inputProps={{
                                    onInput: (e) => {
                                        e.target.value = e.target.value.replace(/[^0-9]/g, '');
                                    },
                                }}
                            />

                            <FormInput
                                id="quantity"
                                label="Quantity"
                                icon={FaHashtag}
                                register={register}
                                validation={{ required: 'Quantity is required' }}
                                watch={watch}

                                error={errors.quantity}
                                inputProps={{
                                    onInput: (e) => {
                                        e.target.value = e.target.value.replace(/[^A-Za-z0-9. ]/g, '');
                                      }
                                      
                                }}
                            />

                        </div>
                        <TypeRadio
                            register={register}
                            setValue={setValue}
                            error={errors.type}
                            watch={watch}
                        />


                        {/* <div>
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
                        </div> */}
                        <ItemCategory
                            value={watch('cuisine')} // react-hook-form
                            onChange={(val) => setValue('cuisine', val, { shouldValidate: true })}
                            error={errors.cuisine?.message}
                        />

                        <div className="p-4 shadow-lg rounded-lg w-full bg-white border border-gray-300">
                            <h1 className="text-md lg:text-2xl font-medium mb-2 text-gray uppercase">Select Category</h1>
{/* import { useState } from "react"; */}

<Controller
  name="category"
  control={control}
  rules={{ required: 'Category is required' }}
  render={({ field }) => {
    // const [isOpen, setIsOpen] = useState(false);

    return (
      <div className="relative w-full">
        <select
          {...field}
          onClick={() => setIsOpen(prev => !prev)}
        //   onBlur={() => setIsOpen(false)}
          className="w-full appearance-none px-4 py-2 border rounded-md bg-white pr-10"
        >
          <option value="">-- Select Category --</option>
          {categories.map((cat, i) => (
            <option key={i} value={cat?.cat_id}>
              {cat?.title}
            </option>
          ))}
        </select>

        {/* Arrow icon with dynamic rotate */}
        <span className="pointer-events-none absolute right-3 top-1/2 transform -translate-y-1/2">
          <svg
            className={`w-4 h-4 text-gray-600 transition-transform duration-300 ${
              isOpen ? "rotate-180" : "rotate-0"
            }`}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </div>
    );
  }}
/>



                            {errors.category && (
                                <p className="text-red text-sm mt-1">
                                    {errors.category.message}
                                </p>
                            )}



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
                                            if (/^[a-zA-Z\s]*$/.test(val)) setNewCategory(val);
                                          }}
                                          
                                        placeholder="Add new category"
                                        className="flex-1 px-3 py-2 border rounded-lg"
                                    />
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={handleAddCategory}
                                            disabled={!newCategory.trim()}
                                            className="bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                                        >
                                            Add
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setNewCategory('');
                                                setShowCategoryInput(false);
                                            }}
                                            className="p-2 bg-gray-400 rounded-lg text-white hover:bg-gray-200"
                                            title="Cancel"
                                        >
                                            {/* <FaTimes className="text-gray-500 w-4 h-4" />
                                             */}
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className='flex border-1 flex-col gap-4 border-gray-300 bg-white rounded-lg p-4 shadow-lg '>
                        {selectedVendorId && (
  <FormInput
    id="priceMultiplier"
    label="Price Multiplier"
    register={register}
    validation={{
      required: 'Price multiplier is required',
      validate: (val) =>
        parseFloat(val) >= 1 && parseFloat(val) <= 2 || "Must be between 1 and 2"
    }}
    error={errors.priceMultiplier}
    watch={watch}
    inputProps={{
      onInput: (e) => {
        e.target.value = e.target.value.replace(/[^0-9.]/g, '');
      },
    }}
  />
                            )}
                            

                        <div className="relative w-full   col-span-2 ">
              <textarea
                id="note"
                rows={3}
                {...register("note")}
                placeholder="Enter any note (optional)"
                className="peer w-full border border-gray-300 rounded-lg bg-white text-gray-800  p-3 placeholder-transparent focus:outline-none focus:border-green transition-all resize-none"
              />
              <label
                htmlFor="note"
                className="absolute left-3 -top-2.5 text-sm bg-white text-gray-500 font-semibold transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-gray-500 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:font-semibold"
              >
                Note (optional)
              </label>
                            </div>
                            </div>


                        <ImageUploader
                            previewImage={previewImage}
                            setPreviewImage={setPreviewImage}
                            fileInputRef={fileInputRef}
                            register={register}
                            onChange={handleImageChange}
                        />
                        

                    </form>
                    <div className='fixed bottom-20 w-full max-w-2xl md:px-4 px-2'>
                    <button
                             onClick={() => {
                                if (formRef.current) formRef.current.requestSubmit(); // ✅ triggers native submit
                              }}
                            // disabled={!isFormChanged || loading || !isValid}
                            className={`flex-1  rounded-[8px] h-11 flex items-center justify-center font-bold  text-white text-lg shadow-lg hover:shadow-xl transition-all w-full duration-300 hover:scale-[1.02] disabled:bg-orange/50 disabled:cursor-not-allowed disabled:opacity-70 disabled:text-white  
    ${!isFormChanged || loading || !isValid
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-gradient-to-br from-orange via-yellow cursor-pointer active:scale-95 to-orange"
                                }`}
                        >
                            {isEditMode ? "Update Item" : "Add Item"}
                        </button>
                    </div>
                    {/* class="flex-1 bg-gradient-to-br from-orange via-yellow cursor-pointer active:scale-95 to-orange text-white customRadius h-11 flex items-center justify-center font-bold text-lg shadow-lg hover:shadow-xl transition-all w-full duration-300 hover:scale-[1.02] disabled:bg-orange/50 disabled:cursor-not-allowed disabled:opacity-70 disabled:text-white " */}
                
                </div>
                {catLoader && <TransparentLoader />}
                <BottomNav />
            </div>
            
        </div>
    );
};

export default AddEditItem;