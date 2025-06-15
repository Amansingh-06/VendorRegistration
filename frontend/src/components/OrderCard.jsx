import React, { useState, useEffect } from 'react';
import { Clock, Receipt } from 'lucide-react';
import { updateOrderStatus } from '../utils/updateOrderStatus';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

const OrderCard = ({ order, onStatusUpdate }) => {
    const [localStatus, setLocalStatus] = useState(order?.status);
    const [loading, setLoading] = useState(false);
    const [showOtpPopup, setShowOtpPopup] = useState(false);
    const [otp, setOtp] = useState('');
    const [submittingOtp, setSubmittingOtp] = useState(false);

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
            onStatusUpdate?.(order?.order_id);
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
console.log(order)
    return (
        <>
            <div className="rounded-lg shadow-md border border-gray-200 bg-white p-4 text-sm space-y-3">
                <div className="flex justify-between items-start gap-2 ">
                    <p className="font-semibold text-gray-700 break-all w-[150px] md:w-[450px] ">
                        ID:<span className="text-black text-xs md:text-sm px-1 py-0.5 rounded">{order.user_order_id}</span>
                    </p>
                    <div className="flex items-center gap-1 text-gray-500 mt-1">
                        <Clock className="w-4 h-4" />
                        {/* <span className="text-xs">
                            {new Date(order?.created_ts).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: true
                            })}
                        </span> */}
                        <span className="text-xs text-gray-500">
                            Placed {formatDistanceToNow(new Date(order?.created_ts), { addSuffix: true })}
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
                            <span key={i} className=" px-2 py-1 rounded flex flex-wrap ">
                                {item?.quantity} x {item?.name}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 text-gray-700">
                        <Receipt className="w-4 h-4 text-gray-500" />
                        <span className="font-semibold">
                            <p className="text-sm">
                                Total: <span className="  mr-2">₹{order.transaction.amount}</span>
                            </p>
                        </span>
                    </div>
                    {/* <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-medium">
                        PAID
                    </span> */}
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

                {currentStatus === 'prepared' && (
                    <div className="text-center mt-2">
                        <button
                            onClick={() => setShowOtpPopup(true)}
                            className="bg-purple-600 text-white py-1.5 px-3 rounded-lg md:w-1/2 font-semibold text-sm"
                        >
                            Hand Over Order (Verify OTP)
                        </button>
                    </div>
                )}
            </div>

            {/* OTP POPUP */}
            {showOtpPopup && (
                <div className="inset-0 z-50 backdrop-blur-sm bg-black/30 fixed flex justify-center items-center">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-sm space-y-4">
                        <h3 className="text-lg font-bold text-gray-700">Enter OTP</h3>

                        <input
                            type="text"
                            value={otp}
                            maxLength={6}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} // only digits
                            className={`w-full border ${otp.length > 0 && otp.length !== 6 ? 'border-red-500' : 'border-gray-300'} rounded px-3 py-2 outline-none`}
                            placeholder="Enter 6-digit OTP"
                        />

                        {/* Error below input */}
                        {otp.length > 0 && otp.length !== 6 && (
                            <p className="text-red-500 text-xs -mt-2">OTP must be 6 digits</p>
                        )}

                        <div className="flex justify-end gap-2 pt-2">
                            <button
                                onClick={() => setShowOtpPopup(false)}
                                className="px-3 py-1 rounded bg-gray-300 text-gray-700"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={async () => {
                                    if (!otp || otp.length !== 6) return;

                                    setSubmittingOtp(true);
console.log(otp,"order?.otp")
                                    if (parseInt(otp) !== parseInt(order?.otp)) {
                                        setSubmittingOtp(false);
                                        toast.error("Invalid OTP. Please try again.");
                                        return;
                                    }


                                    const { success } = await updateOrderStatus(order?.order_id, 'on the way');
                                    if (success) {
                                        setLocalStatus('on the way');
                                        setShowOtpPopup(false);
                                        onStatusUpdate?.(order?.order_id);
                                        toast.success("OTP verified. Delivery started.");
                                    } else {
                                        toast.error("Something went wrong. Try again.");
                                    }

                                    setSubmittingOtp(false);
                                }}
                                className={`px-3 py-1 rounded text-white ${otp.length === 6 ? 'bg-green-600' : 'bg-gray-400 cursor-not-allowed'
                                    }`}
                                disabled={otp.length !== 6 || submittingOtp}
                            >
                                {submittingOtp ? "Submitting..." : "Submit"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </>
    );
};

export default OrderCard;
