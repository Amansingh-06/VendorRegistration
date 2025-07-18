import { supabase } from "./supabaseClient";

export const fetchVendorOrders = async (
  vendorId,
  status = null,
  limit = 10,
  offset = 0,
  fullFetch = false
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

    const { data: orders, error } = await query;

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

    const sortedData = orders.sort((a, b) => {
      const statusDiff =
        (statusPriority[a.status?.toLowerCase()] || 99) -
        (statusPriority[b.status?.toLowerCase()] || 99);
      if (statusDiff !== 0) return statusDiff;
      return new Date(a.created_ts) - new Date(b.created_ts);
    });

    const finalData = fullFetch
      ? sortedData
      : sortedData.slice(offset, offset + limit);

    // ✅ Collect all dp_ids from finalData
    const dpIds = finalData
      .map(order => order.dp_id)
      .filter(id => !!id); // only non-null

    let dpUsers = [];

    if (dpIds.length > 0) {
      const { data: users, error: dpError } = await supabase
        .from('delivery_partner')
        .select('dp_id, name, photo_url,mobile_no')
        .in('dp_id', dpIds);

      if (dpError) throw dpError;
      dpUsers = users;
    }

    // ✅ Attach DP data to each order
    const enrichedOrders = finalData.map(order => {
      const dp = dpUsers.find(user => user.dp_id === order.dp_id);
      return {
        ...order,
        delivery_person: dp || null,
      };
    });

    return { success: true, data: enrichedOrders };
  } catch (error) {
    return { success: false, data: [] };
  }
};
