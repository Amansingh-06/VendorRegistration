import React from 'react';

const FileUploadButton = ({ label, bgColor, Icon, accept, onChange, file, loading }) => {
    return (
        <div className="flex   gap-2 w-[158px] max-w-[160px] flex-col ">
            <label className={`cursor-pointer ${bgColor} text-white py-2 px-2 rounded-md flex items-center gap-2 transition`}>
                {Icon && <Icon className="text-xl" />}
                {label}
                <input
                    type="file"
                    accept={accept}
                    onChange={onChange}
                    className="hidden"
                />
            </label>
            <span
                className="text-sm text-gray-600 truncate max-w-[155px]"
                title={file?.name}
            >
                {loading && file ? 'Uploading...' : (file ? file.name : `No ${label.toLowerCase()}`)}
            </span>
        </div>
    );
};

export default FileUploadButton;
