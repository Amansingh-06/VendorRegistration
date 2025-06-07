const TypeRadio = ({ selectedType, setSelectedType, register, setValue, error }) => {
    const handleChange = (e) => {
        const value = e.target.value;  // "veg" ya "nonveg"
        const boolValue = value === 'veg'; // true if veg else false

        setValue('type', boolValue, { shouldValidate: true }); // DB ke liye boolean
        setSelectedType(boolValue); // UI ke liye boolean state
    };

    return (
        <div className="mb-6">
            <h3 className="text-base font-semibold text-gray-600 mb-2">Select Type</h3>
            <div className="flex gap-6 flex-wrap">
                {['veg', 'nonveg'].map((type) => (
                    <label className="cursor-pointer" key={type}>
                        <input
                            type="radio"
                            value={type}  // "veg" ya "nonveg" 
                            {...register('type', { required: 'Please select type' })}
                            className="hidden"
                            checked={(type === 'veg' && selectedType === true) || (type === 'nonveg' && selectedType === false)}
                            onChange={handleChange}
                        />
                        <div
                            className={`flex items-center gap-3 md:px-5 px-3 py-3 rounded-xl border cursor-pointer transition-all shadow-sm
                ${((type === 'veg' && selectedType === true) || (type === 'nonveg' && selectedType === false))
                                    ? type === 'veg'
                                        ? 'border-green-600 bg-green-100 shadow-lg'
                                        : 'border-red-600 bg-red-100 shadow-lg'
                                    : type === 'veg'
                                        ? 'border-gray-300 hover:border-green-500'
                                        : 'border-gray-300 hover:border-red-500'
                                }`}
                        >
                            <div
                                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors duration-300
                  ${((type === 'veg' && selectedType === true) || (type === 'nonveg' && selectedType === false))
                                        ? type === 'veg'
                                            ? 'border-green-600 bg-green-600'
                                            : 'border-red-600 bg-red-600'
                                        : type === 'veg'
                                            ? 'border-green-600 bg-transparent'
                                            : 'border-red-600 bg-transparent'
                                    }`}
                            ></div>
                            <span
                                className={`md:text-md text-sm font-medium transition-colors duration-300
                  ${((type === 'veg' && selectedType === true) || (type === 'nonveg' && selectedType === false))
                                        ? type === 'veg'
                                            ? 'text-green-700'
                                            : 'text-red-700'
                                        : 'text-gray-800'
                                    }`}
                            >
                                {type === 'veg' ? 'Veg' : 'Non-Veg'}
                            </span>
                        </div>
                    </label>
                ))}
            </div>
            {error && <p className="text-red-500 text-sm mt-2">{error.message}</p>}
        </div>
    );
};

export default TypeRadio