import React,{useState} from 'react';
import BottomNav from '../components/Footer';
import Header from '../components/Header';
import { DateRange } from 'react-date-range';
import { format } from 'date-fns';

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


    const toggleItems = (id) => {
        setShowAllItemsMap((prev) => ({
            ...prev,
            [id]: !prev[id]
        }));
    };
  
    // Calendar ke liye onChange handler
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

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col justify-between ">

            {/* Wrapper with max-width for Header + Content */}
            <div className="max-w-2xl mx-auto w-full  space-y-6  rounded-lg shadow-lg">

                {/* Header inside the same container */}
                <Header title="Earnings" />
                <div className='max-w-2xl mx-auto w-full px-4 py-6 space-y-6 '>

                    {/* Delivered Orders */}
                    <section className="bg-white rounded-xl shadow p-4 md:p-6">
                        <h2 className="text-lg font-semibold text-gray-500 mb-4">Delivered Orders</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
                                <p className="text-gray-600">Today</p>
                                <p className="text-xl font-bold text-orange-600">₹2620</p>
                                <p className="text-sm text-gray-500">22 orders</p>
                            </div>
                            <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
                                <p className="text-gray-600">This Week: 20-27 Apr</p>
                                <p className="text-xl font-bold text-orange-600">₹20500</p>
                                <p className="text-sm text-gray-500">1803 orders</p>
                            </div>
                            <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
                                <p className="text-gray-600">This Month: 01-31 Apr</p>
                                <p className="text-xl font-bold text-orange-600">₹1,98,492</p>
                                <p className="text-sm text-gray-500">2000 orders</p>
                            </div>
                        </div>
                    </section>

                    {/* Summary Section */}
                    <section className="bg-white rounded-xl shadow p-4 md:p-6 relative">
                        {/* Heading + Date Display + Icon */}
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

                        {/* 📅 Calendar Picker Toggle */}
                        {/* 📅 Calendar Picker Toggle */}
                        {showCalendar && (
                            <div
                                className="mt-4 absolute right-20 rounded-lg shadow-lg bg-white"
                                style={{ width: '280px', height: 'auto', zIndex: 50, padding: '10px' }}
                            >
                                <Calendar
                                    selectRange={true}
                                    onChange={onChangeCalendar}
                                    value={dateRange}
                                    // calendarType="ISO 8601"  // ya "US", dono supported hain
                                />

                            </div>
                        )}


                        {/* Stats */}
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
                                    {/* User Info + Reply Button */}
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={review.image}
                                                alt={review.name}
                                                className="w-10 h-10 rounded-full"
                                            />
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

                                    {/* Item list */}
                                    <div className="text-sm text-gray-500">
                                        <span className="font-medium text-gray-600">Items:</span>{' '}
                                        {review.items.join(' ')}
                                        {/* {showAllItemsMap[review.id]
                                            ? review.items.join(', ')
                                            : review.items.slice(0, 2).join(', ') + (review.items.length > 2 ? '...' : '')}
                                        {review.items.length > 2 && (
                                            <button
                                                onClick={() => toggleItems(review.id)}
                                                className="ml-2 text-blue-600 hover:underline"
                                            >
                                                {showAllItemsMap[review.id] ? 'Show less' : 'Show all items'}
                                            </button>
                                        )} */}
                                    </div>

                                    {/* Rating and Amount */}
                                    <div className="flex justify-between items-center text-sm mt-1">
                                        <div className="text-yellow-500 leading-tight">
                                            {'⭐'.repeat(review.rating) + '☆'.repeat(5 - review.rating)} ({review.rating}.0)
                                        </div>
                                        <div className="text-green-600 font-semibold whitespace-nowrap">₹{review.amount}</div>
                                    </div>

                                    {/* Reply Section */}
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
