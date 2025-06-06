import { useRef, useState } from "react";

export default function MediaUploader({
    label,
    accept,
    fileUrl,
    type,
    onChange,        // 👈 This will be called only on Upload button click
    borderColor,
    bgColor,
    textColor
}) {
    const inputRef = useRef();
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(fileUrl || '');

    const handleClick = () => {
        inputRef.current?.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file)); // 👈 Show preview before upload
        }
    };

    const handleUpload = () => {
        if (selectedFile) {
            onChange(selectedFile); // 👈 Real upload will happen here
        }
    };

    return (
        <div>
            <label className="block font-semibold text-gray-700 mb-1">{label}</label>

            <div
                className={`w-full h-40 rounded-lg border-2 border-dashed ${borderColor} flex items-center justify-center overflow-hidden ${bgColor} cursor-pointer`}
                onClick={handleClick}
            >
                {previewUrl ? (
                    type === "video" ? (
                        <video src={previewUrl} controls className="h-full w-full object-contain" />
                    ) : (
                        <img src={previewUrl} alt={label} className="h-full w-full object-contain" />
                    )
                ) : (
                    <span className={`${textColor}`}>No {label.toLowerCase()} uploaded</span>
                )}
            </div>

            <input
                type="file"
                accept={accept}
                ref={inputRef}
                className="hidden"
                onChange={handleFileChange}
            />

            <div className="mt-2 flex gap-4 items-center">
                <button
                    type="button"
                    className={`text-sm font-medium underline hover:opacity-80 ${textColor}`}
                    onClick={handleClick}
                >
                    Select {label}
                </button>

                {selectedFile && (
                    <button
                        type="button"
                        className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                        onClick={handleUpload}
                    >
                        Upload
                    </button>
                )}
            </div>
        </div>
    );
}
