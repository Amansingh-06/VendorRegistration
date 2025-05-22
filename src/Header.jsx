import React from "react";

const Header = () => {
    return (
        <header className="bg-white shadow-md sticky top-0 z-50">
            <div className="container mx-auto flex items-center justify-between py-4 px-6">
                {/* Logo */}
                <div className="text-2xl font-bold text-indigo-600 cursor-pointer">
                    VendorApp
                </div>

                {/* Navigation Links */}
                <nav className="hidden md:flex space-x-8 text-gray-700 font-medium">
                    <a href="#" className="hover:text-indigo-600 transition">Home</a>
                    <a href="#" className="hover:text-indigo-600 transition">Products</a>
                    <a href="#" className="hover:text-indigo-600 transition">About</a>
                    <a href="#" className="hover:text-indigo-600 transition">Contact</a>
                </nav>

                {/* Search bar */}
                <div className="hidden md:flex items-center border rounded-md overflow-hidden">
                    <input
                        type="text"
                        placeholder="Search products..."
                        className="px-3 py-1 outline-none"
                    />
                    <button className="bg-indigo-600 text-white px-3 py-1 hover:bg-indigo-700 transition">
                        Search
                    </button>
                </div>

                {/* User/Login Button */}
                <div className="ml-4">
                    <button className="bg-indigo-600 text-white px-4 py-1 rounded-md hover:bg-indigo-700 transition">
                        Login
                    </button>
                </div>

                {/* Mobile menu icon */}
                <div className="md:hidden text-gray-700 cursor-pointer">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-7 w-7"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                    </svg>
                </div>
            </div>
        </header>
    );
};

export default Header;
