import React, { useState, useEffect } from 'react';
import { Clock, Receipt } from 'lucide-react';
import { updateOrderStatus } from '../utils/updateOrderStatus';

const OrderCard = ({ order, onStatusUpdate }) => {
    const [localStatus, setLocalStatus] = useState(order?.status);
    const [loading, setLoading] = useState(false);

    // Sync local status with props update
    useEffect(() => {
        setLocalStatus(order?.status);
    }, [order?.status]);

    const currentStatus = localStatus?.toLowerCase();

    let action = null;
    if (currentStatus === 'pending') {
        action = { label: 'Accept Order', nextStatus: 'accepted', color: 'bg-blue-500' };
    } else if (currentStatus === 'accepted') {
        action = { label: 'Start Preparing', nextStatus: 'preparing', color: 'bg-yellow-500' };
    } else if (currentStatus === 'preparing') {
        action = { label: 'Mark as Prepared', nextStatus: 'prepared', color: 'bg-green-500' };
    }

    const handleAction = async () => {
        if (!action || loading) return;
        setLoading(true);
        const { success } = await updateOrderStatus(order?.order_id, action?.nextStatus);
        if (success) {
            setLocalStatus(action.nextStatus);
            onStatusUpdate?.(order?.order_id); // 🔄 Notify parent to refresh
        } else {
            alert('Failed to update status');
        }
        setLoading(false);
    };

    const itemCounts = Array.isArray(order?.order_item)
        ? order?.order_item.map(i => ({
            name: i.items?.item_name,
            quantity: i.quantity,
            price: i.final_price
        }))
        : [];

    return (
        <div className="rounded-lg shadow-md border border-gray-200 bg-white p-4 text-sm space-y-3">
            <div className="flex justify-between items-center">
                <p className="font-semibold text-gray-700">
                    ID: <span className="text-black">{order.order_id}</span>
                </p>
                <div className="flex items-center gap-1 text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span className="text-xs">
                        {new Date(order?.created_ts).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                        })}
                    </span>
                </div>
            </div>

            <div className="flex justify-between items-center -mt-1">
                <span className={`
                    text-xs px-2 py-1 rounded-full font-semibold
                    ${localStatus === 'preparing' || localStatus === 'on the way'
                        ? 'bg-yellow-50 text-yellow-600'
                        : localStatus === 'delivered' || localStatus === 'prepared'
                            ? 'bg-green-50 text-green-600'
                            : 'bg-red-100 text-red-600'}
                `}>
                    {localStatus}
                </span>
                <span className={`
                    text-xs font-medium
                    ${order?.delivery_type === 'Schedule'
                        ? 'text-green-600'
                        : order?.delivery_type === 'Standard'
                            ? 'text-yellow-500'
                            : order?.delivery_type === 'Rapid'
                                ? 'text-red-500'
                                : 'text-gray-500'}
                `}>
                    {order?.delivery_type}
                </span>
            </div>

            <div>
                <h4 className="font-medium text-gray-600 mb-1">Items:</h4>
                <div className="flex flex-wrap gap-2 text-gray-800">
                    {itemCounts?.map((item, i) => (
                        <span key={i} className="bg-gray-100 px-2 py-1 rounded">
                            {item?.quantity} x {item?.name}
                        </span>
                    ))}
                </div>
            </div>


            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-gray-700">
                    <Receipt className="w-4 h-4 text-gray-500" />
                    <span className="font-semibold">
                        Total: ₹{itemCounts.reduce((acc, item) => acc + (item.price || 0), 0)}
                    </span>
                </div>
                <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-medium">
                    PAID
                </span>
            </div>

            {action && (
                <div className="text-center">
                    <button
                        onClick={handleAction}
                        disabled={loading}
                        className={`
                            ${action.color}
                            text-white py-1.5 px-3 rounded-lg md:w-1/2 font-semibold text-sm cursor-pointer
                            ${loading ? 'opacity-50 cursor-not-allowed' : ''}
                        `}
                    >
                        {loading ? 'Updating...' : action.label}
                    </button>
                </div>
            )}
        </div>
    );
};

export default OrderCard;
