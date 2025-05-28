import React, { useState } from 'react';
import ButtonGroup from '../components/FilterButton';
import OrderCard from '../components/OrderCard';
import Navbar from '../components/Navbar';
import BottomNav from '../components/Footer';

const sampleOrders = [
    {
        orderId: '485776 4640',
        name: 'Aman Kumar Singh',
        time: '6:30 PM',
        deliveryStatus: 'PREPARING',
        price: 40,
        status: 'PREPARING',
        pickupType: 'Standard',
        readyTime: '04:15',
        items: ['Grilled Lamb Chops', 'Beer Battered Fries'],
    },
    {
        orderId: '581425 3562',
        name: 'Raj Sharma',
        time: '6:35 PM',
        deliveryStatus: 'ON THE WAY',
        price: 45,
        status: 'PREPARING',
        pickupType: 'Rapid',
        readyTime: '01:13',
        items: ['Lamb Lasagne', 'Bruschetta'],
    },
    {
        orderId: '781325 8831',
        name: 'Neha Gupta',
        time: '6:20 PM',
        deliveryStatus: 'DELIVERED',
        price: 30,
        status: 'ON THE WAY',
        pickupType: 'Delivery',
        readyTime: '02:45',
        items: ['Paneer Wrap', 'Lassi','lassi','lassi'],
    },
];


const OrderPage = () => {
    const [active, setActive] = useState('All');
    const [orders, setOrders] = useState(sampleOrders);


    const filteredOrders =
        active === 'All'
            ? sampleOrders
            : sampleOrders.filter(order => order.status === active);

    return (
        <div className="flex flex-col items-center   bg-white rounded-lg shadow-lg font-family-poppins ">
            {/* ✅ Common centered wrapper */}
            <div className="w-full max-w-2xl  flex flex-col  bg-white gap-4">
                <Navbar />
                <div className="w-full max-w-2xl px-4 md:px-6 flex flex-col  bg-white rounded-lg shadow-lg gap-4">

                    <h1 className="text-2xl font-bold text-left text-black ">
                        Orders
                    </h1>

                    <div className="flex flex-wrap  ">
                        <ButtonGroup active={active} setActive={setActive} />
                    </div>

                    <div className="flex flex-col gap-4 pb-24">
                        {orders.map((order, index) => (
                            <OrderCard key={index} {...order} />
                        ))}

                    </div>
                </div>
            </div>
            <BottomNav />
        </div>
    );
};

export default OrderPage;
