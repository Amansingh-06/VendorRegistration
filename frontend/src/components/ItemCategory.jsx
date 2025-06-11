import React, { useState, useEffect } from "react";
import { FiSearch } from "react-icons/fi";
import { supabase } from "../utils/supabaseClient"; // ✅ import your client

export default function ItemCategory({
    name = "category",
    value = [],
    onChange,
    error,
}) {
    const [query, setQuery] = useState("");
    const [allOptions, setAllOptions] = useState([]); // ✅ All categories
    const [suggestions, setSuggestions] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);

    const maxSuggestions = 10;
    const maxSelections = 5;

    // ✅ Fetch all cuisine_category data on mount
    useEffect(() => {
        const fetchCategories = async () => {
            const { data, error } = await supabase
                .from("cuisine_category")
                .select("c_id, name"); // 👈 change field names if different

            if (error) {
                console.error("Failed to fetch cuisines:", error);
            } else {
                setAllOptions(data || []);
            }
        };

        fetchCategories();
    }, []);

    // ✅ Sync selected value from parent
    useEffect(() => {
        const validIds = Array.isArray(value) ? value.map(String) : [];
        setSelectedIds(validIds);
    }, [value]);

    // ✅ Filter suggestions when query changes
    useEffect(() => {
        if (query.trim() === "") {
            setSuggestions([]);
        } else {
            const timer = setTimeout(() => {
                const filtered = allOptions.filter(item =>
                    item.name.toLowerCase().includes(query.toLowerCase())
                );
                setSuggestions(filtered.slice(0, maxSuggestions));
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [query, allOptions]);

    const handleInputChange = (e) => {
        const input = e.target.value;
        if (/^[a-zA-Z\s]*$/.test(input) && !/^\s/.test(input)) {
            setQuery(input);
        }
    };

    const toggleItem = (id) => {
        const strId = String(id);
        let updated;
        if (selectedIds.includes(strId)) {
            updated = selectedIds.filter(i => i !== strId);
        } else if (selectedIds.length < maxSelections) {
            updated = [...selectedIds, strId];
        } else {
            updated = selectedIds;
        }

        setSelectedIds(updated);
        onChange(updated);
        setQuery("");
        setSuggestions([]);
    };

    const getNameById = (c_id) => {
        const item = allOptions.find(i => String(i.c_id) === String(c_id));
        return item ? item?.name : c_id;
    };

    return (
        <div className="p-4 shadow-lg rounded-2xl w-full bg-white">
            <h1 className="text-base font-semibold text-gray-500 mb-3">Select Cuisine</h1>

            <div className="relative">
                <FiSearch className="absolute top-1/2 left-3 transform -translate-y-1/2 text-orange-500 text-lg" />
                <input
                    type="text"
                    placeholder="Search Here"
                    className={`w-full pl-10 pr-4 py-2 border rounded-xl focus:outline-none ${error ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-orange-400"
                        }`}
                    value={query}
                    onChange={handleInputChange}
                />
            </div>

            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}

            {selectedIds.length > 0 && (
                <div className="mt-4">
                    <h3 className="font-semibold text-gray-500 mb-2">Selected:</h3>
                    <div className="flex flex-wrap gap-2 overflow-x-auto no-scrollbar">
                        {selectedIds.map(c_id => (
                            <label
                                key={c_id}
                                className="flex items-center px-3 py-1 border border-orange-500 bg-orange-100 text-orange-700 rounded-lg text-sm cursor-pointer whitespace-nowrap"
                            >
                                <input
                                    type="checkbox"
                                    checked={true}
                                    onChange={() => toggleItem(c_id)}
                                    className="accent-orange-500 mr-1 w-4 h-4"
                                />
                                {getNameById(c_id)}
                            </label>
                        ))}
                    </div>
                </div>
            )}

            {suggestions.length > 0 && (
                <div className="mt-6">
                    <h3 className="font-semibold text-gray-500 mb-2">Suggestions:</h3>
                    <div className="flex flex-wrap gap-2">
                        {suggestions.map(({ c_id, name }) => (
                            <label
                                key={c_id}
                                className="flex items-center px-3 py-1 border border-gray-300 rounded-full bg-gray-100 hover:bg-orange-100 hover:border-orange-400 cursor-pointer text-sm"
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedIds.includes(String(c_id))}
                                    onChange={() => toggleItem(c_id)}
                                    className="accent-orange-500 mr-1 w-4 h-4"
                                />
                                {name}
                            </label>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
