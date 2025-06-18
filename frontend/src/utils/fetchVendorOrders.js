import { supabase } from '../utils/supabaseClient';

export const fetchVendorOrders = async (vendorId, status = null) => {
  try {
    let data = [];
    let error = null;

    if (status && status.toLowerCase() === 'delivered') {
      // 1️⃣ Fetch from `completed_order`
      const { data: completedOrders, error: completedError } = await supabase
        .from('completed_orders')
        .select('*')
        .eq('v_id', vendorId)
        .order('created_ts', { ascending: false });

      if (completedError) throw completedError;

      const orderIds = completedOrders.map(o => o.order_id);
      const tIds = completedOrders.map(o => o.t_id);

      // 2️⃣ Fetch related order_item
      const { data: orderItems, error: orderItemError } = await supabase
        .from('order_item')
        .select(`
          order_id,
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
        `)
        .in('order_id', orderIds);

      if (orderItemError) throw orderItemError;

      // 3️⃣ Fetch related transactions
      const { data: transactions, error: transactionError } = await supabase
        .from('transaction')
        .select(`
          t_id,
          amount,
          payment_id,
          status,
          gst_collected,
          payement_mehtod,
          created_at
        `)
        .in('t_id', tIds);

      if (transactionError) throw transactionError;

      // 4️⃣ Merge items & transaction manually
      data = completedOrders.map(order => ({
        ...order,
        order_item: orderItems.filter(item => item.order_id === order.order_id),
        transaction: transactions.find(t => t.t_id === order.t_id) || null
      }));
    } else {
      // Fetch from `orders` table
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
            gst_collected,
            payement_mehtod,
            created_at
          )
        `)
        .eq('v_id', vendorId)
        .order('created_ts', { ascending: false });

      if (status && status.toLowerCase() !== 'all') {
        query = query.ilike('status', status);
      }

      const result = await query;
      data = result.data;
      error = result.error;

      if (error) throw error;
    }

    return { success: true, data };
  } catch (error) {
    console.error("❌ Exception fetching orders:", error);
    return { success: false, data: [] };
  }
};
