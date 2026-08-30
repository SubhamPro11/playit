import { supabase, isSupabaseConfigured } from './supabase';

const STORAGE_BUCKET = 'thumbnails';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

/**
 * Validates if an image URL is syntactically valid and uses http/https/data protocol.
 */
export function isValidImageUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  return (
    trimmed.startsWith('https://') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('data:image/')
  );
}

/**
 * Upload an image file to Supabase Storage and retrieve its public URL.
 */
export async function uploadThumbnailImage(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Please upload a valid image file (PNG, JPG, WebP, SVG)');
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error('Image file is too large (maximum allowed is 5 MB)');
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

/**
 * Upload a Support QR code image file to Supabase Storage and retrieve its public URL.
 */
export async function uploadSupportQrImage(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Please upload a valid image file (PNG, JPG, WebP, SVG)');
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error('QR code image is too large (maximum allowed is 5 MB)');
  }

  if (isSupabaseConfigured && supabase) {
    const ext = file.name.split('.').pop() || 'png';
    const fileName = `support-qr-${Date.now()}.${ext}`;
    const filePath = `qr/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      // If upload to 'thumbnails' fails or table permissions differ, fallback to base64 Data URL
      console.warn('Storage upload error, falling back to base64 encoding:', uploadError.message);
    } else {
      const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filePath);
      if (data?.publicUrl) {
        return data.publicUrl;
      }
    }
  }

  // Local/client fallback using FileReader
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to read QR image file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read QR image file'));
    reader.readAsDataURL(file);
  });
}

