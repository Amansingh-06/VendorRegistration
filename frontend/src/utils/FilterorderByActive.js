export const filterOrdersByActive = (orders, active) => {
  console.log("🔥 Filter Called | Active:", active, "| Orders Length:", orders.length);

  const normalizedActive = active?.toLowerCase().trim();
  console.log("🎯 Normalized Active:", normalizedActive);

  // ✅ CASE 1: "accepted" — DP not assigned AND ETA < 65%
  if (normalizedActive === "accepted") {
    return orders.filter((order, index) => {
      const status = order?.status?.toLowerCase()?.trim();
      const orderId = order?.id || `index_${index}`;
      const dpId = order?.dp_id;

      console.log(`🔍 [ACCEPTED] Order[${orderId}]: status=${status}, dp_id=${dpId}`);

      if (status !== "accepted") return false;

      const dpAssigned = dpId !== null && dpId !== undefined && dpId !== "";
      if (dpAssigned) {
        console.log(`⛔ [ACCEPTED] Order[${orderId}]: DP is assigned — SKIPPED`);
        return false;
      }

      const createdTs = new Date(order?.created_ts);
      const etaTs = new Date(order?.eta);
      const now = new Date();

      if (isNaN(createdTs) || isNaN(etaTs)) {
        console.log(`⚠️ [ACCEPTED] Order[${orderId}]: Invalid dates — SKIPPED`);
        return false;
      }

      const totalTime = etaTs - createdTs;
      if (totalTime <= 0) {
        console.log(`⚠️ [ACCEPTED] Order[${orderId}]: ETA < Created — SKIPPED`);
        return false;
      }

      const timePassed = now - createdTs;
      const percentagePassed = (timePassed / totalTime) * 100;
      const isValid = percentagePassed < 65;

      console.log(`🟠 [ACCEPTED] Order[${orderId}]: %Passed=${percentagePassed.toFixed(2)}, INCLUDED=${isValid}`);
      return isValid;
    });
  }

  // ✅ CASE 2: "accepted & dp assign" — DP assigned OR ETA >= 65%
  if (
    normalizedActive === "accepted & dp assign" ||
    normalizedActive === "accepted & dpassigned"
  ) {
    return orders.filter((order, index) => {
      const status = order?.status?.toLowerCase()?.trim();
      const orderId = order?.id || `index_${index}`;
      const dpId = order?.dp_id;

      console.log(`🔍 [ACCEPTED & DP] Order[${orderId}]: status=${status}, dp_id=${dpId}`);

      if (status !== "accepted") return false;

      const dpAssigned = dpId !== null && dpId !== undefined && dpId !== "";

      const createdTs = new Date(order?.created_ts);
      const etaTs = new Date(order?.eta);
      const now = new Date();

      if (isNaN(createdTs) || isNaN(etaTs)) {
        console.log(`⚠️ [ACCEPTED & DP] Order[${orderId}] Invalid dates — SKIPPED`);
        return false;
      }

      const totalTime = etaTs - createdTs;
      if (totalTime <= 0) {
        console.log(`⚠️ [ACCEPTED & DP] Order[${orderId}] ETA < Created — SKIPPED`);
        return false;
      }

      const timePassed = now - createdTs;
      const percentagePassed = (timePassed / totalTime) * 100;
      const isValid = dpAssigned || percentagePassed >= 65;

      console.log(`🟢 [ACCEPTED & DP] Order[${orderId}]: dpAssigned=${dpAssigned}, %Passed=${percentagePassed.toFixed(2)}, INCLUDED=${isValid}`);
      return isValid;
    });
  }

  // ✅ CASE 3: Other normal statuses (preparing, on the way, etc.)
  if (normalizedActive !== "all") {
    return orders.filter((order, index) => {
      const status = order?.status?.toLowerCase()?.trim();
      const orderId = order?.id || `index_${index}`;
      const isMatch = status === normalizedActive;
      console.log(`🔵 [NORMAL] Order[${orderId}]: status=${status}, match=${isMatch}`);
      return isMatch;
    });
  }

  // 🔄 Default: return all
  console.log("🟣 [ALL] Returning all orders");
  return orders;
};
