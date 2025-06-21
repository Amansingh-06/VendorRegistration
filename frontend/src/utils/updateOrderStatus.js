// utils/updateOrderStatus.js
import { supabase } from "./supabaseClient";

export const updateOrderStatus = async (orderId, newStatus) => {
    const { data, error } = await supabase
        .from('orders')
        .update({
            status: newStatus,
            updated_ts: new Date() // 👈 this sends a real JavaScript Date object
        })
        .eq('order_id', orderId);

    if (error) {
        console.error('Error updating order status:', error);
        return { success: false, error };
    }

    return { success: true, data };
};
