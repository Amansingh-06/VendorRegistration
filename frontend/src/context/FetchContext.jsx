import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useAuth } from './authContext';

const FetchContext = createContext();

export function FetchProvider({ children }) {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { vendorProfile } = useAuth();

    const fetchItems = async () => {
        if (!vendorProfile?.v_id) return;

        setLoading(true);
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
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!vendorProfile?.v_id) return;

        fetchItems(); // Initial fetch

        const channel = supabase
            .channel('realtime-items')
            .on(
                'postgres_changes',
                {
                    event: '*', // 'INSERT' | 'UPDATE' | 'DELETE' | '*' for all
                    schema: 'public',
                    table: 'item',
                    filter: `vendor_id=eq.${vendorProfile.v_id}`,
                },
                (payload) => {
                    console.log('Realtime payload:', payload);
                    fetchItems(); // Refresh items on change
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel); // Cleanup
        };
    }, [vendorProfile?.v_id]);

    return (
        <FetchContext.Provider value={{ items, loading, error, fetchItems }}>
            {children}
        </FetchContext.Provider>
    );
}

export function useFetch() {
    return useContext(FetchContext);
}
