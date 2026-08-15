import { supabase, isSupabaseConfigured } from './supabase';

const STORAGE_BUCKET = 'thumbnails';

/**
 * Upload an image file to Supabase Storage and retrieve its public URL.
 */
export async function uploadThumbnailImage(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Please upload a valid image file (PNG, JPG, WebP)');
  }

  // If Supabase Storage is active, upload to bucket
  if (isSupabaseConfigured && supabase) {
    try {
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
        console.warn('Supabase storage upload error, falling back:', uploadError.message);
      } else {
        const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filePath);
        if (data?.publicUrl) {
          return data.publicUrl;
        }
      }
    } catch (err) {
      console.warn('Storage upload error:', err);
    }
  }

  // Fallback for local development / testing without active Supabase bucket
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
