import React from "react";
import { Upload, X } from "lucide-react";

const ImageUploader = ({
  previewImage,
  setPreviewImage,
  fileInputRef,
  register,
  onChange,
  setValue,
}) => {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div className="relative border-2 border-dashed border-gray-400 rounded-lg p-4 flex items-center justify-center text-sm text-gray-500 cursor-pointer h-40">
        {previewImage ? (
          <>
            <img
              src={
                typeof previewImage === "string"
                  ? previewImage
                  : previewImage
                  ? URL.createObjectURL(previewImage)
                  : ""
              }
              alt="Preview"
              className="object-cover h-full w-full rounded-lg"
            />

            <X
              className="absolute top-2 right-2 w-4 h-4 text-red cursor-pointer"
              onClick={() => {
                setPreviewImage(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
                setValue("image", null); // <-- ye form se image hata dega
              }}
            />
          </>
        ) : (
          <span className="absolute text-gray-500 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            No image uploaded
          </span>
        )}
      </div>
      <label className="border p-2.5 rounded-[8px] flex-1 h-11 md:h-auto flex items-center bg-orange text-white font-medium justify-center cursor-pointer transition">
        <Upload className="w-5 h-5 mr-2" />
        Select Photo
        <input
          type="file"
          accept="image/*"
          className="hidden"
          {...register("image")}
          ref={fileInputRef}
          onChange={onChange}
        />
      </label>
    </div>
  );
};

export default ImageUploader;
