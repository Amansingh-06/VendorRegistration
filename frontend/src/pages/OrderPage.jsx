import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useAuth } from '../context/authContext';
import { useVendorOrders } from '../hooks/useVendorOrders';
import OrderCard from '../components/OrderCard';
import Navbar from '../components/Navbar';
import BottomNav from '../components/Footer';
import ButtonGroup from '../components/FilterButton';
import {toast} from 'react-hot-toast'
const OrderPage = () => {
    const [active, setActive] = useState('All');
    // const { vendorProfile } = useAuth();
    const { vendorProfile, selectedVendorId ,session} = useAuth();
    const vendorId = vendorProfile?.v_id || selectedVendorId; // ✅ fallback

    const { orders, setOrders, refreshOrders } = useVendorOrders(vendorId, active);

    // Check user session on mount
    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                const isRegistered = session.user?.user_metadata?.isRegistered ?? false;
                console.log("✅ User is registered:", isRegistered);
            } else {
                console.log("❌ User not logged in");
            }
        };
        checkUser();
    }, []);
    console.log(session)

    // Refresh orders when filter changes or vendor is available
    useEffect(() => {
        if (vendorId && vendorProfile?.status === "verified") {
            refreshOrders(); // Uses vendorId + active filter
        }
    }, [active, vendorId, vendorProfile?.status, refreshOrders]);
    

    // Refresh full list after status update (instead of updating just one order)
    const handleRefreshOrder = async (orderId) => {
        const { data, error } = await supabase
            .from('orders')
            .select(`
                *,
                order_item (
                    *,
                    item (
                        *
                    )
                )
            `)
            .eq('order_id', orderId)
            .single();

        if (!error) {
            // ✅ TEMPORARY: If status is "accepted", assign dummy dp_id
            if (data.status === 'accepted') {
                await supabase
                    .from('orders')
                    .update({ dp_id: '43c6aeba-34e0-4ad7-9caf-9eb661b2e043' }) // 🟢 koi bhi ID yahan daal sakte ho
                    .eq('order_id', orderId);
            }

            await refreshOrders(); // ✅ Always refresh orders after update
        } else {
            console.error('Failed to refresh order:', error);
        }
    };
    
console.log("Vendor verified",vendorProfile?.status)
    return (
        <div className="flex flex-col items-center min-h-screen bg-white rounded-lg shadow-lg font-family-poppins">
            <div className="w-full max-w-2xl flex flex-col gap-4">
                <Navbar />

                <div className="w-full max-w-2xl px-4 md:px-6 flex flex-col min-h-[85vh] md:mt-20 mt-10 py-15 gap-4 shadow-lg">
                    <h1 className="text-xl font-bold text-left text-gray-500">Orders</h1>

                    {/* ✅ Vendor Not Verified Handling */}
                    {vendorProfile?.status !== "verified" ? (
                        <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 p-4 rounded-md">
                            <h2 className="font-semibold text-lg text-center mb-2">Account Status</h2>

                            <p className="mb-2">
  <strong>Status:</strong>{" "}
  {vendorProfile?.status === "not_verified" ? "Not Verified" : vendorProfile?.status}
</p>


                            {vendorProfile?.request_status === "NA" ? (
                                <p>Your account verification is under process. Please wait.</p>
                            ) : (
                                <p><strong>Rejected:</strong> {vendorProfile?.request_status}</p>
                            )}
                  </div>
                    ) : (
                        <>
                            <div className="flex flex-wrap">
                                <ButtonGroup active={active} setActive={setActive} />
                            </div>

                            <div className="flex flex-col gap-4 pb-24">
                                {orders.length > 0 ? (
                                    orders.map((order) => (
                                        <OrderCard
                                            key={order.order_id}
                                            order={order}
                                            onStatusUpdate={handleRefreshOrder}
                                        />
                                    ))
                                ) : (
                                    <p className="text-center text-gray-500">No orders found.</p>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>

            <BottomNav />
        </div>
    );
  
};

export default OrderPage;
