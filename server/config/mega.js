import { Storage, File } from 'megajs';
import dotenv from 'dotenv';

dotenv.config();

let megaStorageInstance = null;
let megaStoragePromise = null;

/**
 * Checks if MEGA credentials are provided in the environment.
 */
export const isMegaConfigured = () => {
  return Boolean(
    (process.env.MEGA_EMAIL && process.env.MEGA_PASSWORD) ||
    process.env.MEGA_API_KEY
  );
};

/**
 * Initializes and returns a singleton authenticated MEGA Storage instance.
 */
export const getMegaStorage = async () => {
  const email = process.env.MEGA_EMAIL;
  const password = process.env.MEGA_PASSWORD || process.env.MEGA_API_KEY;

  if (!email || !password) {
    throw new Error(
      'MEGA credentials missing: Please define MEGA_EMAIL and MEGA_PASSWORD (or MEGA_API_KEY) in your server/.env file'
    );
  }

  if (megaStorageInstance && megaStorageInstance.ready) {
    return megaStorageInstance;
  }

  if (megaStoragePromise) {
    return megaStoragePromise;
  }

  megaStoragePromise = (async () => {
    try {
      console.log(`📡 Connecting to MEGA Drive as: ${email}...`);
      const storage = await new Storage({
        email,
        password,
        userAgent: 'LMS-Platform/1.0',
        keepalive: true,
      }).ready;

      megaStorageInstance = storage;
      console.log('✅ Successfully authenticated and connected to MEGA Drive cloud storage!');
      return storage;
    } catch (err) {
      megaStoragePromise = null;
      console.error('❌ Failed to authenticate with MEGA Drive:', err.message);
      throw err;
    }
  })();

  return megaStoragePromise;
};

/**
 * Connect to MEGA at server startup (non-blocking if not configured yet).
 */
export const connectMega = async () => {
  if (!isMegaConfigured()) {
    console.warn(
      '⚠️ MEGA Drive is not configured: MEGA_EMAIL and MEGA_PASSWORD are empty in .env. Add them to enable MEGA Drive uploads.'
    );
    return;
  }

  try {
    await getMegaStorage();
  } catch (error) {
    console.error('⚠️ MEGA Drive initialization warning:', error.message);
  }
};

/**
 * Helper to get or create a folder under a parent directory.
 */
const getOrCreateChildFolder = async (parentFolder, targetName) => {
  if (parentFolder.children && parentFolder.children.length > 0) {
    const existing = parentFolder.children.find(
      (item) => item.directory && item.name === targetName
    );
    if (existing) {
      return existing;
    }
  }
  console.log(`📁 Creating folder "${targetName}" in MEGA Drive...`);
  return await parentFolder.mkdir(targetName);
};

/**
 * Helper to get or create a category folder inside the root LMS folder.
 */
export const getOrCreateFolder = async (subFolderName = 'Videos') => {
  const storage = await getMegaStorage();
  const root = storage.root;
  const baseFolderName = process.env.MEGA_FOLDER_NAME || 'LMS-Drive-Storage';

  // 1. Get or create base LMS folder
  const baseFolder = await getOrCreateChildFolder(root, baseFolderName);

  // 2. Get or create subcategory folder (e.g., Videos, Thumbnails, Documents)
  if (!subFolderName || subFolderName === baseFolderName) {
    return baseFolder;
  }
  return await getOrCreateChildFolder(baseFolder, subFolderName);
};

/**
 * Uploads a buffer directly to MEGA Drive into a designated folder.
 * Returns public share URL, embed URL (for videos), and metadata.
 */
export const uploadBufferToMega = async (fileBuffer, fileName, subFolderName = 'General') => {
  try {
    const targetFolder = await getOrCreateFolder(subFolderName);

    console.log(`🚀 Uploading ${fileName} (${fileBuffer.length} bytes) to MEGA Drive [${subFolderName}]...`);

    // Upload with name and size
    const uploadStream = targetFolder.upload(
      {
        name: fileName,
        size: fileBuffer.length,
      },
      fileBuffer
    );

    const uploadedFile = await uploadStream.complete;
    console.log(`✅ Upload completed for ${fileName} on MEGA Drive`);

    // Generate public share link: https://mega.nz/file/<fileId>#<key>
    const publicUrl = await uploadedFile.link();

    // Derive embed player URL for iframe: https://mega.nz/embed/<fileId>#<key>
    let embedUrl = publicUrl;
    if (publicUrl.includes('/file/')) {
      embedUrl = publicUrl.replace('/file/', '/embed/');
    }

    return {
      secure_url: publicUrl,
      embed_url: embedUrl,
      public_id: uploadedFile.nodeId || fileName,
      fileName: uploadedFile.name,
      bytes: uploadedFile.size || fileBuffer.length,
      storageProvider: 'mega',
    };
  } catch (error) {
    console.error(`❌ Error uploading ${fileName} to MEGA Drive:`, error);
    throw error;
  }
};

/**
 * Specialized upload functions for different media types
 */
export const uploadVideoToMega = async (fileBuffer, fileName) => {
  return uploadBufferToMega(fileBuffer, fileName, 'Videos');
};

export const uploadImageToMega = async (fileBuffer, fileName) => {
  return uploadBufferToMega(fileBuffer, fileName, 'Thumbnails');
};

export const uploadProfilePictureToMega = async (fileBuffer, fileName) => {
  return uploadBufferToMega(fileBuffer, fileName, 'Profile-Pictures');
};

export const uploadRawFileToMega = async (fileBuffer, fileName) => {
  return uploadBufferToMega(fileBuffer, fileName, 'Documents');
};

/**
 * Resolves a MEGA URL and returns a decrypted download stream.
 */
export const getFileStreamFromMega = async (megaUrl) => {
  if (!megaUrl) {
    throw new Error('No MEGA URL provided');
  }

  // Format can be mega.nz/file/... or mega.nz/embed/...
  const cleanUrl = megaUrl.replace('/embed/', '/file/');
  const file = File.fromURL(cleanUrl);

  await file.loadAttributes();

  return {
    stream: file.download(),
    name: file.name,
    size: file.size,
  };
};

export { File };
