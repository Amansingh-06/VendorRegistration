import React, { useState, useEffect,useRef, useCallback } from "react";
import { supabase } from "../utils/supabaseClient";
import { useAuth } from "../context/authContext";
import { useVendorOrders } from "../hooks/useVendorOrders";
import OrderCard from "../components/OrderCard";
import Navbar from "../components/Navbar";
import BottomNav from "../components/Footer";
import ButtonGroup from "../components/FilterButton";
import { toast } from "react-hot-toast";
const OrderPage = () => {
  const [active, setActive] = useState("All");
  // const { vendorProfile } = useAuth();
  const { vendorProfile, selectedVendorId, session } = useAuth();
  const vendorId = vendorProfile?.v_id || selectedVendorId; // ✅ fallback

  const { orders, setOrders, refreshOrders,hasMore, loadMore,isLoading } = useVendorOrders(
    vendorId,
    active
  );

  const observer = useRef();

  const lastOrderRef = useCallback(
    (node) => {
      if (isLoading) return; // don't observe while loading
  
      if (observer.current) observer.current.disconnect();
  
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          loadMore();
        }
      });
  
      if (node) observer.current.observe(node);
    },
    [hasMore, loadMore, isLoading]
  );
  

  const hasRefreshedOnce = useRef(false);

  useEffect(() => {
    if (
      vendorId &&
      vendorProfile?.status === "verified" &&
      !hasRefreshedOnce.current
    ) {
      console.log("✅ Running initial refreshOrders");
      refreshOrders();
      hasRefreshedOnce.current = true;
    }
  }, [vendorId, vendorProfile?.status, refreshOrders]);
  

  // Refresh full list after status update (instead of updating just one order)
  const handleRefreshOrder = async (orderId) => {
    const { data, error } = await supabase
      .from("orders")
      .select(
        `
                *,
                order_item (
                    *,
                    item (
                        *
                    )
                )
            `
      )
      .eq("order_id", orderId)
      .single();

    if (!error) {
      // ✅ TEMPORARY: If status is "accepted", assign dummy dp_id
      if (data.status === "accepted") {
        await supabase
          .from("orders")
          .update({ dp_id: "43c6aeba-34e0-4ad7-9caf-9eb661b2e043" }) // 🟢 koi bhi ID yahan daal sakte ho
          .eq("order_id", orderId);
      }

      await refreshOrders(); // ✅ Always refresh orders after update
    } else {
      console.error("Failed to refresh order:", error);
    }
  };

  console.log("Current Orders:", orders.map(o => o.order_id));


  console.log("Vendor verified", vendorProfile?.status);
  return (
    <div className="flex flex-col items-center  bg-white   font-family-poppins">
      {/* <div className="w-full max-w-2xl flex flex-col gap-4"> */}
        {/* <Navbar /> */}
  
        
      {/* </div> */}
      <div className="w-full max-w-2xl px-2  md:px-6 flex flex-col min-h-[85vh] bg-gray-100  mt-10 md:mt-18 py-5 gap-4 shadow-lg">
          <h1 className="text-xl font-bold text-left text-gray-500">Orders</h1>
  
          {/* ✅ Vendor Not Verified Handling */}
          {vendorProfile?.status !== "verified" ? (
            <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 p-4 rounded-md">
              <h2 className="font-semibold text-lg text-center mb-2">
                Account Status
              </h2>
  
              <p className="mb-2">
                <strong>Status:</strong>{" "}
                {vendorProfile?.status === "not_verified"
                  ? "Not Verified"
                  : vendorProfile?.status}
              </p>
  
              {vendorProfile?.request_status === "NA" ? (
                <p>Your account verification is under process. Please wait.</p>
              ) : (
                <p>
                  <strong>Rejected:</strong> {vendorProfile?.request_status}
                </p>
              )}
            </div>
          ) : (
            <>
              <div className="flex flex-wrap">
                <ButtonGroup active={active} setActive={setActive} />
              </div>
  
              <div className="flex flex-col gap-4 pb-6">
                {orders?.length > 0 ? (
                  <>
                    {orders.map((order, index) => {
                      const isLast = index === orders.length - 1;
  
                      return (
                        <div
                          key={order?.order_id}
                          ref={isLast ? lastOrderRef : null}
                        >
                          <OrderCard
                            order={order}
                            onStatusUpdate={handleRefreshOrder}
                          />
                        </div>
                      );
                    })}
  
                    {/* ✅ Loader when loading more (scrolling) */}
                    {isLoading && (
                      <div className="flex justify-center py-4">
                        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </>
                ) : isLoading ? (
                  // ✅ Loader for first load
                  <div className="flex justify-center items-center py-6">
                    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <p className="text-center text-gray-500">No orders found.</p>
                )}
              </div>
            </>
          )}
        </div>
  
      <BottomNav />
    </div>
  );
  
};

export default OrderPage;
