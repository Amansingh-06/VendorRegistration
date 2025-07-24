import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "../utils/supabaseClient";
import { fetchVendorOrders } from "../utils/fetchVendorOrders";
import { fetchOrderById } from "../utils/FetchOrderById";
import {
  ORDER_KEYS,
  ORDER_CHANNELS,
  ORDER_PAGINATION,
} from "../utils/constants/OrderConfig";
import { SUPABASE_TABLES } from "../utils/constants/Table&column";

// helper function to match statuses
const isStatusMatch = (a, b) =>
  (a || "").toLowerCase() === (b || "").toLowerCase();

export const useVendorOrders = (vendorId, activeStatus = "All") => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const LIMIT = ORDER_PAGINATION.LIMIT;

  const initialLoaded = useRef(false);

  // function to fetch orders
  const loadOrders = useCallback(
    async (reset = false) => {
      if (!vendorId || isLoading) return;

      const offset = reset ? 0 : orders.length;
      setIsLoading(true);

      const { success, data } = await fetchVendorOrders(
        vendorId,
        activeStatus,
        LIMIT,
        offset,
        false
      );

      if (success) {
        setOrders((prev) => {
          if (reset) return data;

          const existingIds = new Set(prev.map((o) => o[ORDER_KEYS.ORDER_ID]));
          const newOrders = data.filter(
            (o) => !existingIds.has(o[ORDER_KEYS.ORDER_ID])
          );
          return [...prev, ...newOrders];
        });

        setHasMore(data.length === LIMIT);
      }

      setIsLoading(false);
    },
    [vendorId, activeStatus, orders.length, isLoading]
  );

  // reset state on vendor or status change
  useEffect(() => {
    if (!vendorId) return;
    initialLoaded.current = false;
    setOrders([]);
    setHasMore(true);
  }, [vendorId, activeStatus]);

  // load orders initially once
  useEffect(() => {
    if (!vendorId || initialLoaded.current) return;
    initialLoaded.current = true;
    loadOrders(true);
  }, [vendorId, activeStatus, loadOrders]);

  // handle realtime updates
  useEffect(() => {
    if (!vendorId) return;

    const channel = supabase
      .channel(ORDER_CHANNELS.VENDOR_ORDERS)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: SUPABASE_TABLES.ORDERS,
          filter: `${ORDER_KEYS.VENDOR_ID}=eq.${vendorId}`,
        },
        async (payload) => {
          const updatedOrder = payload.new;
          const orderId = updatedOrder?.[ORDER_KEYS.ORDER_ID];
          if (!updatedOrder || !orderId) return;

          // fetch complete latest order from DB
          setTimeout(async () => {
            const { success, data: fullOrder } = await fetchOrderById(orderId);
            if (!success || !fullOrder) return;

            setOrders((prev) => {
              const index = prev.findIndex(
                (o) => o[ORDER_KEYS.ORDER_ID] === fullOrder[ORDER_KEYS.ORDER_ID]
              );

              if (index !== -1) {
                // update existing
                const updated = [...prev];
                updated[index] = fullOrder;
                return updated;
              }

              // add new
              return [fullOrder, ...prev];
            });
          }, 300); // delay for DB consistency
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [vendorId]);

  return {
    orders,
    hasMore,
    isLoading,
    setOrders,
    loadMore: () => loadOrders(false),
    refreshOrders: () => loadOrders(true),
  };
};
