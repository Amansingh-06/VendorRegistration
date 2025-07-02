import React from "react";

const OfferPopup = ({
  isOpen,
  onClose,
  onSubmit,
  offerText,
  setOfferText,
}) => {
  if (!isOpen) return null;

  // Allow only digits, max 100
  const handleInputChange = (e) => {
    const value = e.target.value;

    // ✅ Allow only numbers AND max value 100
    if (/^\d{0,3}$/.test(value)) {
      const num = parseInt(value);
      if (value === "" || (num >= 0 && num <= 100)) {
        setOfferText(value);
      }
    }
  };

  const isValid = offerText.trim() !== "" && parseInt(offerText) <= 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 mx-4">
        <h2 className="text-xl font-semibold text-center text-orange mb-4">
          Enter your current offer
        </h2>

        <input
          type="text"
          value={offerText}
          onChange={handleInputChange}
          placeholder="e.g. 10"
          maxLength={3} // ✅ prevent typing large numbers
          className={`w-full border rounded-lg px-4 py-2 mb-4 focus:outline-none ${
            isValid
              ? "border-gray-300 focus:ring-2 focus:ring-orange-500"
              : "border-red-400 focus:ring-2 focus:ring-red-400"
          }`}
        />

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border text-gray-600 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
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
