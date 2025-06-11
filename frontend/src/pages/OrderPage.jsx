import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useAuth } from '../context/authContext';
import { useVendorOrders } from '../hooks/useVendorOrders';
import OrderCard from '../components/OrderCard';
import Navbar from '../components/Navbar';
import BottomNav from '../components/Footer';
import ButtonGroup from '../components/FilterButton';

const OrderPage = () => {
    const [active, setActive] = useState('All');
    const { vendorProfile } = useAuth();

    const { orders, setOrders, refreshOrders } = useVendorOrders(vendorProfile?.v_id, active);

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

    // Refresh orders when filter changes or vendor is available
    useEffect(() => {
        if (vendorProfile?.v_id) {
            refreshOrders(); // Uses vendorId + active filter
        }
    }, [active, vendorProfile?.v_id, refreshOrders]);

    // Refresh full list after status update (instead of updating just one order)
    const handleRefreshOrder = async (orderId) => {
        const { data, error } = await supabase
            .from('orders')
            .select(`
                *,
                order_item (
                    *,
                    items (
                        *
                    )
                )
            `)
            .eq('order_id', orderId)
            .single();

        if (!error) {
            await refreshOrders(); // ✅ This ensures current tab is re-evaluated
        } else {
            console.error('Failed to refresh order:', error);
        }
    };

    return (
        <div className="flex flex-col items-center min-h-screen bg-white rounded-lg shadow-lg font-family-poppins">
            <div className="w-full max-w-2xl flex flex-col gap-4">
                <Navbar />
                <div className="w-full max-w-2xl px-4 md:px-6 flex flex-col min-h-screen gap-4 shadow-lg">
                    <h1 className="text-xl font-bold text-left text-gray-500">Orders</h1>
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
                </div>
            </div>
            <BottomNav />
        </div>
    );
};

export default OrderPage;
