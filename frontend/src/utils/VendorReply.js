import { supabase } from "./supabaseClient"; // apne project ka supabase client path

export const addVendorReply = async (ratingId, replyText) => {
  const { error } = await supabase
    .from("rating")
    .update({ vendor_reply: replyText })
    .eq("r_id", ratingId);

  if (error) {
    console.error("❌ Supabase error:", error);
    return { success: false, error };
  }

  return { success: true };
};
