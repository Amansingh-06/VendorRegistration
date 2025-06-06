import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useAuth } from './authContext';

// Create context
const FetchContext = createContext();

export function FetchProvider({ children }) {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { vendorProfile } = useAuth();

    const fetchItems = async () => {
        if (!vendorProfile?.v_id) return; // safety check

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

    // Call fetchItems when vendorProfile.v_id is available or changes
    useEffect(() => {
        fetchItems();
    }, [vendorProfile?.v_id]);

    return (
        <FetchContext.Provider value={{ items, loading, error, fetchItems }}>
            {children}
        </FetchContext.Provider>
    );
}

// Custom hook to use context easily
export function useFetch() {
    return useContext(FetchContext);
}
