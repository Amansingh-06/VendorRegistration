import { useState } from 'react';
import { FaPlus, FaEdit } from 'react-icons/fa';
import Header from '../components/Header';
import Switch from '@mui/material/Switch';
import BottomNav from '../components/Footer';
import { useFetch } from '../context/FetchContext';
import Loader from '../components/Loader';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import { supabase } from '../utils/supabaseClient';
export default function ManageItemsPage() {
    const { items,setItems, loading, error,fetchItems } = useFetch();
    const {vendorProfile}= useAuth()
 const navigate=useNavigate()

    const toggleAvailability = async (id, currentValue) => {
        // Step 1: Optimistic UI update
        setItems(prevItems =>
            prevItems.map(item =>
                item.item_id === id ? { ...item, available: !currentValue } : item
            )
        );

        // Step 2: Update only availability in Supabase
        const { error } = await supabase
            .from('item')
            .update({ available: !currentValue })
            .eq('item_id', id);

        if (error) {
            console.error("Update failed:", error.message);

            // Revert change in case of error (optional)
            setItems(prevItems =>
                prevItems.map(item =>
                    item.item_id === id ? { ...item, available: currentValue } : item
                )
            );
        }
    };


    console.log(items)
    console.log(vendorProfile)

    return (
        <section className="bg-gray-100 min-h-screen   md:px-0">
            <div className="max-w-2xl mx-auto rounded-2xl  shadow-lg ">
                {/* Header */}
                
                <Header title='Manage-item' />
                
                {/* Loader */}
                {loading && (
                    <div className='w-full  flex justify-center items-center'>
                        <Loader />
                    </div>
                )}
               
                
                <div className='max-w-2xl px-6 py-8 shadow-lg min-h-screen rounded-2xl pb-20'>

                  
                    
                    {/* Items List */}
                    <div className="grid gap-6">
                        {items.length === 0 && (
                            <p className="text-gray-500 text-lg text-center">
                                No items found. Please add an item.
                            </p>
                        )}

                      
                        {items?.map((item) => (
                            <div
                                key={item.item_id}
                                className="relative bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-all"
                            >
                                {/* Toggle Switch - Top Right */}
                                {/* Toggle Badge - Top Right */}
                                <div className="absolute top-4 right-4 flex items-center gap-2 bg-gray-100 rounded-full md:px-3 px-1 py-1 shadow-sm">
                                    <Switch
                                        checked={item.available}
                                        onChange={() => toggleAvailability(item.item_id,item.available)}
                                        size="small"
                                        color="success"
                                    />
                                    <span className={`text-xs font-semibold ${item.available ? 'text-green-600 px-2' : 'text-gray-500 px-.5'}`}>
                                        {item.available ? 'Available' : 'Unavailable'}
                                    </span>
                                </div>


                                <div className="flex flex-col sm:flex-row items-start gap-4">
                                    <div className='w-24 h-24 rounded border-dashed p-1 border-orange border-1'>
                                    {/* Image */}
                                    <img src={item?.img_url} alt={item?.item_name} className="w-full h-full rounded-lg object-cover" />
                                </div>

                                    {/* Item Content */}
                                    <div className="flex-1 space-y-1">
                                        <h3 className="text-lg font-semibold text-gray-800">{item?.item_name}</h3>
                                        <p className="text-gray-600 text-sm">Quantity: {item?.item_quantity}</p>
                                        <p className="text-gray-600 text-sm">Prep Time: {item?.prep_time}</p>
                                        <p className="text-gray-800 text-sm font-medium">Price: {item?.item_price}</p>
                                    </div>

                                    {/* Edit Button - Bottom Right */}
                                    <div className="mt-2 sm:mt-auto sm:ml-auto">
                                        <button onClick={() => navigate('/add-items', { state: { itemData: item } })} className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm md:text-base font-medium">
                                            <FaEdit />
                                            <span>Edit</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    
</div>
                
                <BottomNav/>
            </div>

            {/* Floating Add Button */}
            <button
                className="fixed bottom-20 right-3 md:bottom-10 md:right-10 w-12 h-12 md:w-14 md:h-14 bg-orange-500 hover:bg-orange-600 text-white rounded-full flex items-center justify-center shadow-lg text-xl md:text-2xl z-50 cursor-pointer"
                aria-label="Add Item"
                onClick={()=>navigate('/add-items')}
            >
                <FaPlus />
            </button>
        </section>
    );
}
