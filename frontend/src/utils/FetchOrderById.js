import { supabase } from "./supabaseClient";

export const fetchOrderById = async (orderId) => {
  try {
    const { data: orders, error } = await supabase
      .from("orders")
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
      .eq("order_id", orderId)
      .single();

    if (error) throw error;

    // Fetch delivery partner (DP) if dp_id exists
    let deliveryPerson = null;
    if (orders?.dp_id) {
      const { data: dp, error: dpError } = await supabase
        .from("delivery_partner")
        .select("dp_id, name, photo_url, mobile_no")
        .eq("dp_id", orders.dp_id)
        .single();

      if (dpError) throw dpError;
      deliveryPerson = dp;
    }

    // Merge and return enriched order
    return {
      success: true,
      data: {
        ...orders,
        delivery_person: deliveryPerson || null,
      },
    };
  } catch (error) {
    console.error("❌ Error in fetchOrderById:", error);
    return { success: false, data: null };
  }
};
