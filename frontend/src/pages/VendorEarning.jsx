import React, { useState, useEffect } from "react";
import BottomNav from "../components/Footer";
import Header from "../components/Header";
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

const VendorEarnings = () => {
  const { vendorProfile, selectedVendorId } = useAuth();
  const vendorId = vendorProfile?.v_id || selectedVendorId;
  const [ratings, setRatings] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const LIMIT = 5;

  // const [reviews, setReviews] = useState(initialReviews);
  const [showAllItemsMap, setShowAllItemsMap] = useState({});
  const [replyingId, setReplyingId] = useState(null);
  const [replyText, setReplyText] = useState("");
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
    if (success) {
      setRatings((prev) => [...prev, ...data]);
      if (data.length < LIMIT) {
        setHasMore(false); // no more data
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

  console.log("rating", ratings);

  const toggleItems = (id) => {
    setShowAllItemsMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const onChangeCalendar = (value) => {
    setDateRange(value);
    setShowCalendar(false);
  };

  // const handleReplyClick = (id) => {
  //   setReplyingId(id);
  //   const existingReply = reviews.find((r) => r.id === id)?.reply || "";
  //   setReplyText(existingReply);
  // };

  // const handleReplyChange = (e) => {
  //   setReplyText(e.target.value);
  // };

  // const submitReply = (id) => {
  //   const updated = reviews.map((review) =>
  //     review.id === id ? { ...review, reply: replyText } : review
  //   );
  //   setReviews(updated);
  //   setReplyingId(null);
  //   setReplyText("");
  // };

  // const cancelReply = () => {
  //   setReplyingId(null);
  //   setReplyText("");
  // };

  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekEnd = today;
  const monthStart = startOfMonth(today);
  const monthEnd = today;

  useEffect(() => {
    if (vendorId && vendorProfile?.status === "verified") {
      const fetchStats = async () => {
        const { success, data: orders } = await fetchVendorOrders(vendorId);
        if (!success || !orders) return;

        const today = new Date();
        const weekRange = {
          start: startOfWeek(today, { weekStartsOn: 1 }),
          end: today,
        };
        const monthRange = {
          start: startOfMonth(today),
          end: today,
        };

        let weekOrders = 0,
          weekAmount = 0;
        let monthOrders = 0,
          monthAmount = 0;
        let todayOrders = 0,
          todayAmount = 0;

        orders.forEach((order) => {
          // ✅ Only include delivered orders
          if (order.status?.toLowerCase() !== "delivered") return;

          const orderDate = new Date(order.created_ts);
          const amount = order.transaction?.amount || 0;

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
        });

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
        const { success, data: orders } = await fetchVendorOrders(vendorId);
        if (!success || !orders) return;

        const [start, end] = dateRange;
        let earnings = 0,
          orderCount = 0,
          rejectedAmount = 0,
          rejectedCount = 0;

        orders.forEach((order) => {
          const orderDate = new Date(order.created_ts);
          const amount = order.transaction?.amount || 0;

          // ✅ Must be in selected date range
          if (orderDate >= start && orderDate <= end) {
            // ✅ Count rejected orders separately
            if (order.status?.toLowerCase() === "rejected") {
              rejectedCount++;
              rejectedAmount += amount;
            }

            // ✅ Only include delivered orders in earnings and order count
            if (order.status?.toLowerCase() === "delivered") {
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
    console.log("✅ thisWeek Updated:", thisWeek);
  }, [thisWeek]);

  useEffect(() => {
    console.log("✅ thisMonth Updated:", thisMonth);
  }, [thisMonth]);

  return (
    <div className="">
      <div className="max-w-2xl mx-auto w-full bg-gray-100 space-y-6 min-h-[92vh]">
        {/* <Header title="Earnings" /> */}
        <div className="max-w-2xl mx-auto w-full px-2 pt-10 pb-5 mt-5 space-y-6">
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
              {/* Delivered Orders */}
              <section className="bg-white rounded-lg shadow p-4 md:p-6">
                <h2 className="text-lg font-semibold text-gray-500 mb-4">
                  Delivered Orders
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
                    <p className="text-gray-600">
                      Today: {format(today, "dd MMM yyyy")}
                    </p>
                    <p className="text-xl font-bold text-orange-600">
                      ₹{todayStats?.total_amount}
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
                    <p className="text-xl font-bold text-orange-600">
                      ₹{thisWeek?.total_amount}
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
                    <p className="text-xl font-bold text-orange-600">
                      ₹{thisMonth?.total_amount}
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
                  <h2 className="text-lg font-semibold text-gray-500">
                    Insights
                  </h2>
                  <div className="flex items-center  gap-2">
                    <p className="text-sm text-gray-500">
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
                      📅
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

                <div className="grid grid-cols-1 sm:grid-cols-3 -50 gap-4 mt-6 text-center">
                  <div className="p-4 border rounded-lg bg-orange-100">
                    <p className="text-gray-600">Earnings</p>
                    <p className="text-xl font-bold text-orange-600">
                      ₹{selectedStats?.earnings}
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg bg-orange-100">
                    <p className="text-gray-600">Orders</p>
                    <p className="text-xl font-bold text-orange-600">
                      {selectedStats?.orders}
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg bg-orange-50">
                    <p className="text-gray-600">Rejected</p>
                    <p className="text-xl font-bold text-orange-600">
                      ₹{selectedStats?.rejected?.amount} (
                      {selectedStats?.rejected?.count} orders)
                    </p>
                  </div>
                </div>
              </section>

              {/* Ratings & Reviews */}
              <section className="bg-white rounded-xl shadow p-4 md:p-6 mb-24">
  <h2 className="text-lg font-semibold text-gray-500 mb-4">
    Ratings & Reviews
  </h2>

  {ratings.length === 0 ? (
    <p className="text-gray-500 text-sm">No ratings yet.</p>
  ) : (
    <div className="space-y-4">
      {ratings.map((rating) => (
        <div
          key={rating.r_id}
          className="border-primary border-1 p-4 rounded-lg bg-gray-50 space-y-3"
        >
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <img
                src={
                  !rating.user?.dp_url || rating.user?.dp_url === "NA"
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
                <span className="text-gray-500 ">Spended</span>  ₹{rating.order?.total_amount}
                  </div>
            </div>
            </div>
          </div>

          <div className="text-sm text-gray-500">
            <span className="font-medium text-gray-800">Items:</span>{" "}
            {rating.order?.order_item
              ?.map((oi) => oi.items?.item_name)
              .join(", ")}
          </div>

          <div className="flex justify-between items-center text-sm mt-1">
            <div className="text-yellow-500 leading-tight">
              {"⭐".repeat(rating?.rating_number) +
                "☆".repeat(5 - rating?.rating_number)}{" "}
              ({rating?.rating_number}.0)
            </div>
            
          </div>
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
