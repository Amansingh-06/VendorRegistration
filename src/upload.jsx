import React, { useState } from 'react';
import { supabase } from './supabaseClient';
import { toast } from 'react-hot-toast';

const UploadMedia = () => {
    const [bannerFile, setBannerFile] = useState(null);
    const [videoFile, setVideoFile] = useState(null);

    const handleUpload = async () => {
        if (bannerFile) {
            const { data, error } = await supabase.storage
                .from('banners')
                .upload(`banners/${Date.now()}_${bannerFile.name}`, bannerFile);

            if (error) {
                toast.error("Image upload failed");
                console.log(error);
            } else {
                const publicUrl = supabase.storage.from('banners').getPublicUrl(data.path).data.publicUrl;
                toast.success("Image uploaded");
                console.log("Image URL:", publicUrl);
            }
        }

        if (videoFile) {
            const { data, error } = await supabase.storage
                .from('videos')
                .upload(`videos/${Date.now()}_${videoFile.name}`, videoFile);

            if (error) {
                toast.error("Video upload failed");
                console.log(error);
            } else {
                const publicUrl = supabase.storage.from('videos').getPublicUrl(data.path).data.publicUrl;
                toast.success("Video uploaded");
                console.log("Video URL:", publicUrl);
            }
        }
    };

    return (
        <div className="p-6 space-y-4">
            <div>
                <label className="block font-medium">Upload Image</label>
                <input type="file" accept="image/*" onChange={(e) => setBannerFile(e.target.files[0])} />
            </div>
            <div>
                <label className="block font-medium">Upload Video</label>
                <input type="file" accept="video/*" onChange={(e) => setVideoFile(e.target.files[0])} />
            </div>
            <button
                onClick={handleUpload}
                className="px-4 py-2 bg-blue-600 text-white rounded"
            >
                Upload
            </button>
        </div>
    );
};

export default UploadMedia;
