import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useAuth } from './authContext';

const FetchContext = createContext();

export function FetchProvider({ children }) {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { vendorProfile } = useAuth();

    // ✅ Modified fetchItems with `silent` param
    const fetchItems = async (silent = false) => {
        if (!vendorProfile?.v_id) return;

        if (!silent) setLoading(true); // don't trigger loader in silent mode
        setError(null);

        try {
            const { data, error } = await supabase
                .from('item')
                .select('*')
                .eq('vendor_id', vendorProfile.v_id);

            if (error) throw error;
            setItems(data || []);
        } catch (err) {
            setError(err.message);
        } finally {
            if (!silent) setLoading(false);
        }
    };

    useEffect(() => {
        if (!vendorProfile?.v_id) return;

        fetchItems(); // Initial fetch with loader

        const channel = supabase
            .channel('realtime-items')
            .on(
                'postgres_changes',
                {
                    event: '*', // INSERT / UPDATE / DELETE
                    schema: 'public',
                    table: 'item',
                    filter: `vendor_id=eq.${vendorProfile.v_id}`,
                },
                (payload) => {
                    console.log('Realtime payload:', payload);
                    fetchItems(true); // ✅ silent refresh
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel); // Cleanup
        };
    }, [vendorProfile?.v_id]);

    return (
        <FetchContext.Provider value={{ items, setItems, loading, error, fetchItems }}>
            {children}
        </FetchContext.Provider>
    );
}

export function useFetch() {
    return useContext(FetchContext);
}
