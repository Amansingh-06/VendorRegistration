import { supabase } from '../utils/supabaseClient';

export const fetchVendorOrders = async (vendorId, status = null) => {
  try {
    let query = supabase
      .from('orders')
      .select(`
                *,
                order_item:order_id (
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
                )
            `)
      .eq('v_id', vendorId)
      .order('created_ts', { ascending: false });

    // ✅ Apply case-insensitive status filtering
    if (status && status.toLowerCase() !== 'all') {
      query = query.ilike('status', status); // <-- ilike = case-insensitive match
    }

    const { data, error } = await query;

    if (error) {
      console.error("❌ Error fetching orders:", error);
      return { success: false, data: null };
    }

    return { success: true, data };
  } catch (error) {
    console.error("❌ Exception fetching orders:", error);
    return { success: false, data: null };
  }
};
