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
import { ToggleSwitch } from './ToggleSwitch';
import { BiMessage } from 'react-icons/bi';
// import { MessageCircle } from 'lucide-react';

// Assuming you have a ToggleSwitch component
// const IOSSwitch = styled((props) => (
//     <Switch focusVisibleClassName=".Mui-focusVisible" disableRipple {...props} />
// ))(({ theme }) => ({
//     width: 33,
//     height: 17,
//     padding: 0,
//     '& .MuiSwitch-switchBase': {
//         padding: 0,
//         margin: 1,
//         transitionDuration: '300ms',
//         '&.Mui-checked': {
//             transform: 'translateX(16px)',
//             color: '#fff',
//             '& + .MuiSwitch-track': {
//                 backgroundColor: '#65C466',
//                 opacity: 1,
//                 border: 0,
//             },
//         },
//     },
//     '& .MuiSwitch-thumb': {
//         boxSizing: 'border-box',
//         width: 15,
//         height: 15,
//     },
//     '& .MuiSwitch-track': {
//         borderRadius: 26 / 2,
//         backgroundColor: '#E9E9EA',
//         opacity: 1,
//         transition: theme.transitions.create(['background-color'], {
//             duration: 500,
//         }),
//     },
// }));
const IOSSwitch = styled((props) => (
    <Switch focusVisibleClassName=".Mui-focusVisible" disableRipple {...props} />
  ))(({ theme }) => ({
    width: 33,
    height: 17,
    padding: 0,
    "& .MuiSwitch-switchBase": {
      padding: 0,
      margin: 1,
      transitionDuration: "300ms",
      "&.Mui-checked": {
        transform: "translateX(16px)",
        color: "#fff",
        "& + .MuiSwitch-track": {
          backgroundColor: "#65C466",
          opacity: 1,
          border: 0,
        },
      },
    },
    "& .MuiSwitch-thumb": {
      boxSizing: "border-box",
      width: 15,
      height: 15,
    },
    "& .MuiSwitch-track": {
      borderRadius: 26 / 2,
      backgroundColor: "#E9E9EA",
      opacity: 1,
      transition: theme.transitions.create(["background-color"], {
        duration: 500,
      }),
    },
  }));
  
