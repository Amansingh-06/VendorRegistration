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

                // ✅ Reload orders when update affects current tab
                if (
                    activeStatus === 'All' ||
                    updatedOrder?.status?.toUpperCase() === activeStatus?.toUpperCase()
                ) {
                    loadOrders();
                } else {
                    // ✅ Remove from current tab if status changed
                    loadOrders();
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(ordersChannel);
        };
    }, [vendorId, activeStatus, loadOrders]);

    return { orders, setOrders, refreshOrders: loadOrders };
};
