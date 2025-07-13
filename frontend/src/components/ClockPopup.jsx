import * as React from 'react';
import dayjs from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { TimeClock } from '@mui/x-date-pickers/TimeClock';
import { TIME_CLOCK_CONFIG } from '../utils/vendorConfig';

export default function TimeClockFull({ isOpen, onClose, onTimeSelect, initialTime }) {
    const [value, setValue] = React.useState(dayjs());
    const [view, setView] = React.useState('hours');

    // 🆕 Set initial value from prop when modal opens
    React.useEffect(() => {
        if (isOpen && initialTime) {
            const parsed = dayjs(initialTime, "HH:mm:ss");
            if (parsed.isValid()) {
                setValue(parsed);
            }
        }
    }, [isOpen, initialTime]);

    const handleAmPmChange = (e) => {
        const selected = e.target.value;
        const currentHour = value.hour();
        const isPm = currentHour >= 12;

        if (selected === TIME_CLOCK_CONFIG.AM && isPm) {
            setValue(value.hour(currentHour - 12));
        } else if (selected === TIME_CLOCK_CONFIG.PM && !isPm) {
            setValue(value.hour(currentHour + 12));
        }
    };

    const handleHourClick = () => setView('hours');

    React.useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : 'auto';
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="inset-0 z-50 backdrop-blur-sm bg-black/30 fixed flex items-center justify-center px-4">
            <div className={`bg-white md:p-6 p-3 rounded-lg shadow-lg w-full ${TIME_CLOCK_CONFIG.MODAL_STYLE.MAX_WIDTH} relative flex flex-col items-center jus ${TIME_CLOCK_CONFIG.MODAL_STYLE.SMALL_WIDTH}`}>
                <button
                    onClick={onClose}
                    className={TIME_CLOCK_CONFIG.CLOSE_BUTTON.CLASSNAME}
                >
                    {TIME_CLOCK_CONFIG.CLOSE_BUTTON.LABEL}
                </button>

                <h2 className="text-xl font-semibold mb-2 text-primary">{TIME_CLOCK_CONFIG.TITLE}</h2>

                <div
                    className="flex justify-center items-center"
                    style={{
                        width: TIME_CLOCK_CONFIG.CLOCK_DIMENSIONS.WIDTH,
                        height: TIME_CLOCK_CONFIG.CLOCK_DIMENSIONS.HEIGHT
                    }}
                >
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <TimeClock
                            value={value}
                            onChange={(newVal) => setValue(newVal)}
                            view={view}
                            onViewChange={(newView) => setView(newView)}
                        />
                    </LocalizationProvider>
                </div>

                <h3 className="text-md text-gray-600">{TIME_CLOCK_CONFIG.SELECTED_TIME_LABEL}</h3>

                <div className="mt-1 flex items-center gap-2 text-xl font-bold text-gray-900">
                    <span
                        onClick={handleHourClick}
                        className={`cursor-pointer px-1 py-1 rounded transition ${view === 'hours' ? 'bg-blue-100 text-blue-600' : ''}`}
                    >
                        {value.format('hh')}
                    </span>
                    :
                    <span
                        className={`px-1 py-1 rounded transition ${view === 'minutes' ? 'bg-blue-100 text-blue-600' : ''}`}
                    >
                        {value.format('mm')}
                    </span>

                    <select
                        value={value.format('A')}
                        onChange={handleAmPmChange}
                        className="ml-3 bg-gray-200 px-2 py-2 rounded text-sm"
                    >
                        <option value={TIME_CLOCK_CONFIG.AM}>{TIME_CLOCK_CONFIG.AM}</option>
                        <option value={TIME_CLOCK_CONFIG.PM}>{TIME_CLOCK_CONFIG.PM}</option>
                    </select>
                </div>

                <button
                    onClick={() => {
                        onTimeSelect(value);
                        onClose();
                    }}
                    className="mt-6 bg-orange-300 text-white px-6 py-2 rounded-lg hover:bg-orange-300 w-full max-w-[200px]"
                >
                    {TIME_CLOCK_CONFIG.SET_BUTTON_LABEL}
                </button>
            </div>
        </div>
    );
}
