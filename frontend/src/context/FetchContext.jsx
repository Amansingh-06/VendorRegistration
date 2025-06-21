import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useAuth } from './authContext';
import { SUPABASE_TABLES } from '../utils/vendorConfig';

const FetchContext = createContext();

export function FetchProvider({ children }) {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { vendorProfile, selectedVendorId ,session} = useAuth();
    const vendorId = vendorProfile?.v_id || selectedVendorId; // ✅ fallback

    // ✅ Fetch items from DB
    const fetchItems = async (silent = false) => {
        if (!vendorProfile?.v_id) return;

        if (!silent) setLoading(true);
        setError(null);

        try {
            const { data, error } = await supabase
                .from(SUPABASE_TABLES.ITEM)
                .select('*')
                .eq('vendor_id', vendorId)
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
        if (!vendorId) return;
        fetchItems(); // ✅ Initial fetch on mount
    }, [vendorId]);

    return (
        <FetchContext.Provider value={{ items, setItems, loading, error, fetchItems }}>
            {children}
        </FetchContext.Provider>
    );
}

export function useFetch() {
    return useContext(FetchContext);
}
