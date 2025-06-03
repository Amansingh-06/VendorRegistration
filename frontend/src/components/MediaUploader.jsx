// MediaUploader.jsx
import { useRef } from "react";

export default function MediaUploader({
    label,
    accept,
    fileUrl,
    type,
    onChange,
    borderColor,
    bgColor,
    textColor
}) {
    const inputRef = useRef();

    const handleClick = () => {
        inputRef.current?.click();
    };

    return (
        <div>
            <label className="block font-semibold text-gray-700 mb-1">{label}</label>
            <div
                className={`w-full h-40 rounded-lg border-2 border-dashed ${borderColor} flex items-center justify-center overflow-hidden ${bgColor} cursor-pointer`}
                onClick={handleClick}
            >
                {fileUrl ? (
                    type === "video" ? (
                        <video src={fileUrl} controls className="h-full w-full object-contain" />
                    ) : (
                        <img src={fileUrl} alt={label} className="h-full w-full object-contain" />
                    )
                ) : (
                    <span className={`${textColor}`}>No {label.toLowerCase()} uploaded</span>
                )}
            </div>

            {/* Hidden file input */}
            <input
                type="file"
                accept={accept}
                ref={inputRef}
                className="hidden"
                onChange={(e) => onChange(e.target.files[0])}
            />

            {/* Custom styled upload button */}
            <button
                type="button"
                className={`mt-2 text-sm font-medium underline hover:opacity-80 ${textColor}`}
                onClick={handleClick}
            >
                Upload {label}
            </button>
        </div>
    );
}
