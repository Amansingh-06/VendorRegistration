import React from 'react';

const FormInput = ({ id, icon: Icon, label, register, validation, error, ...rest }) => {
    return (
        <div className="relative">
            <Icon className="absolute left-3 top-4 text-black text-md" />
            <input
                id={id}
                {...register(id, validation)}
                {...rest}
                placeholder={label}
                className={`peer w-full pl-10 pr-3 py-3 rounded-md border ${error ? 'border-red' : 'border-gray-300'} focus:outline-none focus:border-orange placeholder-transparent`}
            />
            <label
                htmlFor={id}
                className="absolute left-10 -top-2.5 text-sm bg-white text-black transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-gray-500 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:font-semibold"
            >
                {label}
            </label>
            {error && <p className="text-red text-sm mt-1">{error.message}</p>}
        </div>
    );
};

export default FormInput;