import { supabase } from "./supabaseClient";

export const uploadFile = async (file, bucketName, name) => {
    if (!file) return null;

    const fileExt = file?.name?.split('.')?.pop();
    const cleanName = name?.replace(/\s+/g, '_'); // spaces to underscore
    const filePath = `${Date.now()}_${cleanName}.${fileExt}`;


    const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
            cacheControl: '3600',
            upsert: true,
        });

    if (error) {
        console.error('Error uploading file:', error?.message);
        toast.error("Error uploading file");
        throw new Error(error?.message); // Throw error to stop further processing
    }

    const { data: urlData, error: urlError } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

    if (urlError) {
        console.error('Error getting public URL:', urlError?.message);
        throw new Error(urlError?.message); // Throw error to stop further processing
    }

    return urlData?.publicUrl;
};