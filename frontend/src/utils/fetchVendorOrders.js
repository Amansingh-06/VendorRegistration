import { supabase } from "./supabaseClient";

export const fetchVendorOrders = async (
  vendorId,
  status = null,
  limit = 10,
  offset = 0,
  fullFetch = false // ✅ NEW PARAM
) => {
  try {
    let query = supabase
      .from('orders')
      .select(`
        *,
        order_item:order_item!order_item_order_id_fkey (
          order_item_id,
          quantity,
          final_price,
          items:item_id (
            item_id,
            item_name,
            item_price,
            img_url,
            veg
          )
        ),
        transaction:t_id (
          t_id,
          amount,
          payment_id,
          status,
          payement_mehtod,
          created_at
        ),
        user:u_id (
          user_id,
          name,
          dp_url
        )
      `)
      .eq('v_id', vendorId);

    if (status && status.toLowerCase() !== 'all') {
      query = query.ilike('status', status);
    }

    const { data, error } = await query;

    if (error) throw error;

    // ✅ Sorting logic
    const statusPriority = {
      "pending": 1,
      "accepted": 2,
      "preparing": 3,
      "prepared": 4,
      "on the way": 5,
      "delivered": 6,
    };

    const sortedData = data.sort((a, b) => {
      const statusDiff =
        (statusPriority[a.status?.toLowerCase()] || 99) -
        (statusPriority[b.status?.toLowerCase()] || 99);
      if (statusDiff !== 0) return statusDiff;
      return new Date(b.created_ts) - new Date(a.created_ts);
    });

    // ✅ Apply manual pagination only if fullFetch is false
    const finalData = fullFetch
      ? sortedData
      : sortedData.slice(offset, offset + limit);

    return { success: true, data: finalData };
  } catch (error) {
    console.error("❌ Exception fetching vendor completed orders:", error);
    return { success: false, data: [] };
  }
};
