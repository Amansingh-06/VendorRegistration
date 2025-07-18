// utils/vendor.js
import { supabase } from "./supabaseClient";

export const updateVendorDiscount = async (vendorId, discountValue) => {
  const { data, error } = await supabase
    .from("vendor_request")
    .update({ current_discount: discountValue })
    .eq("v_id", vendorId);

  if (error) {
    return { success: false, error };
  }

  return { success: true, data };
};
