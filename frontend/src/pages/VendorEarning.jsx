import React, { useState, useEffect, useRef } from "react";
import BottomNav from "../components/Footer";
import Header from "../components/Header";
import { BsCalendarDate } from "react-icons/bs";

import {
  isWithinInterval,
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
} from "date-fns";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useAuth } from "../context/authContext";
import { fetchVendorOrders } from "../utils/fetchVendorOrders";
import { fetchVendorRatings } from "../utils/fetchVendorRating";
import { fetchVendorRatingStats } from "../utils/vendorRatingStats";
import { addVendorReply } from "../utils/VendorReply";
import { Rating } from "@mui/material";

const VendorEarnings = () => {
  const firstLoadRef = useRef(true);
  const { vendorProfile, selectedVendorId } = useAuth();
  const vendorId = vendorProfile?.v_id || selectedVendorId;
  const [ratings, setRatings] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [ratingStats, setRatingStats] = useState({
    averageRating: 0,
    totalCustomers: 0,
  });

  const LIMIT = 5;

  // const [reviews, setReviews] = useState(initialReviews);
  const [showAllItemsMap, setShowAllItemsMap] = useState({});
  const [replyingId, setReplyingId] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [replies, setReplies] = useState({});
  const [todayStats, setTodayStats] = useState({
    total_orders: 0,
    total_amount: 0,
  });
  const [showCalendar, setShowCalendar] = useState(false);
  const [dateRange, setDateRange] = useState(() => {
    const start = new Date("2025-04-01");
    const end = new Date();
    return [start, end];
  });
  const [thisWeek, setThisWeek] = useState({
    total_orders: 0,
    total_amount: 0,
  });
  const [thisMonth, setThisMonth] = useState({
    total_orders: 0,
    total_amount: 0,
  });
  const [selectedStats, setSelectedStats] = useState({
    earnings: 0,
    orders: 0,
    rejected: { count: 0, amount: 0 },
  });

  useEffect(() => {
    if (vendorId && vendorProfile?.status === "verified") {
      // Reset on vendor change
      setRatings([]);
      setPage(1);
      setHasMore(true);
    }
  }, [vendorId, vendorProfile?.status]);

  useEffect(() => {
    if (vendorId && vendorProfile?.status === "verified") {
      loadMoreRatings();
    }
  }, [page, vendorId, vendorProfile?.status]);

  const loadMoreRatings = async () => {
    const { success, data } = await fetchVendorRatings(vendorId, page, LIMIT);

    if (success && Array.isArray(data)) {
      // ✅ Remove duplicate reviews using r_id
      setRatings((prev) => {
        const newIds = new Set(prev.map((r) => r.r_id));
        const filtered = data.filter((r) => !newIds.has(r.r_id));
        return [...prev, ...filtered];
      });

      if (data.length < LIMIT) {
        setHasMore(false);
      }
    }
  };


  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 1 }
    );

    const sentinel = document.getElementById("load-more-ratings-sentinel");
    if (sentinel) observer.observe(sentinel);

    return () => {
      if (sentinel) observer.disconnect();
    };
  }, [ratings, hasMore]);


  const toggleItems = (id) => {
    setShowAllItemsMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const onChangeCalendar = (value) => {
    setDateRange(value);
    setShowCalendar(false);
  };
  const submitReply = async (id) => {
    const trimmedReply = replyText.trim();

    if (!trimmedReply) {
      toast.error("Please type a reply before submitting.");
      return;
    }

    const result = await addVendorReply(id, trimmedReply);

    if (result.success) {
      setReplies((prev) => ({ ...prev, [id]: trimmedReply }));
      setReplyingId(null);
      setReplyText("");

      // ✅ Realtime UI Update
      setRatings((prevRatings) =>
        prevRatings.map((r) =>
          r.r_id === id ? { ...r, vendor_reply: trimmedReply } : r
        )
      );
    } else {
      toast.error("Reply save nahi hua. Try again.");
    }
  };

  const handleReplyClick = (id) => {
    setReplyingId(id);
    setReplyText("");
  };

  const handleReplyChange = (e) => {
    setReplyText(e.target.value);
  };

  const cancelReply = () => {
    setReplyingId(null);
    setReplyText("");
  };

  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekEnd = today;
  const monthStart = startOfMonth(today);
  const monthEnd = today;

  useEffect(() => {
    if (vendorId && vendorProfile?.status === "verified") {
      const fetchStats = async () => {

        const { success, data: orders } = await fetchVendorOrders(
          vendorId,
          null,
          0,
          0,
          true
        );

        if (!success || !orders) {
          return;
        }


        const today = new Date();
        const weekRange = {
          start: startOfWeek(today, { weekStartsOn: 1 }),
          end: today,
        };
        const monthRange = {
          start: startOfMonth(today),
          end: today,
        };

        let totalOrders = orders.length;
        let deliveredOrders = 0;

        let weekOrders = 0,
          weekAmount = 0;
        let monthOrders = 0,
          monthAmount = 0;
        let todayOrders = 0,
          todayAmount = 0;

        orders.forEach((order, index) => {
          const status = order?.status?.toLowerCase();
          const orderDate = new Date(order?.created_ts);
          const total_amount = order?.total_amount || 0;
          const Item_amount = total_amount / 2;
          const vendor_discount = order?.vendor_discount || 0;
          const discounted_amount =
            (Item_amount * (100 - vendor_discount)) / 100;
          const amount = discounted_amount || 0;

          if (status === "delivered") {
            deliveredOrders++;

        

            if (isWithinInterval(orderDate, weekRange)) {
              weekOrders++;
              weekAmount += amount;
            }

            if (isWithinInterval(orderDate, monthRange)) {
              monthOrders++;
              monthAmount += amount;
            }

            if (
              orderDate.getFullYear() === today.getFullYear() &&
              orderDate.getMonth() === today.getMonth() &&
              orderDate.getDate() === today.getDate()
            ) {
              todayOrders++;
              todayAmount += amount;
            }
          } else {
          }
        });

       

        // 📊 Earnings Summary
     
      

        setThisWeek({ total_orders: weekOrders, total_amount: weekAmount });
        setThisMonth({ total_orders: monthOrders, total_amount: monthAmount });
        setTodayStats({ total_orders: todayOrders, total_amount: todayAmount });
      };

      fetchStats();
    }
  }, [vendorId, vendorProfile?.status]);

  useEffect(() => {
    if (
      vendorId &&
      vendorProfile?.status === "verified" &&
      Array.isArray(dateRange)
    ) {
      const calculateStatsForDateRange = async () => {
        const { success, data: orders } = await fetchVendorOrders(
          vendorId,
          null,
          0,
          0,
          true // ✅ Important: Fetch all orders, not just 10
        );

        if (!success || !orders) return;

        const [start, end] = dateRange;
        let earnings = 0,
          orderCount = 0,
          rejectedAmount = 0,
          rejectedCount = 0;

        orders.forEach((order) => {
          const orderDate = new Date(order?.created_ts);
          const total_amount = order?.total_amount || 0;
          const Item_amount = total_amount / 2;
          const vendor_discount = order?.vendor_discount || 0;
          const discounted_amount =
            (Item_amount * (100 - vendor_discount)) / 100;
          const amount = discounted_amount || 0;

          if (orderDate >= start && orderDate <= end) {
            const status = order.status?.toLowerCase();

            if (status === "rejected") {
              rejectedCount++;
              rejectedAmount += amount;
            }

            if (status === "delivered") {
              orderCount++;
              earnings += amount;
            }
          }
        });

        setSelectedStats({
          earnings,
          orders: orderCount,
          rejected: {
            count: rejectedCount,
            amount: rejectedAmount,
          },
        });
      };

      calculateStatsForDateRange();
    }
  }, [vendorId, dateRange, vendorProfile?.status]);

  // Track state changes separately


  useEffect(() => {
    if (vendorId && vendorProfile?.status === "verified") {
      const getRatingStats = async () => {
        const { success, averageRating, totalCustomers } =
          await fetchVendorRatingStats(vendorId);
        if (success) {
          setRatingStats({ averageRating, totalCustomers });
        }
      };

      getRatingStats();
    }
  }, [vendorId, vendorProfile?.status]);

  return (
    <div className="">
      <div className="max-w-2xl mx-auto w-full bg-gray-100 space-y-6 min-h-[92vh]">
        {/* <Header title="Earnings" /> */}
        <div className="max-w-2xl mx-auto w-full px-2 pt-10 pb-5 mt-5 space-y-6">
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
              {/* Delivered Orders */}
              <section className="bg-white rounded-lg shadow p-4 md:p-6">
                <h2 className="text-md md:text-2xl lg:text-2xl font-medium text-gray uppercase mb-4">
                  Delivered Orders
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
                    <p className="text-gray-600">
                      Today: {format(today, "dd MMM yyyy")}
                    </p>
                    <p className="text-xl font-semibold text-orange-600">
                      ₹{(todayStats?.total_amount).toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {todayStats?.total_orders} orders
                    </p>
                  </div>
                  <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
                    <p className="text-gray-600">
                      This Week: {format(weekStart, "dd MMM")} -{" "}
                      {format(weekEnd, "dd MMM")}
                    </p>
                    <p className="text-xl font-semibold text-orange-600">
                      ₹{(thisWeek?.total_amount).toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {thisWeek?.total_orders} orders
                    </p>
                  </div>
                  <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
                    <p className="text-gray-600">
                      This Month: {format(monthStart, "dd MMM")} -{" "}
                      {format(monthEnd, "dd MMM")}
                    </p>
                    <p className="text-xl font-semibold text-orange-600">
                      ₹{(thisMonth?.total_amount).toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {thisMonth?.total_orders} orders
                    </p>
                  </div>
                </div>
              </section>

              {/* Insights Section */}
              <section className="bg-white rounded-lg shadow p-4 md:p-6 relative">
                <div className="flex justify-between items-center  flex-wrap gap-2">
                  <h2 className="text-md md:text-2xl lg:text-2xl font-medium text-gray uppercase">
                    Insights
                  </h2>
                  <div className="flex items-center  gap-2">
                    <p className="text-xs text-gray-500">
                      {Array.isArray(dateRange)
                        ? `${dateRange[0].toLocaleDateString("en-US", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })} - ${dateRange[1].toLocaleDateString("en-US", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}`
                        : dateRange.toLocaleDateString("en-US", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                    </p>
                    <button
                      onClick={() => setShowCalendar((prev) => !prev)}
                      className="cursor-pointer"
                    >
                      <BsCalendarDate />
                    </button>
                  </div>
                </div>

                {showCalendar && (
                  <div
                    className="mt-4 absolute right-20 rounded-lg shadow-lg bg-white"
                    style={{
                      width: "280px",
                      height: "auto",
                      zIndex: 50,
                      padding: "10px",
                    }}
                  >
                    <Calendar
                      selectRange={true}
                      onChange={onChangeCalendar}
                      value={dateRange}
                      maxDate={new Date()}
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 -50 gap-4 mt-6 text-left">
                  <div className="p-4 border border-orange-200 rounded-lg bg-orange-50">
                    <p className="text-gray-600">Earnings</p>
                    <p className="text-xl font-semibold text-orange-600">
                      ₹{(selectedStats?.earnings).toFixed(2)}
                    </p>
                  </div>
                  <div className="p-4 border border-orange-200 rounded-lg bg-orange-50">
                    <p className="text-gray-600">Orders</p>
                    <p className="text-xl font-semibold text-orange-600">
                      {selectedStats?.orders}
                    </p>
                  </div>
                  <div className="p-4 border border-orange-200 rounded-lg bg-orange-50">
                    <p className="text-gray-600">Rejected</p>
                    <p className="text-xl font-semibold text-orange-600">
                      ₹{selectedStats?.rejected?.amount} (
                      {selectedStats?.rejected?.count} orders)
                    </p>
                  </div>
                </div>
              </section>

              {/* Ratings & Reviews */}
              <section className="bg-white rounded-lg shadow p-4 md:p-6 mb-10">
                <h2 className="text-md md:text-2xl lg:text-2xl font-medium text-gray uppercase mb-4">
                  Ratings & Reviews
                </h2>
                <div className="my-4 p-4 bg-white rounded-lg shadow">
                  <p>
                    Your store is rated ⭐ {ratingStats.averageRating} by{" "}
                    {ratingStats.totalCustomers} customer
                    {ratingStats.totalCustomers !== 1 ? "s" : ""}
                  </p>
                </div>

                {ratings.length === 0 ? (
                  <p className="text-gray-500 text-sm">No ratings yet.</p>
                ) : (
                  <div className="space-y-4">
                    {ratings.map((rating) => (
                      <div
                        key={rating?.r_id}
                        className="border-orange-200 shadow-all border-1 p-4 rounded-lg bg-gray-50 space-y-1"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            <img
                              src={
                                !rating.user?.dp_url ||
                                rating.user?.dp_url === "NA"
                                  ? "/defaultuserImage.jpg"
                                  : rating.user.dp_url
                              }
                              className="w-10 h-10 rounded-full"
                              alt="User DP"
                            />
                            <div>
                              <h3 className="font-semibold text-gray-800">
                                {rating?.user?.name}
                              </h3>
                              <div className="text-green-600 text-sm whitespace-nowrap">
                                <span className="text-gray-500">Spended</span> ₹
                                {(() => {
                                  const total = rating.order?.total_amount || 0;

                                  const itemHalf = total / 2;
                                  const discount =
                                    rating?.order?.vendor_discount || 0;
                               
                                  const final =
                                    (itemHalf * (100 - discount)) / 100;
                                  return final.toFixed(2);
                                })()}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="text-sm text-gray-500">
                          <span className="font-medium text-gray-800">
                            Items:
                          </span>{" "}
                          {rating.order?.order_item
                            ?.map((oi) => oi.items?.item_name)
                            .join(", ")}
                        </div>

                        <div className="flex justify-between items-center text-sm mt-1">
                          <div className="text-yellow-500 leading-tight flex items-center gap-1">
                            {/* Filled stars */}
                            {"⭐"
                              .repeat(rating?.rating_number)
                              .split("")
                              .map((star, i) => (
                                <span key={`filled-${i}`} className="text-base">
                                  {star}
                                </span>
                              ))}

                            {/* Unfilled stars with bigger size */}
                            {"☆"
                              .repeat(5 - rating?.rating_number)
                              .split("")
                              .map((star, i) => (
                                <span
                                  key={`unfilled-${i}`}
                                  className="text-xl text-yellow-400"
                                >
                                  {star}
                                </span>
                              ))}

                            {/* Rating text */}
                            <span className="ml-1 text-sm text-black">
                              ({rating?.rating_number}.0)
                            </span>
                          </div>
                        </div>
                        {/* Reply button: Only show if comment exists, and not already replied */}
                        {/* Customer Comment with Image */}
                        {rating.comment !== "NA" && (
                          <div className="flex items-start gap-2 mt-2">
                            <img
                              src={
                                !rating.user?.dp_url ||
                                rating.user?.dp_url === "NA"
                                  ? "/defaultuserImage.jpg"
                                  : rating.user.dp_url
                              }
                              alt="Customer"
                              className="w-6 h-6 rounded-full object-cover"
                            />

                            <div className=" max-w-md w-full text-sm overflow-auto break-words max-h-32">
                              <p className="text-gray-700 whitespace-pre-wrap">
                                {rating.comment}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Reply button: show only if comment exists and not already replied */}
                        {rating.comment !== "NA" &&
                          !replies[rating.r_id] &&
                          replyingId !== rating.r_id &&
                          (!rating.vendor_reply ||
                            rating.vendor_reply === "NA") && (
                            <button
                              className="text-blue-500 text-sm underline mt-2"
                              onClick={() => handleReplyClick(rating.r_id)}
                            >
                              Reply
                            </button>
                          )}

                        {/* Reply input box with vendor image */}
                        {/* Reply Input Box */}
                        {replyingId === rating.r_id && (
                          <div className="flex items-start gap-2 mt-3">
                            {/* Vendor Image */}
                            <img
                              src={
                                !vendorProfile?.banner_url ||
                                vendorProfile?.banner_url === "NA"
                                  ? "/defaultuserImage.jpg"
                                  : vendorProfile.banner_url
                              }
                              className="w-6 h-6 rounded-full object-cover"
                              alt="Vendor"
                            />

                            <div className="flex-1 -mt-1.5 space-y-1">
                              {/* Input */}
                              <input
                                type="text"
                                className={`border w-full p-2 rounded text-sm ${
                                  replyText.length > 50 ? "border-red-500" : ""
                                }`}
                                placeholder="Type your reply..."
                                value={replyText}
                                onChange={handleReplyChange}
                              />

                              {/* Error message */}
                              {replyText.length > 50 && (
                                <p className="text-red-500 text-xs">
                                  Maximum 30 characters allowed
                                </p>
                              )}

                              {/* Buttons */}
                              <div className="flex gap-3 text-sm pt-1">
                                <button
                                  onClick={() => submitReply(rating.r_id)}
                                  disabled={
                                    !replyText.trim() || replyText.length > 30
                                  }
                                  className={`px-3 py-1 rounded text-white ${
                                    replyText.trim() && replyText.length <= 50
                                      ? "bg-orange hover:bg-orange-700"
                                      : "bg-orange-300 cursor-not-allowed"
                                  }`}
                                >
                                  Reply
                                </button>
                                <button
                                  onClick={cancelReply}
                                  className="bg-gray-300 px-3 py-1 rounded"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Show Reply (from backend) */}
                        {rating.vendor_reply &&
                          rating.vendor_reply !== "NA" && (
                            <div className="flex items-start gap-2 mt-4">
                              {/* Vendor Image */}
                              <img
                                src={
                                  !vendorProfile?.banner_url ||
                                  vendorProfile?.banner_url === "NA"
                                    ? "/defaultuserImage.jpg"
                                    : vendorProfile.banner_url
                                }
                                alt="Vendor"
                                className="w-6 h-6 rounded-full object-cover"
                              />

                              {/* Reply Text */}
                              <div className="-mt-1 max-w-md w-full text-sm overflow-auto break-words max-h-32 bg-gray-50 p-2 rounded">
                                <p className="text-gray-700 whitespace-pre-wrap">
                                  {rating.vendor_reply}
                                </p>
                              </div>
                            </div>
                          )}
                      </div>
                    ))}

                    {/* 👇 Infinite scroll sentinel 👇 */}
                    {hasMore && (
                      <div
                        id="load-more-ratings-sentinel"
                        className="h-10 w-full text-center text-gray-400"
                      >
                        Loading more...
                      </div>
                    )}
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default VendorEarnings;
