import React, { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';

const CuisineSelector = ({ register, errors }) => {
    const [cuisines, setCuisines] = useState([]);

    useEffect(() => {
        const fetchCuisines = async () => {
            const { data, error } = await supabase
                .from('all_cuisine_available')
                .select('cuisine_id, name');

            if (error) {
                console.error('Error fetching cuisines:', error);
            } else {
                setCuisines(data);
            }
        };

        fetchCuisines();
    }, []);

    return (
        <div className="px-6 py-5 shadow-lg rounded-lg border border-gray-300 flex flex-col gap-6 bg-white">
            <h1 className="md:text-2xl text-lg font-semibold text-gray-500">Available Cuisines</h1>
            <div className="flex gap-6 flex-wrap">
                {cuisines.map((cuisine) => (
                    <div key={cuisine.cuisine_id} className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id={cuisine.cuisine_id}
                            value={cuisine.cuisine_id}
                            {...register('cuisines', {
                                validate: value => value?.length > 0 || 'Please select at least one cuisine',
                            })}
                            className="w-5 h-5 accent-orange text-white"
                        />
                        <label htmlFor={cuisine.cuisine_id} className="text-gray-700 cursor-pointer">
                            {cuisine.name}
                        </label>
                    </div>
                ))}
            </div>
            {errors?.cuisines && <p className="text-red-500 text-sm">{errors.cuisines.message}</p>}
        </div>
    );
};

export default CuisineSelector;
