// 📁 src/constants/orderConfig.js

import { SUPABASE_TABLES, VENDOR_FIELD } from './Table&column'; // adjust import path as needed

export const ORDER_KEYS = {
  ORDER_ID: 'order_id',
  STATUS: 'status',
  VENDOR_ID: VENDOR_FIELD.V_ID,
};

export const ORDER_PAGINATION = {
  LIMIT: 10,
};

export const ORDER_CHANNELS = {
  VENDOR_ORDERS: 'realtime-orders',
};

// 🔍 Used for supabase .select()
export const ORDER_SELECT_QUERY = `
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
`;
