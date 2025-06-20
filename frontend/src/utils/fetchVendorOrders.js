import { supabase } from '../utils/supabaseClient';

export const fetchVendorOrders = async (vendorId, status = null) => {
  try {
    const query = supabase
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
          gst_collected,
          payement_mehtod,
          created_at
        )
      `)
      .eq('v_id', vendorId)
      .order('created_ts', { ascending: false });

    if (status && status.toLowerCase() !== 'all') {
      query.ilike('status', status);
    }

    const { data, error } = await query;

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error("❌ Exception fetching vendor completed orders:", error);
    return { success: false, data: [] };
  }
};
