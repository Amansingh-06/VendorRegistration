import React from 'react';
import { FaCheck } from 'react-icons/fa';
import CustomButton from './Button';

const ButtonGroup = ({ active, setActive }) => {
    const buttonList = [
        { text: 'All', color: 'bg-green' },
        { text: 'Received', color: 'bg-green' },
        { text: 'Accepted', color: 'bg-green' },
        { text: 'On The Way', color: 'bg-green' },
        { text: 'Delivered', color: 'bg-green' },
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
