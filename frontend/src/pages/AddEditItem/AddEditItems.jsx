import React, { useState, useRef, useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  FaUtensils,
  FaRupeeSign,
  FaRegClock,
  FaHashtag,
  FaTimes,
} from "react-icons/fa";
import FormInput from "../../components/FormInput";
import TypeRadio from "../../components/TypeRadio";
import ImageUploader from "../../components/ImageUploader";
import Header from "../../components/Header";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../context/authContext";
import { toast } from "react-hot-toast"; // ya tum jahan se use kar rahe ho
import { supabase } from "../../utils/supabaseClient";
import { v4 as uuidv4 } from "uuid";
import BottomNav from "../../components/Footer";
import ItemCategory from "../../components/ItemCategory";
import {
  MESSAGES,
  ITEM_DEFAULTS,
  SELECTED_COLUMN,
} from "../../utils/vendorConfig";
import {
  SUPABASE_TABLES,
  BUCKET_NAMES,
  ITEM_FIELDS,
} from "../../utils/constants/Table&column";
import { useNavigate } from "react-router-dom";
import Loader from "../../components/Loader";
import { useFetch } from "../../context/FetchContext";
import { uploadFile } from "../../utils/uploadFile";
import TransparentLoader from "../../components/Transparentloader";
// import Navbar from './Navbar';

