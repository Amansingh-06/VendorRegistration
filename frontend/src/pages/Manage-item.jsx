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
import { getChangedFields, generateChangeDescription } from '../utils/AdminLogs';



export default function ManageItemsPage() {
    const { items, setItems, loading } = useFetch();
    const { vendorProfile, selectedVendorId,session } = useAuth();
    const navigate = useNavigate();

    const [showModal, setShowModal] = useState(false);
    const [deleteItemId, setDeleteItemId] = useState(null);
    const [deleteItemName, setDeleteItemName] = useState("");
    const [multiplierValues, setMultiplierValues] = useState({});
    const [multiplierErrors, setMultiplierErrors] = useState({});
    const [loadingItemId, setLoadingItemId] = useState(null);




    // ✅ Toggle Availability
    const toggleAvailability = async (id, currentValue) => {
        const oldItems = [...items];
        const targetItem = oldItems.find(item => item.item_id === id);
      
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
          setItems(oldItems);
        } else if (selectedVendorId) {
          const { data: { user: currentUser } } = await supabase.auth.getUser();
      
          const newItemData = { ...targetItem, available: !currentValue };
          const changes = getChangedFields(targetItem, newItemData);
      
          if (Object.keys(changes).length > 0) {
            const description = `Item "${targetItem.item_name}" availability toggled for vendor ID ${selectedVendorId}. Changes: ${generateChangeDescription(changes)}`;
      
            await supabase.from("admin_logs").insert([
              {
                log_id: crypto.randomUUID(),
                admin_id: currentUser.id,
                title: "Toggled Availability",
                description,
                timestamp: new Date(),
              },
            ]);
          }
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
        const deletedItem = oldItems.find(item => item.item_id === deleteItemId);
      
        setItems(prev => prev.filter(item => item.item_id !== deleteItemId));
      
        const { error } = await supabase
          .from('item')
          .update({ is_deleted: true })
          .eq('item_id', deleteItemId);
      
        if (error) {
          console.error("Delete failed:", error.message);
          setItems(oldItems);
        } else if (selectedVendorId) {
          const { data: { user: currentUser } } = await supabase.auth.getUser();
      
          const description = `Item "${deletedItem?.item_name}" was deleted for vendor ID ${selectedVendorId}.`;
      
          await supabase.from("admin_logs").insert([
            {
              //   log_id: crypto.randomUUID(),
              admin_id: session?.user?.id,
              title: "Deleted Item",
              description,
              timestamp: new Date(),
            },
          ]);
        }
      
        setShowModal(false);
        setDeleteItemId(null);
        setDeleteItemName("");
      };
      
    console.log(items)
 

      
    

  
  
  
  
  

      
      
    return (
        <section >
            <div className="max-w-2xl mx-auto rounded-2xl shadow-lg">
                {/* <Header title='Manage-item' /> */}

                {loading && (
                    <div className='w-full flex justify-center items-center'>
                        <Loader />
                    </div>
                )}

                <div className='max-w-2xl md:px-6 py-8 mt-7 px-2    bg-gray-100  shadow-lg min-h-[86vh]  pb-27 relative'>
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
                            className="text-red-600 group-hover/btn:scale-110 transition-transform duration-200 w-[15px] h-[15px] lg:w-[18px] lg:h-[18px]"
                            />
                                        </button>
                                    </div>
                                </div>




                                
                            </div>
                            
                        ))}
                        
                       
            </div>
           
          </div>
      {/* Floating Add Item Button - Fixed at Bottom Right */}
      <div className="fixed bottom-18 right-4 sm:right-6 md:right-15 lg:right-49 lg:bottom-18 xl:right-110 xl:bottom-18 z-50">
  <div className="flex flex-col items-center gap-2">
    <button
      className="w-14 h-14 sm:w-16 sm:h-16 bg-orange-500 hover:bg-orange-600 text-white rounded-full flex items-center justify-center shadow-lg text-xl md:text-2xl cursor-pointer"
      aria-label="Add Item"
      onClick={() => navigate('/add-items')}
    >
      <FaPlus />
    </button>
    <span className="text-[11px] sm:text-xs md:text-sm text-orange font-medium">Add Item</span>
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
