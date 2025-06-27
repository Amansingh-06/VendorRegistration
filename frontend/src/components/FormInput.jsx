import React from 'react';

const FormInput = ({
  id,
  icon: Icon,
  label,
  register,
  validation,
  inputProps,
  error,
  watch, // 👈 passed from useForm
  ...rest
}) => {
  const value = watch?.(id); // get current value using watch
  const isFilled = value !== undefined && value !== '';

  const borderClass = error
    ? 'border-red-500 focus:border-red-500'
    : isFilled
    ? 'border-green-500 focus:border-green-500'
    : 'border-gray-300 focus:border-gray-300';

  return (
    <div className="relative">
      {Icon && <Icon className="absolute left-3 top-4 text-gray-500 text-md" />}

      <input
        id={id}
        {...register(id, validation)}
        {...inputProps}
        {...rest}
        placeholder={label}
        className={`peer w-full pl-10 pr-3 py-3 rounded-md border transition-all 
          placeholder-transparent text-gray-800 focus:outline-none ${borderClass}`}
      />

      <label
        htmlFor={id}
        className="absolute left-10 -top-2.5 text-sm bg-white text-gray-500 transition-all 
        peer-placeholder-shown:top-4 peer-placeholder-shown:text-gray-500 
        peer-focus:-top-2.5 peer-focus:text-sm peer-focus:font-semibold 
        peer-not-placeholder-shown:font-semibold"
      >
        {label}
      </label>

      {error && <p className="text-red-500 text-sm mt-1">{error.message}</p>}
    </div>
  );
};

export default FormInput;
