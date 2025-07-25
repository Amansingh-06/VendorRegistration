import React, { useState, useEffect, useRef, useCallback } from "react";
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
import { BiSearch } from "react-icons/bi";
import { numberInputClean } from "../utils/Validation";
import {filterOrdersByActive} from '../utils/FilterorderByActive'

export { updateVendorDiscount } from "../utils/OfferUpdate"; // ✅ Export for testing
const OrderPage = () => {
  const { vendorProfile, selectedVendorId, session } = useAuth();
  const vendorId = vendorProfile?.v_id || selectedVendorId; // ✅ fallback
  const [active, setActive] = useState("All");
  const [offer, setOffer] = useState(`0%`);
  const [newOffer, setNewOffer] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [hasSearched,setHasSearched] = useState(false)
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [error, seterror] = useState("");
  // const { vendorProfile } = useAuth();

const getDbStatus = (active) => {
  const normalized = active?.toLowerCase().trim();
  console.log("🔍 getDbStatus() called with:", active);
  console.log("🎯 Normalized value:", normalized);

  if (normalized === "accepted & dp assign" || normalized === "accepted & dpassigned") {
    console.log("✅ Returning: accepted");
    return "accepted";
  }

  console.log("➡️ Returning:", normalized);
  return normalized;
};



const { orders, hasMore, loadMore, isLoading } = useVendorOrders(
  vendorId,
  getDbStatus(active) // send only actual DB status
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
      
        let adminId = session?.user?.id;

        if (!adminId) {
          const {
            data: { user },
            error,
          } = await supabase.auth.getUser();
          if (error || !user) {
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
       
          toast.error("Logging failed.");
        } else {
        }
      }
    } catch (err) {
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




 useEffect(() => {
  if (!orders) return;

  let filtered = [...orders];

  // ✅ Filter by Active Status
  const normalizedActive = active?.toLowerCase().trim();
  if (normalizedActive === "accepted") {
    filtered = filtered.filter((order) => {
      const status = order?.status?.toLowerCase().trim();
      return status === "accepted";
    });
  } else if (
    normalizedActive === "accepted & dp assign" ||
    normalizedActive === "accepted & dpassigned"
  ) {
    filtered = filtered.filter((order) => {
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

  // ✅ Filter by Search Query
  const trimmed = searchQuery.trim();
  if (trimmed !== "") {
    const lowerQuery = trimmed.toLowerCase();
    filtered = filtered.filter((order) =>
      order?.user_order_id?.toLowerCase().includes(lowerQuery)
    );
  }

  setFilteredOrders(filtered);
}, [orders, active]);



const handleSearch = async () => {
  const trimmed = searchQuery.trim();
  if (trimmed === "") {
    seterror("Search field cannot be empty");
    return;
  }

  setHasSearched(true);
  seterror("");

  try {
    const { data, error } = await supabase
      .from("orders")
      .select(`
        user_order_id,created_ts,status,delivery_type,dp_id,
        user:u_id (dp_url,name),
    
        
        
        order_item:order_item_order_id_fkey (
          *,
          items:item_id (*)
        )
      `)
      .ilike("user_order_id", `%${trimmed}%`)
      .eq("v_id", vendorId); // ✅ fetch only vendor's orders

    if (error) {
      console.error("Supabase search error:", error);
      seterror("Failed to search orders");
      return;
    }

    setFilteredOrders(data);
  } catch (err) {
    console.error("Unexpected search error:", err);
    seterror("Unexpected error occurred");
  }
};






  const clearSearch = () => {
    setSearchQuery("");
    seterror("");
    setHasSearched(false)
    setFilteredOrders(orders);
  };
const handleInputChange = (e) => {
  let val = e.target.value;

  // Clean input
  val = val.replace(/[^0-9 ]/g, ""); // Allow digits and space
  val = val.replace(/(?<=\d)\s+(?=\d)/g, ""); // Remove spaces from middle

  // Optional: trim leading/trailing space
  // val = val.trim();

  setSearchQuery(val);
  seterror(""); // clear error
};











  // const handlePaste = (e) => {
  //   const pasted = e.clipboardData.getData("text").trim();
  //   if (!/^\d+$/.test(pasted)) {
  //     e.preventDefault();
  //     seterror("Only numeric Order ID is allowed");
  //   } else {
  //     setSearchQuery(pasted); // trimmed numeric paste allowed
  //     seterror("");
  //   }
  // };


  return (
    <div className="flex flex-col items-center  bg-white   font-family-poppins">
      {/* <div className="w-full max-w-2xl flex flex-col gap-4"> */}
      {/* <Navbar /> */}

      {/* </div> */}
      <div className="w-full max-w-2xl px-2  md:px-6 flex flex-col min-h-[85vh] bg-gray-100  pt-12 md:mt-4 py-3 gap-3 shadow-lg">
        <h1 className="text-md md:text-2xl lg:text-2xl font-medium text-gray">
          ORDERS
        </h1>

        {/* ✅ Vendor Not Verified Handling */}
        {vendorProfile?.status === "blocked" ? (
          <div className="bg-red-50 border border-red-300 text-red-800 p-4 rounded-md">
            <h2 className="font-semibold text-lg text-center mb-2">
              Account Blocked
            </h2>
            <p>
              Your account has been blocked. Please contact support for
              assistance.
            </p>
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
        ) : (
          <>
            <div className="p-3 rounded-lg shadow-lg border flex justify-between border-gray-300 bg-orange-50 -mt-2">
              <h1>
                Current Offer:{" "}
                <span className="text-orange-500 text-[18px] font-semibold">
                  {offer}
                </span>
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
            {/* Updated Search Bar */}
            <div className="relative w-full ">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
                <BiSearch />
              </span>

              <input
                type="text"
                value={searchQuery}
                onChange={handleInputChange}
                    
                    onInput={numberInputClean}
                    inputMode="numeric"
                placeholder="Search by Order ID "
                className="w-full pl-10 pr-28 py-2 bg-white text-sm border  border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-green-300"
              />

              {hasSearched ? ( <button
                onClick={clearSearch}
                className="absolute right-0 top-[.5px] bg-gray-500  text-white  px-5 md:py-2 py-[10px] md:text-sm text-xs rounded-r-lg"
                aria-label="Clear search"
              >
                X
                  </button>) : (
                       <button
                onClick={handleSearch}
                className="absolute right-0 top-[.5px] bg-orange-500 hover:bg-orange-600 text-white md:px-2 px-1 md:py-2 py-[10px] md:text-sm text-xs rounded-r-lg"
              >
                Search
              </button>
              )}
             

              {/* Search Button */}
             
            </div>
            {error && (
              <p className="text-red-500 text-xs -mt-2 ml-8">{error}</p>
            )}

            <div className="flex flex-col gap-4 pb-6">
              {filteredOrders?.length > 0 ? (
                <>
                  {filteredOrders.map((order, index) => {
                    const isLast = index === filteredOrders.length - 1;

                    return (
                      <div
                        key={order?.order_id}
                        ref={isLast ? lastOrderRef : null}
                      >
                        <OrderCard order={order} />
                      </div>
                    );
                  })}

                  {/* ✅ Loader when loading more (scrolling) */}
                  {isLoading && (
                    <div className="flex justify-center py-4">
                      <div className="w-8 h-8 border-4 border-orange border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </>
              ) : isLoading ? (
                // ✅ Loader for first load
                <div className="flex justify-center items-center py-6">
                  <div className="w-10 h-10 border-4 border-orange border-t-transparent rounded-full animate-spin"></div>
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
