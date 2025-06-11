import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../utils/supabaseClient';
import { fetchVendorOrders } from '../utils/fetchVendorOrders';

export const useVendorOrders = (vendorId, activeStatus = 'All') => {
    const [orders, setOrders] = useState([]);

    const loadOrders = useCallback(async () => {
        if (!vendorId) return;
        const { success, data } = await fetchVendorOrders(vendorId, activeStatus);
        if (success) setOrders(data);
    }, [vendorId, activeStatus]);

    useEffect(() => {
        if (!vendorId) return;
        loadOrders(); // fetch on mount or status change
    }, [loadOrders]);

    useEffect(() => {
        if (!vendorId) return;

        const ordersChannel = supabase
            .channel('realtime-orders')
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'orders',
                filter: `v_id=eq.${vendorId}`
            }, (payload) => {
                const { new: updatedOrder } = payload;

                // ✅ Fixed: Check if the updated order still belongs in the current tab
                if (
                    activeStatus === 'All' ||
                    updatedOrder?.status?.toUpperCase() === activeStatus?.toUpperCase()
                ) {
                    loadOrders();
                } else {
                    // ✅ Also refresh to remove it from current tab if status changed
                    loadOrders();
                }
            })
            .subscribe();

        const orderItemChannel = supabase
            .channel('realtime-order-items')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'order_item'
            }, () => {
                loadOrders(); // order items affect nested data
            })
            .subscribe();

        return () => {
            supabase.removeChannel(ordersChannel);
            supabase.removeChannel(orderItemChannel);
        };
    }, [vendorId, activeStatus, loadOrders]);

    return { orders, setOrders, refreshOrders: loadOrders };
};
