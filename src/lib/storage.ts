import { supabase, isSupabaseConfigured } from './supabase';

const STORAGE_BUCKET = 'thumbnails';

/**
 * Upload an image file to Supabase Storage and retrieve its public URL.
 */
export async function uploadThumbnailImage(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Please upload a valid image file (PNG, JPG, WebP)');
  }

  // If Supabase Storage is configured, upload directly to the thumbnails bucket
  if (isSupabaseConfigured && supabase) {
    const ext = file.name.split('.').pop() || 'jpg';
    const fileName = `thumb-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
    const filePath = `uploads/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Storage upload failed: ${uploadError.message}. Ensure the "thumbnails" bucket exists in Supabase Storage with public upload permissions.`);
    }

    const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filePath);
    if (data?.publicUrl) {
      return data.publicUrl;
    }
    throw new Error('Failed to retrieve public URL from Supabase Storage.');
  }

  // Fallback for local sandbox testing when Supabase keys are not set
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to read image file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(file);
  });
}
