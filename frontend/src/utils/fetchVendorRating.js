import { supabase } from "./supabaseClient";
export const fetchVendorRatings = async (vendorId, page = 1, limit = 5) => {
  try {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error } = await supabase
      .from('rating')
      .select(`
        r_id,
        created_at,
        rating_number,
        comment,
        vendor_reply,
        user:u_id (
          user_id,
          name,
          mobile_number,
          dp_url
        ),
        order:order_id (
          order_id,
          total_amount,
          vendor_discount,
          order_item:order_item!order_item_order_id_fkey (
            quantity,
            final_price,
            item_real_price,
            items:item_id (
              item_id,
              item_name,
              item_price,
              img_url
            )
          )
        )
      `)
      .eq('v_id', vendorId)
      .order('created_at', { ascending: false })
      .range(from, to);
    if (error) {
      return { success: false, data: null };
    }

    return { success: true, data };

  } catch (err) {
    return { success: false, data: null };
  }
};
