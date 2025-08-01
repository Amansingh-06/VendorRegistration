import React, { useState, useEffect } from "react";
import { FiSearch } from "react-icons/fi";
import { supabase } from "../utils/supabaseClient";
import { SUPABASE_TABLES } from "../utils/constants/Table&column";

export default function ItemCategory({
  name = "category",
  value = [],
  onChange,
  error,
}) {
  const [query, setQuery] = useState("");
  const [allOptions, setAllOptions] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [localError, setLocalError] = useState("");


  const maxSuggestions = 10;
  const maxSelections = 10;

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from(SUPABASE_TABLES.ITEM_CATEGORY)
        .select("c_id, name");

      if (error) {
        console.error("Failed to fetch cuisines:", error);
      } else {
        setAllOptions(data || []);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const validIds = Array.isArray(value) ? value.map(String) : [];
    const areSame =
      validIds.length === selectedIds.length &&
      validIds.every((val, i) => val === selectedIds[i]);

    if (!areSame) {
      console.log("Updating selectedIDS from props:",validIds)
      setSelectedIds(validIds);
    }
  }, [value]);

  useEffect(() => {
    const timer = setTimeout(() => {
      let filtered = [];

      if (query.trim() === "") {
        filtered = allOptions.slice(0, maxSuggestions);
      } else {
        filtered = allOptions
          .filter((item) =>
            item.name.toLowerCase().includes(query.toLowerCase())
          )
          .slice(0, maxSuggestions);
      }

      setSuggestions(filtered);
    }, 200);
    return () => clearTimeout(timer);
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
    updated = selectedIds.filter((i) => i !== strId);
    setLocalError(""); // ❌ error reset on remove
  } else if (selectedIds.length < maxSelections) {
    updated = [...selectedIds, strId];
    setLocalError(""); // ✅ no error
  } else {
    // ✅ Show error
    setLocalError(`You can select up to ${maxSelections} categories only.`);
    return; // Don't update anything
  }

  setSelectedIds(updated);
  onChange(updated);
};


  const getNameById = (c_id) => {
    const item = allOptions.find((i) => String(i.c_id) === String(c_id));
    return item ? item?.name : c_id;
  };

  return (
    <div className="p-4 shadow-lg border border-gray-300 rounded-lg w-full bg-white">
      <h1 className="text-md lg:text-2xl font-medium text-gray uppercase mb-3">
        Select Cuisine
      </h1>

      <div className="relative">
        <FiSearch className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-500 text-lg" />
        <input
          type="text"
          placeholder="Search Here"
          className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none ${
            error
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-300 focus:ring-orange-400"
          }`}
          value={query}
          onChange={handleInputChange}
        />
      </div>

      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}


      {selectedIds.length > 0 && (
        <div className="mt-4">
          <h3 className="font-medium text-gray-500 text-sm uppercase mb-2">
            Selected:
          </h3>
          <div className="flex flex-wrap gap-2 overflow-x-auto no-scrollbar">
            {selectedIds.map((c_id) => (
              <label
                key={c_id}
                className="flex items-center px-3 py-1 border border-orange-500 bg-orange-100 text-orange-700 rounded-lg text-sm cursor-pointer whitespace-nowrap"
              >
                <input
                  type="checkbox"
                  checked={true}
                  onChange={() => toggleItem(c_id)}
                  className="w-4 h-4 mr-1 rounded border border-orange-500 bg-orange-500 text-white checked:bg-orange-500 checked:border-orange-500 appearance-none 
             checked:before:content-['✔'] checked:before:text-white checked:before:text-xs checked:before:flex checked:before:items-center checked:before:justify-center"
                />

                {getNameById(c_id)}
              </label>
            ))}

          </div>
                            {localError && <p className="text-red-500 text-sm mt-1">{localError}</p>}

        </div>
      )}

      {suggestions.length > 0 && (
        <div className="mt-6">
          <h3 className="font-medium text-gray text-sm uppercase mb-2">
            Suggestions:
          </h3>
          <div className="flex flex-wrap gap-2">
            {suggestions.map(({ c_id, name }) => (
              <label
                key={c_id}
                className="flex items-center px-3 py-1 border border-gray-300 rounded-lg bg-gray-100 hover:bg-orange-100 hover:border-orange-400  cursor-pointer text-sm"
              >
                <input
                  type="checkbox"
                  checked={selectedIds.includes(String(c_id))}
                  onChange={() => toggleItem(c_id)}
                  className="w-4 h-4 mr-1 rounded border border-gray-300 appearance-none 
             bg-white checked:bg-orange-500 checked:border-orange-500 
             checked:before:content-['✔'] checked:before:text-white 
             checked:before:flex checked:before:items-center checked:before:justify-center 
             checked:before:text-xs checked:before:h-full checked:before:w-full"
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
