// Cloudinary Upload Service
// Uses unsigned upload preset — no server required, no SDK needed

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

/**
 * Upload a file to Cloudinary directly from the browser.
 * @param {File} file - The file to upload (video or image)
 * @param {'video' | 'image'} resourceType - Cloudinary resource type
 * @param {function} onProgress - Optional progress callback (0–100)
 * @returns {Promise<{ url: string, thumbnailUrl: string }>}
 */
export const uploadToCloudinary = (file, resourceType = 'video', onProgress) => {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('folder', resourceType === 'video' ? 'dresswipe/reels' : 'dresswipe/thumbnails');

    const xhr = new XMLHttpRequest();

    // Track upload progress
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        const data = JSON.parse(xhr.responseText);
        // For videos, Cloudinary auto-generates a thumbnail by replacing extension
        const thumbnailUrl = resourceType === 'video'
          ? data.secure_url.replace(/\.[^.]+$/, '.jpg').replace('/video/', '/video/so_0/')
          : data.secure_url;

        resolve({ url: data.secure_url, thumbnailUrl, publicId: data.public_id });
      } else {
        reject(new Error(`Upload failed: ${xhr.responseText}`));
      }
    });

    xhr.addEventListener('error', () => reject(new Error('Network error during upload')));

    const endpoint = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`;
    xhr.open('POST', endpoint);
    xhr.send(formData);
  });
};
