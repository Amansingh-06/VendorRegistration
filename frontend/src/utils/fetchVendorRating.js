import { supabase } from '../utils/supabaseClient';

export const fetchVendorRatings = async (vendorId) => {
    try {
        const { data, error } = await supabase
            .from('rating')
            .select(`
        r_id,
        created_at,
        rating_number,
        comment,
        
        user:u_id (
          user_id,
          name,
          mobile_number,
          dp_url
        ),
        
        order:order_id (
          order_id,
          total_amount,
          order_item:order_item!order_item_order_id_fkey (
            quantity,
            final_price,
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
            .order('created_at', { ascending: false });

        if (error) {
            console.error("❌ Error fetching ratings:", error);
            return { success: false, data: null };
        }

        return { success: true, data };
    } catch (err) {
        console.error("❌ Exception in fetchVendorRatings:", err);
        return { success: false, data: null };
    }
};
