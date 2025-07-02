import { supabase } from "./supabaseClient";

export const updateOrderStatus = async (orderId, newStatus) => {
    const timestampColumnMap = {
        accepted: "accepted_ts",
        preparing: "preparing_ts",
        prepared: "prepared_ts",
        on_the_way: "on_the_way_ts",
        delivered: "delivered_ts"
    };

    const columnToUpdate = timestampColumnMap[newStatus?.toLowerCase()];

    const updateFields = {
        status: newStatus,
        updated_ts: new Date()
    };

    if (columnToUpdate) {
        updateFields[columnToUpdate] = new Date(); // Set that specific timestamp
    }

    const { data, error } = await supabase
        .from("orders")
        .update(updateFields)
        .eq("order_id", orderId);

    if (error) {
        console.error("Error updating order status:", error);
        return { success: false, error };
    }

    return { success: true, data };
};
