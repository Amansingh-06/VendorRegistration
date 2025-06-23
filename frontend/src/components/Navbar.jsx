import React, { useState, useEffect } from 'react';
import { MdOutlineMessage } from "react-icons/md";
import { GiChickenOven, GiFrenchFries, GiFullPizza } from 'react-icons/gi';
import { FaIceCream } from 'react-icons/fa';
import { MdOutlineFastfood } from 'react-icons/md';
import { PiBowlFood } from 'react-icons/pi';
import { styled } from '@mui/material/styles';
import Switch from '@mui/material/Switch';
import { useAuth } from '../context/authContext';
import { supabase } from '../utils/supabaseClient';
import { truncateLetters, VENDOR_DATA_KEYS } from '../utils/vendorConfig';
import { SUPABASE_TABLES } from '../utils/vendorConfig';

const IOSSwitch = styled((props) => (
    <Switch focusVisibleClassName=".Mui-focusVisible" disableRipple {...props} />
))(({ theme }) => ({
    width: 42,
    height: 26,
    padding: 0,
    '& .MuiSwitch-switchBase': {
        padding: 0,
        margin: 2,
        transitionDuration: '300ms',
        '&.Mui-checked': {
            transform: 'translateX(16px)',
            color: '#fff',
            '& + .MuiSwitch-track': {
                backgroundColor: '#65C466',
                opacity: 1,
                border: 0,
            },
        },
    },
    '& .MuiSwitch-thumb': {
        boxSizing: 'border-box',
        width: 22,
        height: 22,
    },
    '& .MuiSwitch-track': {
        borderRadius: 26 / 2,
        backgroundColor: '#E9E9EA',
        opacity: 1,
        transition: theme.transitions.create(['background-color'], {
            duration: 500,
        }),
    },
}));

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [switchOn, setSwitchOn] = useState(false);
    const { session, vendorProfile } = useAuth();

    // ✅ Initialize switch based on vendorProfile.available
    useEffect(() => {
        if (vendorProfile?.available !== undefined && vendorProfile?.available !== null) {
            setSwitchOn(vendorProfile.available);
        }
    }, [vendorProfile]);

    const handleSwitchChange = async (checked) => {
        setSwitchOn(checked);

        if (!vendorProfile?.v_id) return;

        const { error } = await supabase
            .from(SUPABASE_TABLES?.VENDOR)
            .update({ available: checked })
            .eq(VENDOR_DATA_KEYS?.V_ID, vendorProfile?.v_id);

        if (error) {
            console.error("Failed to update vendor availability:", error.message);
        }
    };
    

    return (
        <div className="fixed w-full top-0 z-20 backdrop-blur-sm rounded-b-lg max-w-2xl font-family-poppins ">
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
                      <GiFullPizza className="absolute text-white z-40 opacity-30 text-2xl lg:text-4xl top-2 right-8 animate-bounce-slow pointer-events-none" />
                      <GiFrenchFries className="absolute text-white z-40 opacity-30 text-2xl lg:text-4xl bottom-5 left-3 animate-float pointer-events-none" />
                      <GiChickenOven className="absolute text-white z-40 opacity-30 text-2xl lg:text-4xl top-4 lg:top-1/3 right-44 animate-float pointer-events-none" />
                      <FaIceCream className="absolute text-white z-40 opacity-15 text-2xl lg:text-4xl bottom-2 right-18 animate-bounce-slow pointer-events-none" />
                      <MdOutlineFastfood className="absolute text-white z-40 opacity-30 text-2xl lg:text-4xl bottom-0 lg:bottom-12 left-35 animate-bounce-slow pointer-events-none" />
                      <GiFullPizza className="absolute text-white z-40 opacity-30 text-2xl lg:text-4xl top-1 left-70 animate-float pointer-events-none" />
                      <PiBowlFood className="absolute text-white z-40 opacity-30 text-2xl lg:text-4xl top-1 right-60 animate-bounce-slow pointer-events-none" />
                      <GiChickenOven className="absolute text-white z-40 opacity-30 text-2xl lg:text-4xl top-12 right-[470px] animate-float pointer-events-none" />
                      <FaIceCream className="absolute text-white z-40 opacity-15 text-2xl lg:text-4xl top-10 left-60 lg:left-1/2 animate-bounce-slow pointer-events-none" />
                      <GiFrenchFries className="absolute text-white z-40 opacity-30 text-2xl lg:text-4xl top-16 left-1/3 animate-bounce-slow pointer-events-none" />
                      <MdOutlineFastfood className="absolute text-white z-40 opacity-30 text-2xl lg:text-4xl top-2 left-20 lg:left-[530px] animate-float pointer-events-none" />
                      <FaIceCream className="absolute text-white z-40 opacity-15 text-2xl lg:text-4xl top-1 right-[570px] animate-bounce-slow pointer-events-none" />
                  </div>
      

            {/* Content */}
            <div className="relative z-10">
                {!scrolled && (
                    <div className={`flex items-center justify-between p-1 lg:p-4 max-w-9xl mx-auto transition-all duration-1200`}>
                        {/* Left Section - Profile */}
                        <div className='flex items-center gap-2 lg:gap-4'>
                            <div className='relative'>
                                <div className='flex items-center justify-center w-12 lg:w-16 h-12 lg:h-16 rounded-full bg-gradient-to-br from-orange-500 to-yellow-500 text-white font-bold text-lg shadow-lg ring-2 ring-white/30 backdrop-blur-sm border overflow-hidden'>
                                    {vendorProfile && vendorProfile?.banner_url && vendorProfile.banner_url !== 'NA' ? (
                                        <img
                                            src={vendorProfile.banner_url}
                                            alt="Vendor Banner"
                                            className='w-full h-full object-cover'
                                        />
                                    ) : vendorProfile && vendorProfile?.video_url && vendorProfile.video_url !== 'NA' ? (
                                        <video
                                            src={vendorProfile?.video_url}
                                            className="w-full h-full object-cover"
                                            muted
                                            preload="metadata"
                                            onLoadedMetadata={(e) => (e.target.currentTime = 1)}
                                        />
                                    ) : (
                                        <img
                                            src="/defaultuserImage.jpg" // 👈 public/defaultBanner.jpg
                                            alt="Default"
                                            className='w-full h-full object-cover'
                                        />
                                    )}
                                </div>

                            </div>

                            <div className='text-white'>
                                <div className='flex justify-center items-center md:gap-5 gap-2 '>
                                    <div className='text-base lg:text-2xl font-semibold drop-shadow-sm flex flex-nowrap  '
                                    title={vendorProfile?.shop_name}
                                    >
                                        {truncateLetters(vendorProfile?.shop_name,15)}
                                    </div>
                                    <div className="relative flex items-center bg-white/30 backdrop-blur-sm rounded-full md:p-0.5 gap-2 w-fit border border-yellow-200 shadow-sm">
                                        <div className="text-white flex items-center gap-1 md:p-2 p-1">
                                            <span className="text-xs lg:text-sm tracking-wide drop-shadow-sm font-bold">
                                                {switchOn ? 'Open' : 'Closed'}
                                            </span>
                                            <IOSSwitch checked={switchOn} onChange={(e) => handleSwitchChange(e.target.checked)} />
                                        </div>
                                    </div>
                                </div>
                                <div className="md:text-sm text-xs font-thin">{truncateLetters( vendorProfile?.v_name,20)}</div>
                            </div>
                        </div>

                        {/* Right Section - Icons */}
                        <div className='flex items-center gap-4 lg:gap-6'>
                            <button className='p-2 lg:p-3 text-white hover:bg-white/20 rounded-full transition-all duration-200 hover:scale-105 active:scale-95 group backdrop-blur-sm border border-white/10 hover:border-white/30'>
                                <MdOutlineMessage className='w-7 lg:w-8 h-6 lg:h-7 group-hover:text-blue-200 transition-colors drop-shadow-sm' />
                                <span className='text-xs lg:text-sm font-semibold'>Help</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Navbar;
