
import { supabase } from "@/utils/supabase";
import { v4 as uuidv4 } from 'uuid';

export async function uploadImage(file: File, bucket: string = 'avatars', existingPath?: string) {
  try {
    // If there's an existing path, remove that image first
    if (existingPath) {
      await removeImage(existingPath, bucket);
    }
    
    const fileExt = file.name.split('.').pop();
    // Generate a new filename to prevent caching issues
    const filePath = `${uuidv4()}.${fileExt}`;
    
    const { data, error } = await supabase
      .storage
      .from(bucket)
      .upload(filePath, file, { upsert: true }); // Use upsert to replace if exists
      
    if (error) throw error;
    
    // Get public URL with cache-busting parameter
    const { data: urlData } = await supabase
      .storage
      .from(bucket)
      .getPublicUrl(filePath);
      
    const publicUrl = `${urlData.publicUrl}?t=${new Date().getTime()}`;
    
    return { url: publicUrl, path: filePath };
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}

export async function removeImage(path: string, bucket: string = 'avatars') {
  try {
    if (!path) return { success: true };
    
    const { error } = await supabase
      .storage
      .from(bucket)
      .remove([path]);
      
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error('Error removing image:', error);
    throw error;
  }
}

export async function uploadCourseImage(file: File, existingPath?: string) {
  try {
    const result = await uploadImage(file, 'courses', existingPath);
    return result;
  } catch (error) {
    console.error('Error uploading course image:', error);
    throw error;
  }
}
