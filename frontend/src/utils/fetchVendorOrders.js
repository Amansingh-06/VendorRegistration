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
          item_real_price,
          items:item_id (
            item_id,
            item_name,
            item_price,
            img_url,
            veg,
            item_quantity
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

    const normalizedStatus = status?.toLowerCase().trim();

    // ✅ Only apply filter in query if not custom logic
 // ✅ Handle filters
if (normalizedStatus && normalizedStatus !== "all") {
  if (
    normalizedStatus === "accepted & dp assign" ||
    normalizedStatus === "accepted & dpassigned"
  ) {
    // Don't apply Supabase filter, we’ll handle it later
  } else if (normalizedStatus === "accepted") {
    // ✅ Apply exact match for "accepted"
    query = query.eq('status', 'accepted');
    console.log("🚀 Supabase exact filter: accepted");
  } else {
    // ✅ Partial match for all other statuses
    query = query.ilike('status', `%${status}%`);
    console.log("🚀 Supabase ilike filter with status:", status);
  }
}


    let { data: orders, error } = await query;

    if (error) throw error;

    // ✅ Apply custom logic if status is "accepted & dp assign"
if (
  normalizedStatus === "accepted & dp assign" ||
  normalizedStatus === "accepted & dpassigned"
) {
  const now = new Date();
  orders = orders.filter(order => {
    const status = order?.status?.toLowerCase().trim();
    if (status !== "accepted") return false;

    const dpAssigned = !!order?.dp_id;
    const createdTs = new Date(order?.created_ts);
    const etaTs = new Date(order?.eta);

    if (isNaN(createdTs) || isNaN(etaTs)) return false;

    const totalTime = etaTs - createdTs;
    if (totalTime <= 0) return false;

    const timePassed = now - createdTs;
    const percentagePassed = (timePassed / totalTime) * 100;

    // ✅ travel_time check
    const travelTimeInMs = (order?.travel_time || 0) * 60 * 1000; // travel_time in minutes → milliseconds
    const remainingTime = etaTs - now;
    const allowDueToTravelTime = remainingTime <= travelTimeInMs;

    // ✅ Final condition
    return dpAssigned || percentagePassed >= 65 || allowDueToTravelTime;
  });
}


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

    // ✅ Collect all dp_ids
    const dpIds = finalData
      .map(order => order.dp_id)
      .filter(id => !!id);

    let dpUsers = [];

    if (dpIds.length > 0) {
      const { data: users, error: dpError } = await supabase
        .from('delivery_partner')
        .select('dp_id, name, photo_url, mobile_no')
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
    console.error("❌ fetchVendorOrders error:", error);
    return { success: false, data: [] };
  }
};