const AddEditItem = ({ defaultValues = {}, onSubmitSuccess }) => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [selectedType, setSelectedType] = useState();
  // const [cuisines,setCuisines]=useState([])
  const [showCategoryInput, setShowCategoryInput] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [catLoader, setCatLoader] = useState(false);
  const categoryInputRef = useRef(null);
  const { vendorProfile, selectedVendorId, session } = useAuth();
  const vendorId = vendorProfile?.v_id || selectedVendorId; // ✅ fallback
  const fileInputRef = useRef();
  const navigate = useNavigate();
  const location = useLocation();
  const itemData = location.state?.itemData || null;
  const isEditMode = itemData !== null;
 
  const { fetchItems } = useFetch();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    getValues,
    trigger,
    formState: { errors, isValid },
  } = useForm({
    mode: "onChange", // ✅ Validation trigger on change
    defaultValues: {
      itemName: "",
      quantity: "",
      price: "",
      prepTime: "",
      category: "",
      cuisine: [],
      type: null,
      priceMultiplier: "1.5",
    },
  });

  const watchedFields = watch();


  useEffect(() => {
    if (!vendorId) return; // ⛔ Don't run until v_id is available
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from(SUPABASE_TABLES?.ITEM_CATEGORY_BY_VENDOR)
        .select("*")
        .eq(ITEM_FIELDS?.VENDOR_ID, vendorId); // ✅ correct eq syntax

      if (error) {
        toast.error(MESSAGES?.FETCH_FAIL);
      } else {
        setCategories(data);
      }
    };
    fetchCategories();
  }, [vendorId]); // ✅ include vendor_id as dependency

  useEffect(() => {
    register("cuisine", {
      required: "Cuisine is required",
    });
  }, [register]);

  const isFormChanged = useMemo(() => {
    if (!itemData) return true;

    const hasTextChanged =
      watchedFields.itemName !== itemData.item_name ||
      watchedFields.quantity !== itemData.item_quantity?.toString() || // ✅ "15" === "15"
      watchedFields.price !== itemData.item_price?.toString() || // ✅ "125" === "125"
      watchedFields.prepTime !== itemData.prep_time?.toString() || // ✅ "20" === "20"
      watchedFields.category !== itemData.vendor_created_category_id ||
      JSON.stringify(watchedFields.cuisine || []) !==
        JSON.stringify(itemData.item_category_id || []) ||
      watchedFields.type !== (itemData.veg ? "veg" : "nonveg") ||
      (selectedVendorId &&
        watchedFields.priceMultiplier !==
          itemData.price_multiplier?.toString()); // ✅ add ||
   

    const hasImageChanged =
      (previewImage && typeof previewImage === "object") || // ✅ new image uploaded
      (!previewImage && itemData.img_url && itemData.img_url !== "NA"); // ✅ image removed (was present earlier)

    return hasTextChanged || hasImageChanged;
  }, [watchedFields, previewImage, itemData]);


  const handleAddCategory = async () => {
    const trimmed = newCategory.trim();
    if (!trimmed) {
      return toast.error(MESSAGES.EMPTY_CATEGORY);
    }
    setCatLoader(true);

    // Check if category already exists (case-insensitive)
    const { data: existing, error: checkError } = await supabase
      .from(SUPABASE_TABLES?.ITEM_CATEGORY_BY_VENDOR)
      .select(SELECTED_COLUMN?.ALL)
      .ilike("title", trimmed)
      .eq("vendor_id", vendorId); // ✅ vendor-specific check

    if (checkError) {
      toast.error(MESSAGES.CHECK_FAIL);
      return;
    }

    if (existing.length > 0) {
      toast.error(MESSAGES.CATEGORY_EXISTS);
      setCatLoader(false);
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
        },
      ])
      .select();

    // toast.dismiss(toastId);

    if (error) {
      setCatLoader(false);
      toast.error(MESSAGES.CATEGORY_ADD_FAIL);
      return;
    }

    const addedCat = {
      ...data[0],
      title: data[0].title.toUpperCase(), // force uppercase for consistency
    };

    // ✅ Update categories first
    setCategories((prev) => [...prev, addedCat]);

    // ✅ Then set value in form (ensure it matches dropdown <option value>)
    setValue("category", addedCat.cat_id, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });

    // ✅ Manually trigger validation
    await trigger("category");
    setCatLoader(false);
    toast.success(MESSAGES.CATEGORY_ADDED);

    setNewCategory("");
    setShowCategoryInput(false);
  };

  useEffect(() => {
    if (isEditMode && itemData) {
      reset({
        itemName: itemData?.item_name || "",
        quantity: itemData.item_quantity?.toString() || "",
        price: itemData.item_price?.toString() || "",
        prepTime: itemData.prep_time?.toString() || "",
        category: itemData.vendor_created_category_id || "",
        cuisine: Array.isArray(itemData.item_category_id)
          ? itemData.item_category_id
          : JSON.parse(itemData?.item_category_id || "[]"),
        type: itemData.veg ? "veg" : "nonveg",
        note:
          itemData.item_description === "NA"
            ? ""
            : itemData.item_description || "",
        priceMultiplier: selectedVendorId
          ? itemData.price_multiplier?.toString() || ""
          : "", // 🆕 only if vendor is self
      });

      if (itemData.img_url && itemData.img_url !== "NA") {
        setPreviewImage(itemData.img_url); // ✅ Real image
      } else {
        setPreviewImage(null); // ✅ No image, so set null
      }

      setSelectedType(itemData.veg ? "veg" : "nonveg");
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
        oldVal = Array.isArray(oldVal)
          ? oldVal.sort().join(",")
          : String(oldVal);
        newVal = Array.isArray(newVal)
          ? newVal.sort().join(",")
          : String(newVal);
      } else {
        oldVal =
          oldVal !== null && oldVal !== undefined ? String(oldVal).trim() : "";
        newVal =
          newVal !== null && newVal !== undefined ? String(newVal).trim() : "";
      }

      // ✅ Skip if they are same
      if (oldVal === newVal) continue;

      // 🧹 Optional rule: NA vs "" → treat as same
      if (
        (oldVal === "NA" && newVal === "") ||
        (oldVal === "" && newVal === "NA")
      )
        continue;

      changed[key] = {
        before: oldVal,
        after: newVal,
      };
    }

    return changed;
  };

  const generateChangeDescription = (changes) => {
    return Object.entries(changes)
      .map(
        ([key, value]) =>
          `${key} changed from "${value.before}" to "${value.after}"`
      )
      .join(", ");
  };

  const refs = {
    itemName: useRef(),
    quantity: useRef(),
    price: useRef(),
    prepTime: useRef(),
    category: useRef(),
    cuisine: useRef(),
    type: useRef(),
  };

  const scrollToRef = (ref) => {
    if (ref?.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "center" });
      ref.current.focus?.();
    } else {
    }
  };

  const onSubmit = async (data) => {
  

    if (isEditMode && !isFormChanged) {
      toast.error("No updates found!");
      return;
    }

    try {
      setLoading(true);

      const typeBool = data.type === "veg";

      const itemFields = {
        item_name: data?.itemName.trim(),
        prep_time: parseInt(data.prepTime.trim()),
        item_price: data?.price.trim(),
        item_quantity: data?.quantity.trim(),
        veg: typeBool,
        vendor_created_category_id: data?.category,
        item_category_id: data.cuisine,
        item_description: data?.note?.trim() || "",
      };

      if (selectedVendorId) {
        itemFields.price_multiplier = parseFloat(data?.priceMultiplier);
      }

      let imageUrl = itemData?.img_url || null;

      if (previewImage === null) {
        imageUrl = "NA";
      } else if (typeof previewImage !== "string") {
        imageUrl = await uploadFile(
          previewImage,
          BUCKET_NAMES.ITEM_IMG,
          itemFields?.item_name || "unknown"
        );
      }

      itemFields.img_url = imageUrl;

      let response;
      if (isEditMode) {
        const updatePayload = {
          ...itemFields,
          updated_at: new Date(),
        };

        response = await supabase
          .from(SUPABASE_TABLES?.ITEM)
          .update(updatePayload)
          .eq("item_id", itemData.item_id);
      } else {
        const insertPayload = {
          ...itemFields,
          item_id: uuidv4(),
          vendor_id: vendorId,
          created_at: new Date(),
          updated_at: new Date(),
        };


        response = await supabase
          .from(SUPABASE_TABLES?.ITEM)
          .insert([insertPayload]);
      }

      const { error } = response;
      if (error) {
        toast.error(isEditMode ? "Item update failed!" : "Item save failed!");
      } else {
        toast.success(
          isEditMode ? "Item updated successfully!" : "Item saved successfully!"
        );

        if (selectedVendorId) {
          const {
            data: { user: currentUser },
          } = await supabase.auth.getUser();
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
        navigate("/manage-items");
        onSubmitSuccess?.();
      }
    } catch (err) {
      toast.error("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  const handleValidateAndSubmit = async () => {
    const isValid = await trigger(); // ✅ validate all fields
    const value = getValues();

    if (!isValid) {
      // ⛳ Scroll to first invalid field
      if (!value.itemName?.trim()) return scrollToRef(refs.itemName);
      if (!value.quantity?.trim()) return scrollToRef(refs.quantity);
      if (!value.price?.trim()) return scrollToRef(refs.price);
      if (!value.prepTime?.trim()) return scrollToRef(refs.prepTime);
      if (!value.category) return scrollToRef(refs.category);
      if (!value.cuisine || value.cuisine.length === 0)
        return scrollToRef(refs.cuisine);
      if (!value.type) return scrollToRef(refs.type);
      return;
    }

    // ✅ If form is valid, trigger submit
    if (formRef.current) formRef.current.requestSubmit();
  };


  return (
    <div className="w-full  mx-auto flex justify-center">
      {loading && <Loader />}
      <div className="max-w-2xl w-full bg-gray-100    ">
        {/* <Header title={isEditMode ? 'Edit Item' : 'Add Item'} /> */}
        {/* <Navbar/> */}
        <div className="max-w-2xl w-full  pt-6  space-y-6 rounded-2xl   ">
          <form
            ref={formRef}
            onSubmit={handleSubmit(onSubmit)}
            className="w-full h-full  mx-auto md:px-6 mb-20  p-2 py-8 space-y-6   bg-gray-100"
          >
            <div className="flex flex-col gap-6 rounded-lg shadow-lg border-1 border-gray-300 bg-white   p-4">
              <h1 className="text-md md:text-2xl lg:text-2xl font-medium text-gray">
                ITEM DETAILS
              </h1>
              <FormInput
                id="itemName"
                label="Item Name"
                icon={FaUtensils}
                register={register}
                validation={{
                  required: "Item name is required",
                  maxLength: {
                    value: 40,
                    message: "Item name must be at most 40 characters",
                  },
                }}
                error={errors.itemName}
                watch={watch}
                inputProps={{
                  onInput: (e) => {
                    e.target.value = e.target.value.replace(/[^A-Za-z\s]/g, "");
                  },
                }}
              />

              <FormInput
                id="price"
                label="Price"
                icon={FaRupeeSign}
                register={register}
                validation={{ required: "Price is required" }}
                error={errors.price}
                watch={watch}
                inputProps={{
                  onInput: (e) => {
                    let value = e.target.value.replace(/[^0-9.]/g, "");
                    // Convert to number and limit to 9999
                    if (parseFloat(value) > 9999) {
                      value = "9999";
                    }
                    e.target.value = value;
                  },
                }}
              />

              <FormInput
                id="prepTime"
                label="Preparation Time(in min)"
                icon={FaRegClock}
                register={register}
                validation={{
                  required: "Time is required",
                  max: {
                    value: 180,
                    message: "Max preparation time is 180 minutes",
                  },
                }}
                error={errors.prepTime}
                watch={watch}
                inputProps={{
                  onInput: (e) => {
                    e.target.value = e.target.value.replace(/[^0-9]/g, "");
                  },
                }}
              />

              <FormInput
                id="quantity"
                label="Quantity"
                icon={FaHashtag}
                register={register}
                validation={{
                  required: "Quantity is required",
                  max: {
                    value: 50,
                    message: "Maximum quantity allowed is 50",
                  },
                }}
                watch={watch}
                error={errors.quantity}
                inputProps={{
                  onInput: (e) => {
                    // Allow only alphanumeric and space
                    e.target.value = e.target.value.replace(
                      /[^A-Za-z0-9. ]/g,
                      ""
                    );
                  },
                }}
              />
            </div>
            <div ref={refs.type}>
              <TypeRadio
                register={register}
                setValue={setValue}
                error={errors.type}
                watch={watch}
              />
            </div>

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
            <div ref={refs.cuisine}>
              <ItemCategory
                value={watch("cuisine")} // react-hook-form
                onChange={(val) =>
                  setValue("cuisine", val, { shouldValidate: true })
                }
                error={errors.cuisine?.message}
              />
            </div>

            <div className="p-4 shadow-lg rounded-lg w-full bg-white border border-gray-300">
              <h1 className="text-md lg:text-2xl font-medium mb-2 text-gray uppercase">
                Select Category
              </h1>
              {/* import { useState } from "react"; */}

              <Controller
                name="category"
                control={control}
                rules={{ required: "Category is required" }}
                render={({ field }) => {
                  // const [isOpen, setIsOpen] = useState(false);

                  return (
                    <div ref={refs.category} className="relative w-full">
                      <select
                        {...field}
                        onClick={() => setIsOpen((prev) => !prev)}
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
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19 9l-7 7-7-7"
                          />
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
                  <div className="flex-1">
                    <input
                      type="text"
                      value={newCategory}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (/^[a-zA-Z\s]*$/.test(val)) setNewCategory(val);
                      }}
                      placeholder="Add new category"
                      className={`w-full px-3 py-2 border rounded-lg ${
                        newCategory.length > 30 ? "border-red-500" : ""
                      }`}
                    />
                    {newCategory.length > 30 && (
                      <p className="text-red-500 text-xs mt-1">
                        Maximum 30 characters allowed
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleAddCategory}
                      disabled={!newCategory.trim() || newCategory.length > 30}
                      className={`px-4 py-2 rounded-lg text-white ${
                        !newCategory.trim() || newCategory.length > 30
                          ? "bg-orange-300 cursor-not-allowed"
                          : "bg-orange hover:bg-orange-700"
                      }`}
                    >
                      Add
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setNewCategory("");
                        setShowCategoryInput(false);
                      }}
                      className="p-2 bg-gray-400 rounded-lg text-white hover:bg-gray-500"
                      title="Cancel"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="flex border-1 flex-col gap-4 border-gray-300 bg-white rounded-lg p-4 shadow-lg ">
              {selectedVendorId && (
                <FormInput
                  id="priceMultiplier"
                  label="Price Multiplier"
                  register={register}
                  validation={{
                    required: "Price multiplier is required",
                    validate: (val) =>
                      (parseFloat(val) >= 1.5 && parseFloat(val) <= 2) ||
                      "Must be between 1.5 and 2",
                  }}
                  error={errors.priceMultiplier}
                  watch={watch}
                  inputProps={{
                    onInput: (e) => {
                      e.target.value = e.target.value.replace(/[^0-9.]/g, "");
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
          <div className="fixed bottom-20 w-full max-w-2xl md:px-4 px-2">
            <button
              type="button"
              onClick={handleValidateAndSubmit}
              disabled={loading}
              className={`flex-1 rounded-[8px] h-11 flex items-center justify-center font-bold text-white text-lg shadow-lg hover:shadow-xl transition-all w-full duration-300 hover:scale-[1.02] disabled:bg-orange/50 disabled:cursor-not-allowed disabled:opacity-70 disabled:text-white 
     ${
       !isFormChanged || loading || !isValid
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
