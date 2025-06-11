import React, { useState, useEffect } from "react";
import { FiSearch } from "react-icons/fi";

// ✅ Dummy suggestion list
const dummySuggestions = [
    { id: "1", name: "Chole" }, { id: "2", name: "North" }, { id: "3", name: "Roti" }, { id: "4", name: "Paneer" },
    { id: "5", name: "South" }, { id: "6", name: "Rice" }, { id: "7", name: "Dosa" }, { id: "8", name: "Idli" },
    { id: "9", name: "Paratha" }, { id: "10", name: "Upma" }, { id: "11", name: "Samosa" }, { id: "12", name: "Biryani" },
    { id: "13", name: "Puri" }, { id: "14", name: "Naan" }, { id: "15", name: "Thali" }, { id: "16", name: "Rajma" },
    { id: "17", name: "Kadhi" }, { id: "18", name: "Dal Makhani" }, { id: "19", name: "Tandoori" }, { id: "20", name: "Butter Naan" },
    { id: "21", name: "Litti" }, { id: "22", name: "Baati" }, { id: "23", name: "Kachori" }, { id: "24", name: "Pakora" },
    { id: "25", name: "Chutney" }, { id: "26", name: "Chana" }, { id: "27", name: "Halwa" }, { id: "28", name: "Kheer" },
    { id: "29", name: "Sabzi" }
];

export default function ItemCategory({
    name = "category",
    value = [],           // array of string IDs like ["7", "12"]
    onChange,
    error,
}) {
    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);

    const maxSuggestions = 10;
    const maxSelections = 5;

    // ✅ Sync value from parent (like setValue from React Hook Form)
    useEffect(() => {
        const validIds = Array.isArray(value) ? value.map(String) : [];
        setSelectedIds(validIds);
    }, [value]);

    // ✅ Update suggestions based on query
    useEffect(() => {
        if (query.trim() === "") {
            setSuggestions([]); // Hide suggestions on empty query
        } else {
            const timer = setTimeout(() => {
                const filtered = dummySuggestions.filter(item =>
                    item.name.toLowerCase().includes(query.toLowerCase())
                );
                setSuggestions(filtered.slice(0, maxSuggestions));
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [query]);

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
        onChange(updated); // Send updated IDs to parent (setValue)
        setQuery("");
        setSuggestions([]);
    };

    const getNameById = (id) => {
        const item = dummySuggestions.find(i => i.id === id);
        return item ? item.name : id;
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
                        {selectedIds.map(id => (
                            <label
                                key={id}
                                className="flex items-center px-3 py-1 border border-orange-500 bg-orange-100 text-orange-700 rounded-lg text-sm cursor-pointer whitespace-nowrap"
                            >
                                <input
                                    type="checkbox"
                                    checked={true}
                                    onChange={() => toggleItem(id)}
                                    className="accent-orange-500 mr-1 w-4 h-4"
                                />
                                {getNameById(id)}
                            </label>
                        ))}
                    </div>
                </div>
            )}

            {suggestions.length > 0 && (
                <div className="mt-6">
                    <h3 className="font-semibold text-gray-500 mb-2">Suggestions:</h3>
                    <div className="flex flex-wrap gap-2">
                        {suggestions.map(({ id, name }) => (
                            <label
                                key={id}
                                className="flex items-center px-3 py-1 border border-gray-300 rounded-full bg-gray-100 hover:bg-orange-100 hover:border-orange-400 cursor-pointer text-sm"
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedIds.includes(id)}
                                    onChange={() => toggleItem(id)}
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
