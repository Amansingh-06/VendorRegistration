import React, { useState } from 'react';
import { MdOutlineMessage } from "react-icons/md";
import { GiChickenOven, GiFrenchFries, GiFullPizza } from 'react-icons/gi';
import { FaIceCream } from 'react-icons/fa';
import { MdOutlineFastfood } from 'react-icons/md';
import { PiBowlFood } from 'react-icons/pi';
import { styled } from '@mui/material/styles';
import Switch from '@mui/material/Switch';

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

    return (
        <div className='w-full top-0 z-20 backdrop-blur-sm rounded-b-lg overflow-hidden bg-gradient-to-br from-orange via-yellow to-orange'>

            {/* Floating Food Icons */}
            <div>
                <GiFullPizza className="absolute text-red opacity-30 text-2xl lg:text-4xl top-2 right-8 animate-bounce-slow pointer-events-none" />
                <GiFrenchFries className="absolute text-red opacity-30 text-2xl lg:text-4xl bottom-10 left-8 animate-float pointer-events-none" />
                <GiChickenOven className="absolute text-red opacity-30 text-2xl lg:text-4xl top-4 lg:top-1/3 right-44 animate-float pointer-events-none" />
                <FaIceCream className="absolute text-pink opacity-15 text-2xl lg:text-4xl bottom-6 right-12 animate-bounce-slow pointer-events-none" />
                <MdOutlineFastfood className="absolute text-pink opacity-30 text-2xl lg:text-4xl bottom-0 lg:bottom-12 left-40 animate-bounce-slow pointer-events-none" />
                <GiFullPizza className="absolute text-red opacity-30 text-2xl lg:text-4xl top-6 left-80 animate-float pointer-events-none" />
                <PiBowlFood className="absolute text-red opacity-30 text-2xl lg:text-4xl top-8 right-80 animate-bounce-slow pointer-events-none" />
                <GiChickenOven className="absolute text-red opacity-30 text-2xl lg:text-4xl top-12 right-[470px] animate-float pointer-events-none" />
                <FaIceCream className="absolute text-pink opacity-15 text-2xl lg:text-4xl top-10 left-60 lg:left-1/2 animate-bounce-slow pointer-events-none" />
                <GiFrenchFries className="absolute text-pink opacity-30 text-2xl lg:text-4xl top-16 left-1/3 animate-bounce-slow pointer-events-none" />
                <MdOutlineFastfood className="absolute text-red opacity-30 text-2xl lg:text-4xl top-2 left-20 lg:left-[600px] animate-float pointer-events-none" />
                <FaIceCream className="absolute text-pink opacity-15 text-2xl lg:text-4xl top-1 right-[550px] animate-bounce-slow pointer-events-none" />
            </div>

            {/* Content */}
            <div className="relative z-10">
                {!scrolled && (
                    <div className={`flex items-center justify-between p-2 lg:p-4 max-w-9xl mx-auto transition-all duration-1200 `}>
                        {/* Left Section - Profile */}
                        <div className='flex items-center gap-3 lg:gap-4'>
                            <div className='relative'>
                                <div className='flex items-center justify-center w-12 lg:w-16 h-12 lg:h-16 rounded-full bg-gradient-to-br from-orange-500 to-yellow-500 text-white font-bold text-lg shadow-lg ring-2 ring-white/30 backdrop-blur-sm border'>
                                    <img src="https://images.unsplash.com/photo-1678557856807-7ae6ff6893d1?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="" className='w-full h-full  rounded-full' />
                                </div>
                            </div>
                            <div className='text-white'>
                                <div className='flex justify-center items-center md:gap-5 gap-3'>
                                <div className='text-base lg:text-2xl font-semibold drop-shadow-sm'>Wow Momos</div>
                                    <div className="relative flex items-center bg-white/30 backdrop-blur-sm rounded-full  md:p-0.5 gap-2 w-fit border border-yellow-200 shadow-sm">
                                      

                                        {/* Adjust text and switch with left margin to avoid overlapping with icon */}
                                        <div className="text-white flex items-center gap-2 ">
                                            <span className="text-xs lg:text-sm tracking-wide drop-shadow-sm font-bold">
                                                {switchOn ? 'On' : 'Off'}
                                            </span>
                                            <IOSSwitch checked={switchOn} onChange={(e) => setSwitchOn(e.target.checked)}  />
                                        </div>
                                    </div>

                                </div>
                                <div className="md:text-sm text-xs font-thin ">Aman Singh</div>
                            </div>
                          
                        </div>
                        
                        

                        {/* Right Section - Icons  */}
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
