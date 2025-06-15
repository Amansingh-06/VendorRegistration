import React from 'react';
import { Upload, X } from 'lucide-react';

const ImageUploader = ({ previewImage, setPreviewImage, fileInputRef, register, onChange,setValue }) => {
    return (
        <div className="grid md:grid-cols-2 gap-4">
            <div className="relative border-2 border-dashed border-gray-400 rounded-md p-4 flex items-center justify-center text-sm text-gray-500 cursor-pointer h-40">
                {previewImage ? (
                    <>
                        <img
                            src={
                                typeof previewImage === 'string'
                                    ? previewImage
                                    : previewImage
                                        ? URL.createObjectURL(previewImage)
                                        : ''
                            }
                            alt="Preview"
                            className="object-contain h-full w-full"
                        />

                        <X
                            className="absolute top-2 right-2 w-4 h-4 text-red cursor-pointer"
                            onClick={() => {
                                setPreviewImage(null);
                                if (fileInputRef.current) fileInputRef.current.value = '';
                                setValue('image', null);   // <-- ye form se image hata dega
                            }}
                        />
                    </>
                ) : (
                    <span className="absolute text-gray-500 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                        No image uploaded
                    </span>
                )}
            </div>
            <label className="border p-4 rounded-md flex items-center bg-green justify-center cursor-pointer transition">
                <Upload className="w-5 h-5 mr-2" />
                Upload Photo
                <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    {...register('image')}
                    ref={fileInputRef}
                    onChange={onChange}
                />
            </label>
        </div>
    );
};

export default ImageUploader;