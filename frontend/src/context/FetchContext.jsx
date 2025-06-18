import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useAuth } from './authContext';
import { SUPABASE_TABLES } from '../utils/vendorConfig';

const FetchContext = createContext();

export function FetchProvider({ children }) {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { vendorProfile } = useAuth();

    // ✅ Fetch items from DB
    const fetchItems = async (silent = false) => {
        if (!vendorProfile?.v_id) return;

        if (!silent) setLoading(true);
        setError(null);

        try {
            const { data, error } = await supabase
                .from(SUPABASE_TABLES.ITEM)
                .select('*')
                .eq('vendor_id', vendorProfile.v_id)
                .eq('is_deleted', false); // ✅ Only fetch non-deleted items

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
        fetchItems(); // ✅ Initial fetch on mount
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
