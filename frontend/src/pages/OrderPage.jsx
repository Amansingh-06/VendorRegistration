import React, { useState, useEffect,useRef, useCallback } from "react";
import { supabase } from "../utils/supabaseClient";
import { useAuth } from "../context/authContext";
import { useVendorOrders } from "../hooks/useVendorOrders";
import OrderCard from "../components/OrderCard";
import Navbar from "../components/Navbar";
import BottomNav from "../components/Footer";
import ButtonGroup from "../components/FilterButton";
import { toast } from "react-hot-toast";
import OfferPopup from "../components/Popup";
import { updateVendorDiscount } from "../utils/OfferUpdate";
export { updateVendorDiscount } from "../utils/OfferUpdate"; // ✅ Export for testing
const OrderPage = () => {
  
  const { vendorProfile, selectedVendorId, session } = useAuth();
  const vendorId = vendorProfile?.v_id || selectedVendorId; // ✅ fallback
  const [active, setActive] = useState("All");
  const [offer, setOffer] = useState(`0%`);
  const [newOffer, setNewOffer] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [loading, setLoading] = useState(false);
  // const { vendorProfile } = useAuth();

  const { orders,hasMore, loadMore,isLoading } = useVendorOrders(
    vendorId,
    active
  );
  useEffect(() => {
    if (vendorProfile?.current_discount !== undefined) {
      setOffer(`${vendorProfile.current_discount}%`);
    }
  }, [vendorProfile?.current_discount]);

  const handleOfferSubmit = async () => {
    if (!newOffer.trim()) return;
  
    const discountValue = parseInt(newOffer);
    if (isNaN(discountValue)) {
      toast.error("Please enter a valid number.");
      return;
    }
  
    setLoading(true);
    const toastId = toast.loading("Updating offer...");
  
    try {
      const { success } = await updateVendorDiscount(vendorId, discountValue);
      toast.dismiss(toastId);
      setLoading(false);
      setShowPopup(false);
  
      if (!success) {
        toast.error("Failed to update offer. Please try again.");
        return;
      }
  
      setOffer(`${discountValue}%`);
      toast.success("Offer updated successfully!");
  
      if (selectedVendorId) {
        const existingOffer = vendorProfile?.current_discount;
  
        const description = `Vendor discount updated for vendor ID ${selectedVendorId}. Changes: current_discount changed from "${existingOffer}" to "${discountValue}"`;
        {console.log("admin_id", session?.user?.id)}
        let adminId = session?.user?.id;

        if (!adminId) {
          const { data: { user }, error } = await supabase.auth.getUser();
          if (error || !user) {
            console.error("❌ Could not fetch current user:", error?.message);
            toast.error("Could not fetch admin user");
            return;
          } else {
            adminId = user.id;
          }
        }
        
        const { error: logError } = await supabase.from("admin_logs").insert([
          {
            admin_id: adminId,
            title: "Updated Vendor Discount",
            description,
            timestamp: new Date(),
          },
        ]);
        
  
        if (logError) {
          console.error("❌ Failed to insert into admin_logs:", logError.message);
          toast.error("Logging failed. Check console.");
        } else {
          console.log("✅ admin_logs entry inserted successfully.");
        }
      }
    } catch (err) {
      console.error("❌ Offer update error:", err.message);
      toast.dismiss(toastId);
      toast.error("An unexpected error occurred.");
    }
  
    setLoading(false);
  };
  
  


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

  return (
    <div className="flex flex-col items-center  bg-white   font-family-poppins">
      {/* <div className="w-full max-w-2xl flex flex-col gap-4"> */}
        {/* <Navbar /> */}
  
        
      {/* </div> */}
      <div className="w-full max-w-2xl px-2  md:px-6 flex flex-col min-h-[85vh] bg-gray-100  pt-12 md:mt-4 py-3 gap-3 shadow-lg">
          <h1 className="text-md md:text-2xl lg:text-2xl font-medium text-gray">ORDERS</h1>
  
          {/* ✅ Vendor Not Verified Handling */}
          {vendorProfile?.status === "blocked" ? (
  <div className="bg-red-50 border border-red-300 text-red-800 p-4 rounded-md">
    <h2 className="font-semibold text-lg text-center mb-2">
      Account Blocked
    </h2>
    <p>Your account has been blocked. Please contact support for assistance.</p>
  </div>
) : vendorProfile?.status !== "verified" ? (
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
) 
 : (
              <>
                 <div className="p-3 rounded-lg shadow-lg border flex justify-between border-gray-300 bg-orange-50 -mt-2">
        <h1>
          Current Offer:{" "}
          <span className="text-orange-500 text-[18px] font-semibold">{offer}</span>
        </h1>
        <button
          className="rounded-lg text-white bg-orange-500 px-3 py-1 text-xs"
          onClick={() => setShowPopup(true)}
        >
          Change
        </button>
      </div>

      {/* Popup */}
      <OfferPopup
        isOpen={showPopup}
        onClose={() => setShowPopup(false)}
        onSubmit={handleOfferSubmit}
        offerText={newOffer}
        setOfferText={setNewOffer}
      />
              <div className="flex flex-wrap -mt-1">
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
