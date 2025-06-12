import React, { useState } from 'react';
import BottomNav from '../components/Footer';
import Header from '../components/Header';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

const VendorEarnings = () => {
    const initialReviews = [
        {
            id: 1,
            name: "Aman Singh",
            image: "https://wallpaperaccess.com/full/7126297.jpg",
            items: ["1x-Chole Kulche", "2x-Chole Bhature", "1x-Paneer Roll"],
            rating: 4,
            amount: 250,
            reply: "",
        },
        {
            id: 2,
            name: "Priya Sharma",
            image: "https://tse4.mm.bing.net/th?id=OIP.N86-8jk9lmt6wMfjI2IabQHaEo&pid=Api&P=0&h=180",
            items: ["1x-Aloo Tikki", "1x-Chai"],
            rating: 5,
            amount: 80,
            reply: "Thanks for your kind feedback!",
        }
    ];

    const [reviews, setReviews] = useState(initialReviews);
    const [showAllItemsMap, setShowAllItemsMap] = useState({});
    const [replyingId, setReplyingId] = useState(null);
    const [replyText, setReplyText] = useState("");
    const [showCalendar, setShowCalendar] = useState(false);
    const [dateRange, setDateRange] = useState([new Date('2025-04-01'), new Date('2025-05-01')]);
    const [thisWeek, setThisWeek] = useState({ total_orders: 0, total_amount: 0 });
    const [thisMonth, setThisMonth] = useState({ total_orders: 0, total_amount: 0 });

    const toggleItems = (id) => {
        setShowAllItemsMap((prev) => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const onChangeCalendar = (value) => {
        setDateRange(value);
    };

    const handleReplyClick = (id) => {
        setReplyingId(id);
        const existingReply = reviews.find(r => r.id === id)?.reply || "";
        setReplyText(existingReply);
    };

    const handleReplyChange = (e) => {
        setReplyText(e.target.value);
    };

    const submitReply = (id) => {
        const updated = reviews.map(review =>
            review.id === id ? { ...review, reply: replyText } : review
        );
        setReviews(updated);
        setReplyingId(null);
        setReplyText("");
    };

    const cancelReply = () => {
        setReplyingId(null);
        setReplyText("");
    };

    // ✅ Dynamic date range for week and month
    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
    const monthStart = startOfMonth(today);
    const monthEnd = endOfMonth(today);

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col justify-between">
            <div className="max-w-2xl mx-auto w-full space-y-6 rounded-lg shadow-lg">
                <Header title="Earnings" />
                <div className='max-w-2xl mx-auto w-full px-4 py-6 space-y-6'>
                    {/* Delivered Orders */}
                    <section className="bg-white rounded-xl shadow p-4 md:p-6">
                        <h2 className="text-lg font-semibold text-gray-500 mb-4">Delivered Orders</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
                                <p className="text-gray-600">Today: {format(today, 'dd MMM yyyy')}</p>
                                <p className="text-xl font-bold text-orange-600">₹2620</p>
                                <p className="text-sm text-gray-500">22 orders</p>
                            </div>
                            <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
                                <p className="text-gray-600">
                                    This Week: {format(weekStart, 'dd MMM')} - {format(weekEnd, 'dd MMM')}
                                </p>
                                <p className="text-xl font-bold text-orange-600">₹20500</p>
                                <p className="text-sm text-gray-500">1803 orders</p>
                            </div>
                            <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
                                <p className="text-gray-600">
                                    This Month: {format(monthStart, 'dd MMM')} - {format(monthEnd, 'dd MMM')}
                                </p>
                                <p className="text-xl font-bold text-orange-600">₹1,98,492</p>
                                <p className="text-sm text-gray-500">2000 orders</p>
                            </div>
                        </div>
                    </section>

                    {/* Insights Section */}
                    <section className="bg-white rounded-xl shadow p-4 md:p-6 relative">
                        <div className="flex justify-between items-center flex-wrap gap-2">
                            <h2 className="text-lg font-semibold text-gray-500">Insights</h2>
                            <div className="flex items-center gap-2">
                                <p className="text-sm text-gray-500">
                                    {Array.isArray(dateRange)
                                        ? `${dateRange[0].toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })} - ${dateRange[1].toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}`
                                        : dateRange.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </p>
                                <button onClick={() => setShowCalendar((prev) => !prev)} className="cursor-pointer">
                                    📅
                                </button>
                            </div>
                        </div>

                        {showCalendar && (
                            <div
                                className="mt-4 absolute right-20 rounded-lg shadow-lg bg-white"
                                style={{ width: '280px', height: 'auto', zIndex: 50, padding: '10px' }}
                            >
                                <Calendar
                                    selectRange={true}
                                    onChange={onChangeCalendar}
                                    value={dateRange}
                                />
                            </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 text-center">
                            <div className="p-4 border rounded-lg bg-gray-50">
                                <p className="text-gray-600">Earnings</p>
                                <p className="text-xl font-bold text-gray-800">₹XX</p>
                            </div>
                            <div className="p-4 border rounded-lg bg-gray-50">
                                <p className="text-gray-600">Orders</p>
                                <p className="text-xl font-bold text-gray-800">XX</p>
                            </div>
                            <div className="p-4 border rounded-lg bg-gray-50">
                                <p className="text-gray-600">Rejected</p>
                                <p className="text-xl font-bold text-red-600">₹XX (XX orders)</p>
                            </div>
                        </div>
                    </section>

                    {/* Ratings & Reviews */}
                    <section className="bg-white rounded-xl shadow p-4 md:p-6 mb-24">
                        <h2 className="text-lg font-semibold text-gray-500 mb-4">Ratings & Reviews</h2>
                        <div className="space-y-4">
                            {reviews.map((review) => (
                                <div key={review.id} className="border-primary border-1 p-4 rounded-lg bg-gray-50 space-y-3">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-3">
                                            <img src={review.image} alt={review.name} className="w-10 h-10 rounded-full" />
                                            <h3 className="font-semibold text-gray-800">{review.name}</h3>
                                        </div>
                                        {!review.reply && replyingId !== review.id && (
                                            <button
                                                onClick={() => handleReplyClick(review.id)}
                                                className="text-sm text-blue-600 hover:underline"
                                            >
                                                Reply
                                            </button>
                                        )}
                                    </div>

                                    <div className="text-sm text-gray-500">
                                        <span className="font-medium text-gray-600">Items:</span>{' '}
                                        {review.items.join(' ')}
                                    </div>

                                    <div className="flex justify-between items-center text-sm mt-1">
                                        <div className="text-yellow-500 leading-tight">
                                            {'⭐'.repeat(review.rating) + '☆'.repeat(5 - review.rating)} ({review.rating}.0)
                                        </div>
                                        <div className="text-green-600 font-semibold whitespace-nowrap">₹{review.amount}</div>
                                    </div>

                                    {replyingId === review.id && (
                                        <div className="space-y-2 mt-2">
                                            <textarea
                                                value={replyText}
                                                onChange={handleReplyChange}
                                                rows="2"
                                                className="w-full border rounded-md p-2 text-sm"
                                                placeholder="Write your reply here..."
                                            />
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => submitReply(review.id)}
                                                    className="px-4 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                                                >
                                                    Submit
                                                </button>
                                                <button
                                                    onClick={cancelReply}
                                                    className="px-4 py-1 bg-gray-300 text-gray-800 rounded-md text-sm hover:bg-gray-400"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {review.reply && replyingId !== review.id && (
                                        <div className="text-sm text-gray-600 bg-orange-100 p-2 rounded-md mt-2">
                                            <span className="font-medium text-gray-700">Reply:</span> {review.reply}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
            <BottomNav />
        </div>
    );
};

export default VendorEarnings;
