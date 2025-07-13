import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '../utils/supabaseClient';
import { fetchVendorOrders } from '../utils/fetchVendorOrders';

// 🔧 Helper for case-insensitive status match
const isStatusMatch = (a, b) => (a || '').toLowerCase() === (b || '').toLowerCase();

export const useVendorOrders = (vendorId, activeStatus = 'All') => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const LIMIT = 10;

  const initialLoaded = useRef(false);
  const debounceRef = useRef(null);

  const loadOrders = useCallback(
    async (reset = false) => {
      if (!vendorId || isLoading) {
        console.log('🛑 Skipped loadOrders because:', { vendorId, isLoading });
        return;
      }

      const offset = reset ? 0 : orders.length;
      console.log(`📦 Fetching orders... (reset=${reset}) offset=${offset}`);

      setIsLoading(true);

      const { success, data } = await fetchVendorOrders(
        vendorId,
        activeStatus,
        LIMIT,
        offset
      );

      console.log('✅ API response:', { dataLength: data?.length, data });

      if (success) {
        if (reset) {
          console.log('🔁 Resetting orders...');
          setOrders(data);
        } else {
          console.log('➕ Appending more orders with deduplication...');
          setOrders((prev) => {
            const existingIds = new Set(prev.map(o => o.order_id));
            const newOrders = data.filter(o => !existingIds.has(o.order_id));
            return [...prev, ...newOrders];
          });
        }

        const more = data.length === LIMIT;
        setHasMore(more);
        console.log('📊 hasMore:', more);
      } else {
        console.log('❌ Error fetching orders');
      }

      setIsLoading(false);
    },
    [vendorId, activeStatus, orders.length, isLoading]
  );

  // ✅ Reset on vendor/status change
  useEffect(() => {
    if (!vendorId) return;

    console.log('🔄 useEffect: vendor/status changed, resetting...');
    initialLoaded.current = false;
    setOrders([]);
    setHasMore(true);
  }, [vendorId, activeStatus]);

  // ✅ Load once after reset
  useEffect(() => {
    if (!vendorId || initialLoaded.current) return;

    console.log('🚀 Initial loadOrders triggered');
    initialLoaded.current = true;
    loadOrders(true);
  }, [vendorId, activeStatus, loadOrders]);

  // ✅ Realtime updates with debounce
  useEffect(() => {
    if (!vendorId) return;

    console.log('📡 Subscribed to realtime-orders');

    const ordersChannel = supabase
      .channel('realtime-orders')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `v_id=eq.${vendorId}`,
        },
        (payload) => {
          console.log('🔔 Realtime update triggered:', payload);
          clearTimeout(debounceRef.current);

          debounceRef.current = setTimeout(() => {
            const updatedOrder = payload.new;

            const matchesFilter =
              activeStatus.toLowerCase() === 'all' ||
              isStatusMatch(updatedOrder?.status, activeStatus);

            if (matchesFilter) {
              console.log('🔃 Reloading due to realtime update...');
              loadOrders(true);
            } else {
              console.log('🟡 Update ignored due to unmatched status.');
            }
          }, 300);
        }
      )
      .subscribe();

    return () => {
      console.log('🧹 Unsubscribed from realtime-orders');
      clearTimeout(debounceRef.current);
      supabase.removeChannel(ordersChannel);
    };
  }, [vendorId, activeStatus, loadOrders]);

  return {
    orders,
    hasMore,
    isLoading,
    setOrders,
    loadMore: () => loadOrders(false),
    refreshOrders: () => loadOrders(true),
  };
};
