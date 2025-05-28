import React from 'react';

const CustomButton = ({ text, onClick, bgColor = 'bg-blue-600', textColor = 'text-white', icon: Icon }) => {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`flex items-center gap-2 ${bgColor} ${textColor} px-3 py-1 rounded-md hover:opacity-90 transition`}
        >
            {Icon && <Icon className="text-lg" />}
            {text}
        </button>
    );
};

export default CustomButton;
