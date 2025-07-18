import React from "react";

function InputField({
  id,
  placeholder,
  icon: Icon,
  register,
  validation,
  error,
  value, // 👈 watch() value from parent
  onKeyDown,
  onInput,
  inputRef, // 👈 ref for scrolling
}) {
  return (
    <div className="relative">
      {Icon && <Icon className="absolute left-3 top-4 text-black text-lg" />}

      <input
        id={id}
        placeholder={placeholder}
        {...register(id, validation)}
        ref={(el) => {
          register(id, validation).ref(el); // for react-hook-form
          if (inputRef) inputRef.current = el; // 👈 for scrollToRef
        }}
        onKeyDown={onKeyDown}
        onInput={onInput}
        className={`peer pl-10 pt-3 pb-3 w-full rounded border text-gray-800 transition-all placeholder-transparent
          ${
            error
              ? "border-red-500 focus:border-red-500"
              : value
              ? "border-green-500 focus:border-green-500"
              : "border-gray-300 focus:border-gray-400"
          }
          focus:outline-none`}
      />

      <label
        htmlFor={id}
        className="absolute left-10 -top-2.5 text-sm bg-white text-gray-500 transition-all 
          peer-placeholder-shown:top-4 peer-placeholder-shown:text-gray-500 
          peer-focus:-top-2.5 peer-focus:text-sm peer-focus:font-semibold 
          peer-not-placeholder-shown:font-semibold"
      >
        {placeholder}
      </label>

      {error && <p className="text-red-500 text-sm mt-1">{error.message}</p>}
    </div>
  );
}

export default InputField;
