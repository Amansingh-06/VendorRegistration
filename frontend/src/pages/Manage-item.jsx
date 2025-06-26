import { useState } from 'react';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import Header from '../components/Header';
import Switch from '@mui/material/Switch';
import BottomNav from '../components/Footer';
import { useFetch } from '../context/FetchContext';
import Loader from '../components/Loader';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import { supabase } from '../utils/supabaseClient';

export default function ManageItemsPage() {
    const { items, setItems, loading } = useFetch();
    const { vendorProfile } = useAuth();
    const navigate = useNavigate();

    const [showModal, setShowModal] = useState(false);
    const [deleteItemId, setDeleteItemId] = useState(null);
    const [deleteItemName, setDeleteItemName] = useState("");

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
    return (
        <section >
            <div className="max-w-2xl mx-auto rounded-2xl shadow-lg">
                {/* <Header title='Manage-item' /> */}

                {loading && (
                    <div className='w-full flex justify-center items-center'>
                        <Loader />
                    </div>
                )}

                <div className='max-w-2xl md:px-6 py-10 mt-12 px-4 bg-gray-100  shadow-lg min-h-[86vh] rounded-2xl pb-15 relative'>
                    <div className="grid gap-6">
                        {items.length === 0 && (
                            <p className="text-gray-500 text-lg text-center">
                                No items found. Please add an item.
                            </p>
                        )}

                        {items?.map((item) => (
                            <div
                                key={item.item_id}
                                className="relative bg-white border-gray-300 border-1 rounded-2xl shadow-md p-4 hover:shadow-lg transition-all"
                            >
                                <div className="absolute top-4 right-4 flex items-center gap-2 bg-gray-100 rounded-full md:px-3 px-1 py-1 shadow-sm">
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

                                <div className="flex flex-col sm:flex-row items-start gap-4">
                                    <div className='w-24 h-24 rounded border-dashed p-1 border-orange border-1'>
                                        <img
                                            src={item?.img_url && item.img_url !== "NA" ? item.img_url : "/public/defaultItem.jpeg"}
                                            alt={item?.item_name || "Preview"}
                                            className="w-full h-full rounded-lg object-cover"
                                        />
                                    </div>

                                    <div className="flex-1 space-y-1">
                                        <h3 className="text-lg font-semibold text-gray-800">{item?.item_name}</h3>
                                        <p className="text-gray-600 text-sm">Quantity: {item?.item_quantity}</p>
                                        <p className="text-gray-600 text-sm">Prep Time: {item?.prep_time}min</p>
                                        <p className="text-gray-800 text-sm font-medium">Price: {item?.item_price}</p>
                                    </div>

                                    <div className="mt-2 mr-10 sm:mt-auto sm:ml-auto flex flex-col gap-2 items-start">
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
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div>
                        <button
                                className="fixed   bottom-20 md:bottom-20 lg:right-110 md:right-20 right-10 w-12 h-12 md:w-14 md:h-14 bg-orange-500 hover:bg-orange-600 text-white rounded-full flex items-center justify-center shadow-lg text-xl md:text-2xl z-30 cursor-pointer"
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
                            Are you sure you want to delete <strong>{deleteItemName}</strong>?
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
