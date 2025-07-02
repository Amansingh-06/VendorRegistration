import React,{useState} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { logout } from '../utils/auth';
import { useAuth } from '../context/authContext';
import { MdOutlineFastfood } from "react-icons/md";
import { GiChickenOven, GiFrenchFries, GiFullPizza } from 'react-icons/gi';
import { FaIceCream } from 'react-icons/fa';
import { PiBowlFood } from 'react-icons/pi';
import Loader from './Loader';
import { CiLogout } from "react-icons/ci";


const Header = ({ title = "Registration" }) => {
    const [loggingOut, setLoggingOut] = useState(false);

    const location = useLocation();
    const { setSession } = useAuth();
    const navigate = useNavigate();

    return (
        <>
<div className="fixed top-0 left-1/2 transform -translate-x-1/2 z-20  w-full max-w-2xl backdrop-blur-sm rounded-b-lg font-family-poppins">
<div className="absolute inset-0 rotate-180 overflow-hidden">
                <svg
                    className="absolute top-0 left-0 w-full h-full"
                    viewBox="0 0 1200 200"
                    preserveAspectRatio="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <defs>
                        <linearGradient
                            id="waveGradient3"
                            x1="0%"
                            y1="0%"
                            x2="100%"
                            y2="0%"
                        >
                            <stop offset="0%" stopColor="#e67110" stopOpacity="0.5" />
                            <stop offset="50%" stopColor="#e67110" stopOpacity="0.7" />
                            <stop offset="100%" stopColor="#e67110" stopOpacity="0.5" />
                        </linearGradient>
                        <linearGradient
                            id="waveGradient4"
                            x1="0%"
                            y1="0%"
                            x2="100%"
                            y2="0%"
                        >
                            <stop offset="0%" stopColor="#e67110" stopOpacity="0.6" />
                            <stop offset="50%" stopColor="#e67110" stopOpacity="0.6" />
                            <stop offset="100%" stopColor="#e67110" stopOpacity="0.5" />
                        </linearGradient>
                    </defs>

                    {/* First wave layer - covers full background */}
                    <path
                        d="M0,0 L1200,0 L1200,200 L0,200 Z"
                        fill="url(#waveGradient3)"
                    />

                    {/* Second wave layer */}
                    <path
                        d="M0,20 C200,260 400,35 600,24 C800,5 1000,19 1200,90 L1200,200 L0,200 Z"
                        fill="url(#waveGradient4)"
                    />

                    {/* Third wave layer */}
                    <path
                        d="M0,40 C400,305 800,35 1200,140 L1200,200 L0,200 Z"
                        fill="rgba(147, 197, 253, 0.1)"
                    />
                </svg>
            </div>
            {/* Floating Icons */}
            <div>
                <GiFullPizza className="absolute text-white z-40 opacity-30 text-2xl lg:text-4xl -top-2 right-8 animate-bounce-slow pointer-events-none" />
                <GiFrenchFries className="absolute text-white z-40 opacity-30 text-2xl lg:text-4xl animate-float pointer-events-none" />
                <GiChickenOven className="absolute text-white z-40 opacity-30 text-2xl lg:text-4xl  lg:top-1/3 right-44 animate-float pointer-events-none" />
                <FaIceCream className="absolute text-white z-40 opacity-15 text-2xl lg:text-4xl -top-2 right-18 animate-bounce-slow pointer-events-none" />
                <MdOutlineFastfood className="absolute text-white z-40 opacity-30 text-2xl lg:text-4xl bottom-0 lg:bottom-12 left-35 animate-bounce-slow pointer-events-none" />
                <GiFullPizza className="absolute text-white z-40 opacity-30 text-2xl lg:text-4xl -top-2 left-75 animate-float pointer-events-none" />
                <PiBowlFood className="absolute text-white z-40 opacity-30 text-2xl lg:text-4xl  right-62 animate-bounce-slow pointer-events-none" />
                <GiChickenOven className="absolute text-white z-40 opacity-30 text-2xl lg:text-4xl top-8 -right-[8px] animate-float pointer-events-none" />
                <FaIceCream className="absolute text-white z-40 opacity-15 text-2xl lg:text-4xl top-8 left-45 lg:left-1/2 animate-bounce-slow pointer-events-none" />
                <GiFrenchFries className="absolute text-white z-40 opacity-30 text-2xl lg:text-4xl top-2 left-40 animate-bounce-slow pointer-events-none" />
                <MdOutlineFastfood className="absolute text-white z-40 opacity-30 text-2xl lg:text-4xl top-10 left-20 lg:left-[530px] animate-float pointer-events-none" />
                <FaIceCream className="absolute text-white z-40 opacity-15 text-2xl lg:text-4xl top-12 right-[270px] animate-bounce-slow pointer-events-none" />
            </div>

            {/* Title and Logout */}
            <div
  className={`relative z-10 flex items-center p-4 w-full ${
    title === "Profile" ? "justify-between" : "justify-center"
  }`}
>
  <h1
    className={`text-2xl font-medium text-white ${
      title === "Profile" ? "text-left" : "text-center"
    }`}
  >
    {title}
  </h1>

  {title === "Profile" && (
     <button
     aria-label="Logout"
     onClick={() => logout(setSession, setLoggingOut)}
     disabled={loggingOut}
     className={`px-2 py-2 text-sm font-medium rounded-lg shadow-md transition-all duration-300 transform
       ${
         loggingOut
           ? "bg-gray-300 text-gray-500 cursor-not-allowed scale-100"
           : "bg-orange text-white hover:bg-orange-600 hover:shadow-lg hover:scale-105 active:scale-95"
       }`}
              >
    <CiLogout className="inline-block mr-2 text-lg font-bold" />
     {loggingOut ? "Logging out..." : "Logout"}
   </button>
  )}
</div>

            </div>
            {loggingOut && <Loader/>}

            </>
    );
};

export default Header;
