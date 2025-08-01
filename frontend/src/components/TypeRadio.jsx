
const TypeRadio = ({ register, setValue, error, watch }) => {
    const watchedType = watch('type');

    const handleChange = (e) => {
        const value = e.target.value;
        setValue('type', value, { shouldValidate: true });
    };

    return (
        <div >
            <div className="rounded-lg bg-white shadow-lg px-5 p-4 border border-gray-300">
                <h1 className="text-md lg:text-2xl font-medium text-gray mb-2 uppercase">Select Type</h1>
                <div className="flex gap-6 flex-wrap">
  {['veg', 'nonveg'].map((type) => (
    <label className="cursor-pointer" key={type}>
      <input
        type="radio"
        value={type}
        {...register('type', {
          required: 'Please select type',
        })}
        className="hidden"
        checked={watchedType === type}
        onChange={handleChange}
      />
      <div
        className={`w-[110px] flex items-center justify-center gap-1 px-1 py-3 rounded-xl border cursor-pointer transition-all shadow-sm
          ${watchedType === type
            ? type === 'veg'
              ? 'border-green-600 bg-green-100 shadow-lg'
              : 'border-red-600 bg-red-100 shadow-lg'
            : type === 'veg'
              ? 'border-gray-300 hover:border-green-500'
              : 'border-gray-300 hover:border-red-500'
          }`}
      >
        <div
          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors duration-300
            ${watchedType === type
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
            ${watchedType === type
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
        </div>
    );
};

export default TypeRadio;

