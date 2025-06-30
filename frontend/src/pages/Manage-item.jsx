import { useState } from 'react';
import { FaPlus, } from 'react-icons/fa';
import { FiEdit } from "react-icons/fi";
import { FiTrash } from "react-icons/fi";


import Header from '../components/Header';
import Switch from '@mui/material/Switch';
import BottomNav from '../components/Footer';
import { useFetch } from '../context/FetchContext';
import Loader from '../components/Loader';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import { supabase } from '../utils/supabaseClient';
import { GiFruitBowl } from "react-icons/gi";
import { FaRegClock } from "react-icons/fa";
import { FaIndianRupeeSign } from "react-icons/fa6";
import { truncateLetters } from '../utils/vendorConfig';
import { toast } from 'react-hot-toast';



export default function ManageItemsPage() {
    const { items, setItems, loading } = useFetch();
    const { vendorProfile, selectedVendorId } = useAuth();
    const navigate = useNavigate();

    const [showModal, setShowModal] = useState(false);
    const [deleteItemId, setDeleteItemId] = useState(null);
    const [deleteItemName, setDeleteItemName] = useState("");
    const [multiplierValues, setMultiplierValues] = useState({});
    const [multiplierErrors, setMultiplierErrors] = useState({});
    const [loadingItemId, setLoadingItemId] = useState(null);




    // ✅ Toggle Availability
    const toggleAvailability = async (id, currentValue) => {
        setItems(prev =>
            prev.map(item =>
                item.item_id === id ? { ...item, available: !currentValue } : item
            )
        );

        const { error } = await supabase
            .from('item')
            .update({ available: !currentValue })
            .eq('item_id', id);

        if (error) {
            console.error("Update failed:", error.message);
            setItems(prev =>
                prev.map(item =>
                    item.item_id === id ? { ...item, available: currentValue } : item
                )
            );
        }
    };

    // ✅ Step 1: Show confirmation modal
    const confirmDelete = (id, name) => {
        setDeleteItemId(id);
        setDeleteItemName(name);
        setShowModal(true);
    };

    // ✅ Step 2: Perform delete
    const performDelete = async () => {
        const oldItems = [...items];
        setItems(prev => prev.filter(item => item.item_id !== deleteItemId));

        const { error } = await supabase
            .from('item')
            .update({ is_deleted: true })
            .eq('item_id', deleteItemId);

        if (error) {
            console.error("Delete failed:", error.message);
            setItems(oldItems);
        }

        setShowModal(false);
        setDeleteItemId(null);
        setDeleteItemName("");
    };
    console.log(items)
 const handleMultiplierChange = (itemId, value) => {
  setMultiplierValues((prev) => ({
    ...prev,
    [itemId]: value,
  }));

  // Clear error if valid
  if (value >= 1 && value <= 2) {
    setMultiplierErrors((prev) => ({
      ...prev,
      [itemId]: "",
    }));
  }
};

      
    
const handleAddPriceMultiplier = async (itemId) => {
    const inputValue = multiplierValues[itemId];
    const parsedValue = parseFloat(inputValue);
    const currentMultiplier = items.find((item) => item.item_id === itemId)?.price_multiplier;
  
    const isInvalid =
      inputValue === undefined ||
      inputValue === "" ||
      isNaN(parsedValue) ||
      parsedValue < 1 ||
      parsedValue > 2;
  
    const isSame = parsedValue === currentMultiplier;
  
    // ✅ First: If invalid input
    if (isInvalid) {
      setMultiplierErrors((prev) => ({
        ...prev,
        [itemId]: "Please enter a value between 1 and 2",
      }));
      return;
    }
  
    // ✅ Then: If same value
    if (isSame) {
      toast.dismiss();
      toast("No update found. Multiplier is unchanged.");
      return;
    }
  
    setLoadingItemId(itemId);
    const toastId = toast.loading("Updating price multiplier...");
  
    try {
      const { data, error } = await supabase
        .from("item")
        .update({ price_multiplier: parsedValue })
        .eq("item_id", itemId);
  
      if (error) throw error;
  
      // ✅ Update local items list
      setItems((prevItems) =>
        prevItems.map((item) =>
          item.item_id === itemId
            ? { ...item, price_multiplier: parsedValue }
            : item
        )
      );
  
      // ✅ Clear input and errors
      setMultiplierValues((prev) => ({ ...prev, [itemId]: undefined }));
      setMultiplierErrors((prev) => ({ ...prev, [itemId]: "" }));
  
      toast.dismiss(toastId);
      toast.success("Price multiplier updated successfully!");
    } catch (err) {
      console.error(err);
  
      setMultiplierErrors((prev) => ({
        ...prev,
        [itemId]: "Failed to update. Please try again.",
      }));
  
      toast.dismiss();
      toast.error("Failed to update price multiplier.");
    } finally {
      setLoadingItemId(null);
    }
  };
  
  
  
  
  

      
      
    return (
        <section >
            <div className="max-w-2xl mx-auto rounded-2xl shadow-lg">
                {/* <Header title='Manage-item' /> */}

                {loading && (
                    <div className='w-full flex justify-center items-center'>
                        <Loader />
                    </div>
                )}

                <div className='max-w-2xl md:px-6 py-8 mt-7 px-2   bg-gray-100  shadow-lg min-h-[86vh]  pb-15 relative'>
                    <div className="grid gap-6">
                        {items.length === 0 && (
                            <p className="text-gray-500 text-lg text-center">
                                No items found. Please add an item.
                            </p>
                        )}

                        {items?.map((item) => (
                            <div
                                key={item.item_id}
                                className="relative bg-white border-gray-300 border-1  rounded-lg flex flex-col justify-center shadow-md p-2 hover:shadow-lg transition-all"
                            >
                                {/* <div className="absolute top-4 right-4 flex items-center gap-2 bg-gray-100 rounded-full md:px-3 px-1 py-1 shadow-sm">
                                    <Switch
                                        checked={item.available}
                                        onChange={() => toggleAvailability(item.item_id, item.available)}
                                        size="small"
                                        color="success"
                                    />
                                    <span className={`text-xs font-semibold ${item.available ? 'text-green-600 px-2' : 'text-gray-500 px-.5'}`}>
                                        {item.available ? 'Available' : 'Unavailable'}
                                    </span>
                                </div> */}

                                <div className="flex flex-1 sm:flex-row items-start   gap-2">
                                    <div className=' rounded h-28  p-1 w-32    md:flex-1 '>
                                        <img
                                            src={item?.img_url && item.img_url !== "NA" ? item.img_url : "/public/defaultItem.jpeg"}
                                            alt={item?.item_name || "Preview"}
                                            className="w-full h-full rounded-lg object-cover"
                                        />
                                    </div>

                                    <div className="flex-1 flex flex-col    ">
                                    <div className="flex items-start   gap-1">
  {/* Badge Box with shadow and rounded-lg */}
  <div className="p-1 rounded-lg mt-1 shadow-lg bg-gray-100">
    <span
      className={`w-3 h-3 block rounded-full 
        ${item?.veg === true ? 'bg-green-600' : 'bg-red-600'}`}
    ></span>
  </div>

  {/* Item Name */}
                                            <h3 className="text-lg font-semibold text-gray-800">
                                                {truncateLetters(item?.item_name, 17)}
  </h3>
</div>

                                        <p className="text-gray-600  p-1 text-base flex items-center gap-1 "><GiFruitBowl/> <span className='text-gray-600 text-sm'>Quantity: {item?.item_quantity}</span></p>
                                        <p className="text-gray-600  p-1 text-sm flex items-center gap-1"><FaRegClock /> <span className='text-gray-600 text-sm'>Prep Time: {item?.prep_time}min</span></p>
                                        <p className="text-gray-600  p-1 text-sm flex items-center gap-1"> <FaIndianRupeeSign /> <span className='text-gray-600 text-sm'> Price: ₹{item?.item_price}</span></p>
                                    </div>

                                    {/* <div className="mt-2 mr-10 sm:mt-auto sm:ml-auto flex flex-col gap-2 items-start">
                                        <button
                                            onClick={() => navigate('/add-items', { state: { itemData: item } })}
                                            className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm md:text-base font-medium"
                                        >
                                            <FaEdit />
                                            <span>Edit</span>
                                        </button>

                                        <button
                                            onClick={() => confirmDelete(item.item_id, item.item_name)}
                                            className="flex items-center gap-1 text-red-500 hover:text-red-700 text-sm md:text-base font-medium"
                                        >
                                            <FaTrash />
                                            <span>Delete</span>
                                        </button>
                                    </div> */}
                                </div>
                                <div className=' flex justify-between py-3 gap-5 '>
<div className=" flex w-32   items-center  md:flex-0 gap-1 bg-gray-100 rounded md:px-3    shadow-sm">
                                    <Switch
                                        checked={item.available}
                                        onChange={() => toggleAvailability(item.item_id, item.available)}
                                        size="small"
                                        color="success"
                                    />
                                    <span className={`text-xs font-semibold ${item.available ? 'text-green-600 px-2' : 'text-gray-500 px-.5'}`}>
                                        {item.available ? 'Available' : 'Unavailable'}
                                    </span>
                                    </div>
                                    <div className=" sm:mt-auto sm:ml-auto flex  flex-1 justify-between md:justify-evenly  items-center ">
                                        <button
                                            onClick={() => navigate('/add-items', { state: { itemData: item } })}
                                            className="transition-all duration-300 transform hover: scale-98 p-2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-xl shadow-sm hover:shadow-md group/btn cursor-pointer"
                                        >
              <FiEdit
                              className="text-blue-600 group-hover/btn:scale-110 transition-transform duration-200 w-[12px] h-[12px] lg:w-[14px] lg:h-[14px]"
                            />                                            
                                        </button>

                                        <button
                                            onClick={() => confirmDelete(item.item_id, item.item_name)}
                                            className="transition-all duration-300 transform hover: scale-98 p-2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-xl shadow-sm hover:shadow-md group/btn cursor-pointer"
                                        >
                              <FiTrash
                            className="text-red-600 group-hover/btn:scale-110 transition-transform duration-200 w-[12px] h-[12px] lg:w-[14px] lg:h-[14px]"
                            />
                                        </button>
                                    </div>
                                </div>
{selectedVendorId && (
  <div className="flex flex-col w-full gap-1 mt-2">
    <div className="flex gap-2">
      <input
        type="number"
        placeholder="Price Multiplier"
        min="1"
        max="2"
        step="0.01"
        value={
            multiplierValues[item.item_id] !== undefined
              ? multiplierValues[item.item_id]
              : item.price_multiplier || ""
          }        onChange={(e) => handleMultiplierChange(item.item_id, e.target.value)}
        className={`border px-2 py-1 w-full  rounded-md ${
          multiplierErrors[item.item_id] ? "border-red-500" : "border-green-300"
        }`}
      />
     {(() => {
  const inputValue = multiplierValues[item.item_id];
  const parsedValue = parseFloat(inputValue);
  const currentMultiplier = item.price_multiplier;

  const isInvalid =
    inputValue === undefined ||
    inputValue === "" ||
    isNaN(parsedValue) ||
    parsedValue < 1 ||
    parsedValue > 2;

  const isSame = parsedValue === currentMultiplier;

  const isLoading = loadingItemId === item.item_id;

  const showErrorToast = () => {
    if (isInvalid) {
      toast("Please enter a value between 1 and 2");
    } else if (isSame) {
      toast("No update found. Multiplier is unchanged.");
    }
  };

  return (
    <button
      onClick={() => {
        if (isInvalid || isSame) {
          showErrorToast();
        } else {
          handleAddPriceMultiplier(item.item_id);
        }
      }}
      disabled={isLoading}
      className={`px-3 py-1 rounded-md text-white transition ${
        !isInvalid && !isSame
          ? "bg-green-600 hover:bg-green-700"
          : "bg-gray-400 cursor-not-allowed"
      }`}
    >
      {isLoading ? "Adding..." : "Add"}
    </button>
  );
})()}



    </div>
    {multiplierErrors[item.item_id] && (
      <p className="text-red-500 text-sm">{multiplierErrors[item.item_id]}</p>
    )}
  </div>
)}



                                
                            </div>
                            
                        ))}
                        <div>
                        <button
                                className="fixed   bottom-18 md:bottom-20 lg:right-110 md:right-20 right-4 w-10 h-10 md:w-14 md:h-14 bg-orange-500 hover:bg-orange-600 text-white rounded-full flex items-center justify-center shadow-lg text-xl md:text-2xl z-30 cursor-pointer"
                            aria-label="Add Item"
                            onClick={() => navigate('/add-items')}
                        >
                            <FaPlus />
                        </button>
                        </div>
                       
                    </div>
                </div>

                <BottomNav />
            </div>

            {/* Add Item Floating Button */}
     

            {/* Custom Confirmation Modal */}
            {showModal && (
                <div className="inset-0 z-50 backdrop-blur-sm bg-black/30 fixed flex justify-center p-5 items-center">
                    <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full text-center">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">
                            Delete Confirmation
                        </h2>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete <strong>{truncateLetters(deleteItemName, 17)}</strong>
                        </p>
                        <div className="flex justify-center gap-4">
                            <button
                                onClick={performDelete}
                                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl"
                            >
                                Yes, Delete
                            </button>
                            <button
                                onClick={() => setShowModal(false)}
                                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-xl"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
