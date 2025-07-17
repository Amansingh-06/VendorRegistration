import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '../utils/supabaseClient';
import { fetchVendorOrders } from '../utils/fetchVendorOrders';
import {
  ORDER_KEYS,
  ORDER_CHANNELS,
  ORDER_PAGINATION,
  ORDER_SELECT_QUERY
} from '../utils/constants/orderConfig';
import { SUPABASE_TABLES } from '../utils/constants/Table&column'; // adjust as needed

const isStatusMatch = (a, b) => (a || '').toLowerCase() === (b || '').toLowerCase();

export const useVendorOrders = (vendorId, activeStatus = 'All') => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const LIMIT = ORDER_PAGINATION.LIMIT;

  const initialLoaded = useRef(false);

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
          const newOrders = data.filter((o) => !existingIds.has(o[ORDER_KEYS.ORDER_ID]));
          return [...prev, ...newOrders];
        });

        setHasMore(data.length === LIMIT);
      }

      setIsLoading(false);
    },
    [vendorId, activeStatus, orders.length, isLoading]
  );

  useEffect(() => {
    if (!vendorId) return;
    initialLoaded.current = false;
    setOrders([]);
    setHasMore(true);
  }, [vendorId, activeStatus]);

  useEffect(() => {
    if (!vendorId || initialLoaded.current) return;
    initialLoaded.current = true;
    loadOrders(true);
  }, [vendorId, activeStatus, loadOrders]);

  useEffect(() => {
    if (!vendorId) return;

    const channel = supabase
      .channel(ORDER_CHANNELS.VENDOR_ORDERS)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: SUPABASE_TABLES.ORDERS,
          filter: `${ORDER_KEYS.VENDOR_ID}=eq.${vendorId}`,
        },
        async (payload) => {
          const updatedOrder = payload.new;

          const matchesFilter =
            activeStatus.toLowerCase() === 'all' ||
            isStatusMatch(updatedOrder?.[ORDER_KEYS.STATUS], activeStatus);

          const { data: fullOrder, error } = await supabase
            .from(SUPABASE_TABLES.ORDERS)
            .select(ORDER_SELECT_QUERY)
            .eq(ORDER_KEYS.ORDER_ID, updatedOrder[ORDER_KEYS.ORDER_ID])
            .single();

          if (error || !fullOrder) return;

          setOrders((prev) => {
            const index = prev.findIndex(
              (o) => o[ORDER_KEYS.ORDER_ID] === fullOrder[ORDER_KEYS.ORDER_ID]
            );

            if (!matchesFilter) {
              if (index !== -1) {
                const updated = [...prev];
                updated.splice(index, 1);
                return updated;
              }
              return prev;
            }

            if (index !== -1) {
              const updated = [...prev];
              updated[index] = fullOrder;
              return updated;
            } else {
              return [fullOrder, ...prev];
            }
          });
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
