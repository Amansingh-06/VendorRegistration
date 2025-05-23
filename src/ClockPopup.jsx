import * as React from 'react';
import dayjs from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { TimeClock } from '@mui/x-date-pickers/TimeClock';

export default function TimeClockFull({ isOpen, onClose, onTimeSelect }) {
    const [value, setValue] = React.useState(dayjs());
    const [view, setView] = React.useState('minutes'); // 'hours' | 'minutes'

    // Change AM/PM
    const handleAmPmChange = (e) => {
        const selected = e.target.value;
        const currentHour = value.hour();
        const isPm = currentHour >= 12;

        if (selected === 'AM' && isPm) {
            setValue(value.hour(currentHour - 12));
        } else if (selected === 'PM' && !isPm) {
            setValue(value.hour(currentHour + 12));
        }
    };

    // When user clicks on hour
    const handleHourClick = () => {
        setView('hours');
    };

    if (!isOpen) return null;

    return (
        <div className="inset-0 z-50 backdrop-blur-sm bg-black/30 fixed flex items-center justify-center px-4">
            <div className="bg-white md:p-6 p-3 rounded-lg shadow-lg w-full max-w-md relative flex flex-col items-center jus sm:max-w-sm  ">
                {/* Close */}
                <button
                    onClick={onClose}
                    className="absolute top-2 right-4 text-3xl text-gray-500 hover:text-black"
                >
                    ×
                </button>

                <h2 className="text-xl font-semibold mb-2 text-primary">Set Time</h2>

                {/* Analog Clock */}
                <div className="w-[300px] h-[300px]  flex justify-center items-center">
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <TimeClock
                            value={value}
                            onChange={(newVal) => setValue(newVal)}
                            view={view}
                            onViewChange={(newView) => setView(newView)}
                        />
                    </LocalizationProvider>
                </div>


                {/* Selected Time Heading */}
                <h3 className=" text-md text-gray-600">Selected Time:</h3>

                {/* Digital Clock Display */}
                <div className="mt-1 flex items-center gap-2 text-xl font-bold text-gray-900">
                    <span
                        onClick={handleHourClick}
                        className={`cursor-pointer px-1 py-1 rounded transition ${view === 'hours' ? 'bg-blue-100 text-blue-600' : ''
                            }`}
                    >
                        {value.format('hh')}
                    </span>
                    :
                    <span
                        className={`px-1 py-1 rounded transition ${view === 'minutes' ? 'bg-blue-100 text-blue-600' : ''
                            }`}
                    >
                        {value.format('mm')}
                    </span>

                    {/* AM/PM dropdown */}
                    <select
                        value={value.format('A')}
                        onChange={handleAmPmChange}
                        className="ml-3 bg-gray-200 px-2 py-2 rounded text-sm"
                    >
                        <option value="AM">AM</option>
                        <option value="PM">PM</option>
                    </select>
                </div>

                {/* Set Button */}
                <button
                    onClick={() => {
                        onTimeSelect(value);
                        onClose();
                    }}
                    className="mt-6 bg-blue text-white px-6 py-2 rounded-lg hover:bg-blue-700 w-full max-w-[200px]"
                >
                    Set Time
                </button>
            </div>
        </div>
    );
}
