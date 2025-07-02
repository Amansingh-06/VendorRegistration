import React from 'react';
import { FaCheck } from 'react-icons/fa';
import CustomButton from './Button';
import { FILTER_BUTTON } from '../utils/vendorConfig';

const ButtonGroup = ({ active, setActive }) => {
    const buttonList = [
    
        { text: FILTER_BUTTON?.ALL, color: FILTER_BUTTON?.COLOR },
        {text: FILTER_BUTTON?.PENDING, color: FILTER_BUTTON?.COLOR },

        { text: FILTER_BUTTON?.ACCEPTED, color: FILTER_BUTTON?.COLOR },
        { text: FILTER_BUTTON?.PREPARING, color: FILTER_BUTTON?.COLOR },
        { text: FILTER_BUTTON?.PREPARED, color: FILTER_BUTTON?.COLOR },
        { text: FILTER_BUTTON?.ON_THE_WAY, color: FILTER_BUTTON?.COLOR },
        { text: FILTER_BUTTON?.DELIVERED, color: FILTER_BUTTON?.COLOR },
    ];

    return (
        <div className="w-full">
            <div className="flex flex-wrap gap-3  items-center p-4 bg-white rounded-lg shadow-lg text-sm">
                {buttonList.map(({ text, color }) => (
                    <CustomButton
                        key={text}
                        text={
                            active === text ? (
                                <div className="flex items-center gap-1">
                                    <FaCheck className="text-white text-xs" />
                                    <span>{text}</span>
                                </div>
                            ) : (
                                text
                            )
                        }
                        onClick={() => setActive(text)}
                        bgColor={active === text ? color : 'bg-gray-300'}
                        textColor={active === text ? 'text-white' : 'text-black'}
                    />
                ))}
            </div>
        </div>
    );
};

export default ButtonGroup;
