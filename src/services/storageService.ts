import { 
  ref, 
  uploadBytesResumable, 
  getDownloadURL, 
  deleteObject, 
  listAll 
} from 'firebase/storage';
import { storage } from './firebase';

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB limit
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

export interface UploadProgressItem {
  id: string;
  fileName: string;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
  downloadUrl?: string;
}

/**
 * Validates file format and size for ecommerce appliance showcase
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type.toLowerCase())) {
    return {
      valid: false,
      error: `Unsupported format "${file.type || file.name.split('.').pop()}". Please use JPG, PNG, or WEBP.`
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `File is too large (${sizeMb} MB). Maximum allowed size is 10 MB per image.`
    };
  }

  return { valid: true };
}

/**
 * Uploads a single product image to Firebase Storage under products/{productId}/{fileName}
 * with real-time percentage progress callback.
 */
export function uploadProductImage(
  productId: string,
  file: File,
  onProgress?: (percent: number) => void
): Promise<{ url: string; path: string; name: string }> {
  return new Promise((resolve, reject) => {
    const validation = validateImageFile(file);
    if (!validation.valid) {
      return reject(new Error(validation.error));
    }

    // Sanitize and create unique timestamped file path
    const extension = file.name.split('.').pop() || 'jpg';
    const baseName = file.name
      .replace(/\.[^/.]+$/, '')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 40);
    const uniqueFileName = `${baseName}-${Date.now().toString(36)}.${extension}`;
    const storagePath = `products/${productId}/${uniqueFileName}`;
    const fileRef = ref(storage, storagePath);

    const uploadTask = uploadBytesResumable(fileRef, file, {
      contentType: file.type,
      customMetadata: {
        productId,
        originalName: file.name,
        uploadedAt: new Date().toISOString()
      }
    });

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        if (onProgress) {
          onProgress(progress);
        }
      },
      (error) => {
        console.error('Firebase Storage upload error:', error);
        reject(error);
      },
      async () => {
        try {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          resolve({
            url: downloadUrl,
            path: storagePath,
            name: file.name
          });
        } catch (err) {
          reject(err);
        }
      }
    );
  });
}

/**
 * Safely deletes a specific image file from Firebase Storage
 */
export async function deleteProductImage(imageUrlOrPath: string): Promise<void> {
  if (!imageUrlOrPath) return;

  try {
    let fileRef;
    if (imageUrlOrPath.startsWith('http://') || imageUrlOrPath.startsWith('https://')) {
      // It's a full download URL pointing to Firebase Storage
      if (imageUrlOrPath.includes('firebasestorage.googleapis.com') || imageUrlOrPath.includes('firebasestorage.app')) {
        fileRef = ref(storage, imageUrlOrPath);
        await deleteObject(fileRef);
      }
    } else if (imageUrlOrPath.startsWith('products/')) {
      fileRef = ref(storage, imageUrlOrPath);
      await deleteObject(fileRef);
    }
  } catch (error: any) {
    // If the object already doesn't exist, ignore error safely
    if (error?.code !== 'storage/object-not-found') {
      console.warn('Note on deleting storage image:', error?.message);
    }
  }
}

/**
 * Cleans up all Firebase Storage images under products/{productId}/ when a product is deleted
 */
export async function deleteProductAllImages(productId: string, imageUrls?: string[]): Promise<void> {
  if (!productId) return;

  try {
    const productFolderRef = ref(storage, `products/${productId}`);
    const listResult = await listAll(productFolderRef);

    // Delete all files in the product's storage directory
    const deletePromises = listResult.items.map((itemRef) => 
      deleteObject(itemRef).catch((err) => {
        console.warn(`Could not delete storage file ${itemRef.name}:`, err.message);
      })
    );
    await Promise.all(deletePromises);
  } catch (error: any) {
    // If folder list is not permitted or empty, fallback to deleting via known URLs
    if (imageUrls && imageUrls.length > 0) {
      for (const url of imageUrls) {
        await deleteProductImage(url);
      }
    }
  }
}
