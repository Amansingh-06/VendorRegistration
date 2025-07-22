export const filterOrdersByActive = (orders, active) => {
  console.log("🔥 Filter Called | Active:", active, "| Orders Length:", orders.length);

  const normalizedActive = active?.toLowerCase().trim();

  // ✅ Filter for only accepted orders
  if (normalizedActive === "accepted") {
    return orders.filter((order) => {
      const status = order?.status?.toLowerCase().trim();
      return status === "accepted";
    });
  }

  // ✅ Filter for accepted & dp assigned or 65% time passed
  if (
    normalizedActive === "accepted & dp assign" ||
    normalizedActive === "accepted & dpassigned"
  ) {
    return orders.filter((order) => {
      const status = order?.status?.toLowerCase()?.trim();
      if (status !== "accepted") return false;

      const dpAssigned = !!order?.dp_id;
      const createdTs = new Date(order?.created_ts);
      const etaTs = new Date(order?.eta);
      const now = new Date();

      if (isNaN(createdTs) || isNaN(etaTs)) return false;

      const totalTime = etaTs - createdTs;
      if (totalTime <= 0) return false;

      const timePassed = now - createdTs;
      const percentagePassed = (timePassed / totalTime) * 100;

      return dpAssigned || percentagePassed >= 65;
    });
  }

  // 🔄 Default: return unfiltered
  console.log("⚠️ No matching filter condition found.");
  return orders;
};
