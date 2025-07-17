import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '../utils/supabaseClient';
import { fetchVendorOrders } from '../utils/fetchVendorOrders';

const isStatusMatch = (a, b) => (a || '').toLowerCase() === (b || '').toLowerCase();

export const useVendorOrders = (vendorId, activeStatus = 'All') => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const LIMIT = 10;

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

          const existingIds = new Set(prev.map((o) => o.order_id));
          const newOrders = data.filter((o) => !existingIds.has(o.order_id));
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

  // ✅ Realtime listener (no sorting)
  useEffect(() => {
    if (!vendorId) return;

    const channel = supabase
      .channel('realtime-orders')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `v_id=eq.${vendorId}`,
        },
        async (payload) => {
          const updatedOrder = payload.new;
          const eventType = payload.eventType;

          const matchesFilter =
            activeStatus.toLowerCase() === 'all' ||
            isStatusMatch(updatedOrder?.status, activeStatus);

          // ✅ Re-fetch full order with foreign keys
          const { data: fullOrder, error } = await supabase
            .from('orders')
            .select(`
              *,
              order_item:order_item!order_item_order_id_fkey (
                order_item_id,
                quantity,
                final_price,
                items:item_id (
                  item_id,
                  item_name,
                  item_price,
                  img_url,
                  veg
                )
              ),
              transaction:t_id (
                t_id,
                amount,
                payment_id,
                status,
                payement_mehtod,
                created_at
              ),
              user:u_id (
                user_id,
                name,
                dp_url
              )
            `)
            .eq('order_id', updatedOrder.order_id)
            .single();

          if (error || !fullOrder) return;

          setOrders((prev) => {
            const index = prev.findIndex((o) => o.order_id === fullOrder.order_id);

            if (!matchesFilter) {
              if (index !== -1) {
                const updated = [...prev];
                updated.splice(index, 1);
                return updated;
              }
              return prev;
            }

            if (index !== -1) {
              // ✅ Update existing
              const updated = [...prev];
              updated[index] = fullOrder;
              return updated;
            } else {
              // ✅ Add to top (no sorting)
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