const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [switchOn, setSwitchOn] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const { session, vendorProfile, selectedVendorId } = useAuth();

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
        return;
      }
    
      // ✅ Admin logging if admin is acting on behalf of vendor
      if (selectedVendorId) {
        const description = `Vendor availability updated for vendor ID ${vendorProfile?.v_id}. Available changed to "${checked}"`;
    
        let adminId = session?.user?.id;

        if (!adminId) {
          const { data: { user }, error } = await supabase.auth.getUser();
          if (error || !user) {
            console.error("❌ Could not fetch current user:", error?.message);
            return;
          }
          adminId = user.id;
        }
        
        await supabase.from("admin_logs").insert([
          {
            admin_id: adminId,
            title: "Vendor Availability Updated",
            description,
            timestamp: new Date(),
          },
        ]);
      }        
    };
    
    

    return (
<div className="fixed top-0 left-1/2 transform -translate-x-1/2 z-20 w-full max-w-2xl backdrop-blur-sm rounded-b-xl overflow-hidden font-family-poppins">
<div className="absolute inset-0 rotate-180 overflow-hidden rounded-t-xl">
                      <svg
                          className="absolute top-0 left-0 w-full h-full rounded-t-xl"
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
                      <GiFullPizza className="absolute text-white z-20 opacity-30 text-2xl lg:text-4xl top-2 right-8 animate-bounce-slow pointer-events-none" />
                      <GiFrenchFries className="absolute text-white z-20 opacity-30 text-2xl lg:text-4xl bottom-5 left-1/2 animate-float pointer-events-none" />
                      <GiChickenOven className="absolute text-white z-20 opacity-30 text-2xl lg:text-4xl top-4 lg:top-1/3 right-44 animate-float pointer-events-none" />
                      <FaIceCream className="absolute text-white z-20 opacity-15 text-2xl lg:text-4xl bottom-2 right-18 animate-bounce-slow pointer-events-none" />
                      <MdOutlineFastfood className="absolute text-white z-20 opacity-30 text-2xl lg:text-4xl bottom-0 lg:bottom-12 left-35 animate-bounce-slow pointer-events-none" />
                      <GiFullPizza className="absolute text-white z-20 opacity-30 text-2xl lg:text-4xl top-1 left-70 animate-float pointer-events-none" />
                      <PiBowlFood className="absolute text-white z-20 opacity-30 text-2xl lg:text-4xl top-1 right-60 animate-bounce-slow pointer-events-none" />
                      <GiChickenOven className="absolute text-white z-20 opacity-30 text-2xl lg:text-4xl top-12 right-[470px] animate-float pointer-events-none" />
                      <FaIceCream className="absolute text-white z-20 opacity-15 text-2xl lg:text-4xl top-10 left-60 lg:left-1/2 animate-bounce-slow pointer-events-none" />
                      <GiFrenchFries className="absolute text-white z-20 opacity-30 text-2xl lg:text-4xl top-16 left-1/3 animate-bounce-slow pointer-events-none" />
                      <MdOutlineFastfood className="absolute text-white z-20 opacity-30 text-2xl lg:text-4xl top-2 left-20 lg:left-[530px] animate-float pointer-events-none" />
                      <FaIceCream className="absolute text-white z-20 opacity-15 text-2xl lg:text-4xl top-1 right-[570px] animate-bounce-slow pointer-events-none" />
                  </div>
      

            {/* Content */}
            <div className="relative z-10 bg-orange-500/50">
  {!scrolled && (
    <div className="flex items-center justify-between px-2 lg:px-4 py-2  max-w-9xl mx-auto transition-all duration-1000">
      
      {/* 👤 Left Section - Profile */}
      <div className="flex items-center gap-3 lg:gap-5  ">
        
        {/* Profile Circle */}
        <div className="w-12 lg:w-16 h-12 lg:h-16 rounded-full overflow-hidden bg-gradient-to-br from-orange-500 to-yellow-500 ring-2 ring-white/30 shadow-lg">
          {vendorProfile?.banner_url && vendorProfile.banner_url !== 'NA' ? (
            <img
              src={vendorProfile.banner_url}
              alt="Vendor Banner"
              className="w-full h-full object-cover"
            />
          ) : vendorProfile?.video_url && vendorProfile.video_url !== 'NA' ? (
            <video
              src={vendorProfile.video_url}
              className="w-full h-full object-cover"
              muted
              preload="metadata"
              onLoadedMetadata={(e) => (e.target.currentTime = 1)}
            />
          ) : (
            <img
              src="/defaultuserImage.jpg"
              alt="Default"
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* Shop Details */}
        <div className="text-white flex flex-col -mt-1   justify-center">
          {/* Shop Name + Toggle */}
          <div className="flex items-center gap-2 md:gap-4 ">
            <div
              className="text-base lg:text-2xl font-semibold truncate drop-shadow-sm"
              title={vendorProfile?.shop_name}
            >
              {truncateLetters(vendorProfile?.shop_name, 20)}
            </div>

            {/* Toggle Button */}
            
          </div>

                  {/* Vendor Name */}
                  <div className='flex items-center gap-5'>
          <div className="text-xs md:text-sm truncate max-w-[160px] - text-white/90 relative z-40 ">
            {truncateLetters(vendorProfile?.v_name, 20)}
                    </div>
                    <div className=" ">
              <ToggleSwitch
                switchOn={switchOn}
                onToggle={handleSwitchChange}
              />
            </div>
                    </div>
        </div>
      </div>

      {/* 📩 Right Section - Icons */}
      <div className="flex items-center gap-2 lg:gap-4">
        <button  className="flex  justify-center items-center gap-1 p-1 lg:p-2 text-orange bg-gray-100 hover:bg-white/90 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 group backdrop-blur-sm border border-white/10 hover:border-white/30 cursor-pointer">
        <BiMessage className="text-sm lg:text-2xl mt-[1px]" />
          <div className="text-xs lg:text-base font-medium">Help</div>

        </button>
      </div>
    </div>
  )}
</div>

        </div>
    );
};

export default Navbar;
