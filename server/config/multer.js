import multer from "multer";
import { cloudinary } from "./cloudnary.js";
import {
  isMegaConfigured,
  uploadVideoToMega,
  uploadImageToMega,
  uploadProfilePictureToMega,
  uploadRawFileToMega
} from "./mega.js";

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB limit for video files
    fieldSize: 500 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    // Accept video, image and document files
    const allowedMimeTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    ];
    if (
      file.mimetype.startsWith("video/") ||
      file.mimetype.startsWith("image/") ||
      allowedMimeTypes.includes(file.mimetype)
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only video, image, and document (pdf, word, ppt) files are allowed!"), false);
    }
  },
});

/**
 * Universal video upload - uses MEGA Drive if configured, falls back to Cloudinary
 */
export const uploadVideoToCloudinary = async (fileBuffer, fileName) => {
  if (isMegaConfigured()) {
    console.log("💾 Storage provider: MEGA Drive (Video)");
    return await uploadVideoToMega(fileBuffer, fileName);
  }

  // Cloudinary fallback
  try {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "video",
          folder: "lms-videos",
          public_id: fileName,
          chunk_size: 1024 * 1024,
          timeout: 300000,
          quality: "auto:good",
          format: "mp4",
          video_codec: "h264",
          eager: [
            { width: 640, height: 360, crop: "limit", quality: "auto:good" }
          ],
          eager_async: true,
          overwrite: true,
          invalidate: true,
        },
        (error, result) => {
          if (error) {
            console.error("Cloudinary upload error:", error);
            reject(error);
          } else {
            console.log("Upload successful:", result.public_id);
            resolve(result);
          }
        }
      );

      uploadStream.on('error', (error) => {
        console.error("Upload stream error:", error);
        reject(error);
      });

      uploadStream.end(fileBuffer);
    });
  } catch (error) {
    console.error("Upload function error:", error);
    throw error;
  }
};

/**
 * Course Thumbnail upload - strictly uses Cloudinary only for fast CDN delivery, transformations, and responsive images
 */
export const uploadImageToCloudinary = async (fileBuffer, fileName) => {
  console.log("☁️ Storage provider: Cloudinary (Course Thumbnail)");
  try {
    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            resource_type: "image",
            folder: "lms-thumbnails",
            public_id: fileName,
            quality: "auto:good",
            fetch_format: "auto",
          },
          (error, result) => {
            if (error) {
              console.error("Cloudinary thumbnail upload error:", error);
              reject(error);
            } else {
              console.log("Cloudinary thumbnail upload successful:", result.secure_url);
              resolve(result);
            }
          }
        )
        .end(fileBuffer);
    });
  } catch (error) {
    console.error("Cloudinary thumbnail upload exception:", error);
    throw error;
  }
};

/**
 * Universal profile picture upload - uses MEGA Drive if configured, falls back to Cloudinary
 */
export const uploadProfilePictureToCloudinary = async (fileBuffer, fileName) => {
  if (isMegaConfigured()) {
    console.log("💾 Storage provider: MEGA Drive (Profile Picture)");
    return await uploadProfilePictureToMega(fileBuffer, fileName);
  }

  // Cloudinary fallback
  try {
    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            resource_type: "image",
            folder: "lms-profile-pictures",
            public_id: fileName,
            quality: "auto:good",
            fetch_format: "auto",
            transformation: [
              { width: 400, height: 400, crop: "fill", gravity: "face" },
            ],
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          }
        )
        .end(fileBuffer);
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Universal document upload - uses MEGA Drive if configured, falls back to Cloudinary
 */
export const uploadRawFileToCloudinary = async (fileBuffer, fileName) => {
  if (isMegaConfigured()) {
    console.log("💾 Storage provider: MEGA Drive (Document)");
    return await uploadRawFileToMega(fileBuffer, fileName);
  }

  // Cloudinary fallback
  try {
    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            resource_type: "raw",
            folder: "lms-documents",
            public_id: fileName,
            type: "upload",
            access_mode: "public",
          },
          (error, result) => {
            if (error) {
              console.error("Cloudinary document upload error:", error);
              reject(error);
            } else {
              console.log("Document upload successful:", result.public_id);
              resolve(result);
            }
          }
        )
        .end(fileBuffer);
    });
  } catch (error) {
    console.error("Upload raw file function error:", error);
    throw error;
  }
};

// Aliases for explicit MEGA storage naming
export const uploadVideoToStorage = uploadVideoToCloudinary;
export const uploadImageToStorage = uploadImageToCloudinary;
export const uploadProfilePictureToStorage = uploadProfilePictureToCloudinary;
export const uploadRawFileToStorage = uploadRawFileToCloudinary;

export {
  upload,
  uploadVideoToMega,
  uploadImageToMega,
  uploadProfilePictureToMega,
  uploadRawFileToMega
};
