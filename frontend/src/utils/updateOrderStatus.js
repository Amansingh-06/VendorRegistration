import { supabase } from "./supabaseClient";

export const updateOrderStatus = async (orderId, newStatus) => {
  console.log("🛠️ updateOrderStatus() called...");
  console.log("🔍 Input Order ID:", orderId);
  console.log("🔍 Input New Status:", newStatus);

  if (!orderId || !newStatus) {
    console.log("❌ Error: Missing orderId or newStatus");
    return { success: false, error: "Missing orderId or newStatus" };
  }

  const timestampColumnMap = {
    accepted: "accepted_ts",
    preparing: "preparing_ts",
    prepared: "prepared_ts",
    "on the way": "on_the_way_ts",
    delivered: "delivered_ts",
  };

  const normalizedStatus = newStatus.toLowerCase().trim();
  const columnToUpdate = timestampColumnMap[normalizedStatus];

  console.log("🧾 Normalized Status:", normalizedStatus);
  console.log("🕒 Timestamp Column to Update:", columnToUpdate || "None");

  const updateFields = {
    status: newStatus,
  };

  if (columnToUpdate) {
    updateFields[columnToUpdate] = new Date();
  }

  console.log("📦 Fields to be updated:", updateFields);

  try {
    const { data, error } = await supabase
      .from("orders")
      .update(updateFields)
      .eq("order_id", orderId)
      .select("order_id"); // just returning order_id to confirm update

    if (error) {
      console.log("❌ Supabase Update Error:");
      console.log("🧠 Message:", error.message);
      console.log("📝 Details:", error.details);
      console.log("💡 Hint:", error.hint);
      return { success: false, error };
    }

    console.log("✅ Order update successful:", data);
    return { success: true, data };
  } catch (err) {
    console.log("🔥 Exception Caught:", err);
    return { success: false, error: err };
  }
};
