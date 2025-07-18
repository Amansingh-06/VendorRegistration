// utils/fetchVendorRatingStats.js
import { supabase } from "./supabaseClient";

export const fetchVendorRatingStats = async (vendorId) => {
  try {
    const { data, error } = await supabase
      .from("rating")
      .select("rating_number")
      .eq("v_id", vendorId);

    if (error) {
      return { success: false, averageRating: 0, totalCustomers: 0 };
    }

    const totalCustomers = data.length;
    const totalRating = data.reduce(
      (sum, row) => sum + (row.rating_number || 0),
      0
    );
    const averageRating =
      totalCustomers > 0 ? (totalRating / totalCustomers).toFixed(1) : "0.0";

    return {
      success: true,
      averageRating: Number(averageRating),
      totalCustomers,
    };
  } catch (err) {
    return { success: false, averageRating: 0, totalCustomers: 0 };
  }
};
