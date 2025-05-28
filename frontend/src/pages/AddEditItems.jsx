import React, { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Upload, Clock, X } from 'lucide-react';
import { AiOutlinePlus } from 'react-icons/ai';
import { FaUtensils, FaTags, FaRupeeSign, FaHashtag, FaRegClock } from 'react-icons/fa';
import Header from '../components/Header';
import { GiKnifeFork } from "react-icons/gi";

const AddEditItem = () => {
    const [showCategoryInput, setShowCategoryInput] = useState(false);
    const categoryInputRef = useRef(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const onSubmit = (data) => {
        console.log(data);
    };

    return (
        <motion.form
            onSubmit={handleSubmit(onSubmit)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-2xl w-full mx-auto px-6 py-8 bg-white rounded-2xl shadow-lg font-poppins space-y-8"
        >
            {/* <h2 className="text-2xl font-bold text-gray-800">📝 Add or Edit Item</h2> */}
            <Header title='📝 Add Item' />

            <div className="grid gap-8">
                {/* Item Name */}
                <div className="relative">
                    <FaUtensils className="absolute left-3 top-4 text-black text-md" />
                    <input
                        id="itemName"
                        {...register("itemName", { required: true })}
                        type="text"
                        placeholder="Item Name"
                        className="peer w-full pl-10 pr-3 py-3 rounded-md border border-gray-300 focus:border-orange-500 focus:outline-none placeholder-transparent"
                    />
                    <label
                        htmlFor="itemName"
                        className="absolute left-10 -top-2.5 text-sm bg-white text-black  transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-gray-500 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:font-semibold peer-not-placeholder-shown:font-semibold"
                    >
                        Item Name
                    </label>
                </div>

                {/* Cuisine */}
                <div className="relative">
                    <GiKnifeFork className="absolute left-3 top-4 text-black font-semibold text-md pointer-events-none" />

                    <select
                        {...register("cuisine", { required: true })}
                        className="w-full px-9 py-3 rounded-md border border-gray-300 text-black focus:outline-none focus:border-orange"
                    >
                        <option value="">Select Cuisine</option>
                        <option value="Indian">Indian</option>
                        <option value="Chinese">Chinese</option>
                        <option value="Italian">Italian</option>
                    </select>

                    <label className="absolute left-9 -top-2.5 text-sm bg-white px-1 text-black font-semibold">
                        Cuisine
                    </label>
                </div>

                {/* Quantity */}
                <div className="relative">
                    <FaHashtag className="absolute left-3 top-4 text-black text-md" />
                    <input
                        id="quantity"
                        {...register("quantity")}
                        type="number"
                        placeholder="Quantity (optional)"
                        className="peer w-full pl-10 pr-3 py-3 rounded-md border border-gray-300 focus:outline-none focus:border-orange placeholder-transparent"
                    />
                    <label
                        htmlFor="quantity"
                        className="absolute left-10 -top-2.5 text-sm bg-white text-black  transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-gray-500 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:font-semibold peer-not-placeholder-shown:font-semibold"
                    >
                        Quantity (optional)
                    </label>
                </div>

                {/* Price */}
                <div className="relative">
                    <FaRupeeSign className="absolute left-3 top-4 text-black text-md" />
                    <input
                        id="price"
                        {...register("price", { required: true })}
                        type="text"
                        placeholder="Price"
                        className="peer w-full pl-10 pr-3 py-3 rounded-md border border-gray-300 focus:outline-none focus:border-orange placeholder-transparent"
                    />
                    <label
                        htmlFor="price"
                        className="absolute left-10 -top-2.5 text-sm bg-white text-black  transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-gray-500 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:font-semibold peer-not-placeholder-shown:font-semibold"
                    >
                        Price
                    </label>
                </div>

                {/* Preparation Time */}
                <div className="relative">
                    <FaRegClock className="absolute left-3 top-4 text-black text-md" />
                    <input
                        id="prepTime"
                        {...register("prepTime", { required: true })}
                        type="text"
                        placeholder="Preparation Time"
                        className="peer w-full pl-10 pr-3 py-3 rounded-md border border-gray-300 focus:outline-none focus:border-orange placeholder-transparent"
                    />
                    <label
                        htmlFor="prepTime"
                        className="absolute left-10 -top-2.5 text-sm bg-white text-black  transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-gray-500 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:font-semibold peer-not-placeholder-shown:font-semibold"
                    >
                        Preparation Time
                    </label>
                </div>

                {/* Type */}
                <div className="flex items-center gap-6 mt-2">
                    <label className="flex items-center gap-2 text-sm">
                        <input type="radio" value="veg" {...register("type")} className="accent-green w-5 h-5" />
                        Veg
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                        <input type="radio" value="nonveg" {...register("type")} className="accent-red w-5 h-5" />
                        Non-Veg
                    </label>
                </div>
            </div>

            {/* Category Section */}
            <div>
                <select {...register("category")} className="border border-gray-300 px-4 py-3 rounded-md w-full text-black focus:outline-none focus:border-orange">
                    <option value="">Select Category (optional)</option>
                </select>

                <div className="flex items-center gap-2 mt-3">
                    <AiOutlinePlus
                        onClick={() => {
                            setShowCategoryInput(true);
                            setTimeout(() => categoryInputRef.current?.focus(), 0);
                        }}
                        className="text-blue-600 text-2xl cursor-pointer"
                    />
                    <span className="text-sm text-gray-700">Add new category</span>
                </div>

                {showCategoryInput && (
                    <div className="relative mt-3">
                        <FaTags className="absolute left-3 top-3.5 text-gray-500 text-md" />
                        <input
                            ref={categoryInputRef}
                            type="text"
                            placeholder="Add New Category"
                            className="peer w-full pl-10 pr-3 py-3 rounded-md border border-gray-300 focus:outline-none focus:border-orange placeholder-transparent"
                        />
                        <label
                            onClick={() => categoryInputRef.current?.focus()}
                            className="absolute left-10 -top-2.5 text-sm bg-white text-black  transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-gray-500 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:font-semibold peer-not-placeholder-shown:font-semibold"
                        >
                            Add New Category
                        </label>

                        <div className="flex justify-end gap-2 mt-2">
                            <button
                                onClick={() => setShowCategoryInput(false)}
                                className="px-3 py-1 border text-sm rounded-md text-gray-600 border-gray-300 hover:bg-gray-100"
                            >
                                Close
                            </button>
                            <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700">
                                Add
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Image Upload */}
            <div className="grid md:grid-cols-2 gap-4 mt-4">
                <div className="relative border-2 border-dashed border-gray-400 rounded-md p-4 flex items-center justify-center text-sm text-gray-500 cursor-pointer h-40">
                    <img
                        src="https://images.unsplash.com/photo-1694923450868-b432a8ee52aa?q=80&w=1972&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                        alt="Dummy"
                        className="object-contain h-full w-full"
                    />
                    <X className="absolute top-2 right-2 w-4 h-4 text-red-500 cursor-pointer" />
                </div>

                <label className="border p-4 rounded-md flex items-center bg-green justify-center cursor-pointer transition">
                    <Upload className="w-5 h-5 mr-2" />
                    Upload Photo
                    <input type="file" className="hidden" {...register("image")} />
                </label>
            </div>

            {/* Submit */}
            <div className="pt-4">
                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition"
                >
                    Add Item
                </button>
            </div>
        </motion.form>
    );
};

export default AddEditItem;
