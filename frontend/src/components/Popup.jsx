import React, { useState } from "react";
import { toast } from "react-hot-toast";

const OfferPopup = ({ isOpen, onClose, onSubmit, offerText, setOfferText }) => {
  const [error, setError] = useState(""); // for inline errors

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const value = e.target.value;

    // ✅ Check if only digits allowed
    if (/^\d{0,3}$/.test(value)) {
      const num = parseInt(value);

      if (value === "") {
        setOfferText("");
        setError("");
      } else if (num >= 0 && num <= 100) {
        setOfferText(value);

        if (num > 60) {
          setError("Discount must be between 0 and 60%");
        } else {
          setError(""); // ✅ Valid input
        }
      } else {
        setError("Discount must be between 0 and 60%");
      }
    } else {
      // ❌ If invalid character (letters/symbols)
      setError("Only numbers allowed");
    }
  };

  const isValid =
    offerText.trim() !== "" &&
    /^\d{1,3}$/.test(offerText) &&
    parseInt(offerText) >= 0 &&
    parseInt(offerText) <= 60 &&
    !error;

  const handleSubmit = () => {
    const value = parseInt(offerText);
    if (value < 0 || value > 60) {
      setError("Discount must be between 0 and 60%");
      toast.error("Discount must be between 0 and 60%");
      return;
    }

    setError("");
    onSubmit();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 mx-4">
        <h2 className="text-xl font-semibold text-center text-orange mb-4">
          Enter your current offer
        </h2>

        <input
          type="text"
          value={offerText}
                              inputMode="numeric"

          onChange={handleInputChange}
          placeholder="e.g. 10"
          maxLength={3}
          className={`w-full border rounded-lg px-4 py-2 focus:outline-none ${
            isValid
              ? "border-gray-300 focus:ring-2 focus:ring-orange-500"
              : "border-red-400 focus:ring-2 focus:ring-red-400"
          }`}
        />

        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}

        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border text-gray-600 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isValid}
            className={`px-4 py-2 rounded-lg text-white font-medium ${
              isValid
                ? "bg-orange-500 hover:bg-orange-600"
                : "bg-orange-300 cursor-not-allowed"
            }`}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default OfferPopup;
