import React from 'react';
import { Clock, Receipt, ArrowDownUp } from 'lucide-react';

const OrderCard = ({ name, time, deliveryStatus, price, status, items, orderId, pickupType, readyTime }) => {

    // ✅ EASY LOGIC: Count repeated items
    const getItemCounts = (items) => {
        const counts = {};
        items.forEach(item => {
            const key = item.trim().toLowerCase(); // make it case-insensitive
            const label = item.trim().charAt(0).toUpperCase() + item.trim().slice(1).toLowerCase(); // Capitalize first letter
            if (counts[label]) {
                counts[label]++;
            } else {
                counts[label] = 1;
            }
        });
        return counts;
    };

    const itemCounts = getItemCounts(items);

    return (
        <div className="rounded-lg shadow-md border border-gray-200 bg-white p-4 text-sm">
            {/* Order ID and Time */}
            <div className="flex justify-between items-center">
                <p className="font-semibold text-gray-700">ID: <span className="text-black">{orderId}</span></p>
                <div className="flex items-center gap-1 text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span>{time}</span>
                    <span></span>
                </div>
            </div>

            {/* Status */}
            <div className="mt-2 flex justify-between items-center">
                <span
                    className={`text-xs px-2 py-1 rounded-full font-semibold 
    ${deliveryStatus === 'PREPARING' || deliveryStatus === 'ON THE WAY'
                            ? 'bg-yellow-50 text-yellow'
                            : deliveryStatus === 'DELIVERED' || deliveryStatus === 'Delayed'
                                ? 'bg-green-50 text-green'
                                : 'bg-red-100 text-red'
                        }`}
                >
                    {deliveryStatus}
                </span>

                <p
                    className={`text-xs font-medium -mt-5 mr-2 
    ${pickupType === 'Schedule'
                            ? 'text-green-600'
                            : pickupType === 'Standard'
                                ? 'text-yellow-500'
                                : pickupType === 'Rapid'
                                    ? 'text-red-500'
                                    : 'text-gray-500'
                        }`}
                >
                    {pickupType}
                </p>            </div>

            {/* Items */}
            <ul className="mt-3 space-y-1 text-gray-800">
                {Object.entries(itemCounts).map(([item, count], index) => (
                    <li key={index}>{count} x {item}</li>
                ))}
            </ul>

            {/* Price */}
            <div className="mt-3 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-gray-500" />
                    <span className="font-semibold">Total bill: ₹{price}</span>
                    <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded text-xs">PAID</span>
                </div>
            </div>

            {/* Ready Time */}
            <div className="mt-5 bg-blue text-white py-1.5 px-3 rounded-lg text-center font-semibold text-sm md:max-w-48">
                ORDER READY ({readyTime})
            </div>
        </div>
    );
};

export default OrderCard;
