// ================================================================
// Storage utility — supports local, Cloudinary, and R2 (S3-compatible)
// ================================================================

import { config } from './config';
import fs from 'fs';
import path from 'path';

let cloudinary: any = null;
let s3Client: any = null;
let s3: any = null;

const provider = config.STORAGE_PROVIDER;

if (provider === 'cloudinary') {
  cloudinary = require('cloudinary').v2;
  cloudinary.config({
    cloud_name: config.CLOUDINARY_CLOUD_NAME,
    api_key: config.CLOUDINARY_API_KEY,
    api_secret: config.CLOUDINARY_API_SECRET,
  });
} else if (provider === 'r2') {
  const { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } =
    require('@aws-sdk/client-s3');
  s3Client = new S3Client({
    region: 'auto',
    endpoint: config.R2_ENDPOINT,
    credentials: {
      accessKeyId: config.R2_ACCESS_KEY,
      secretAccessKey: config.R2_SECRET_KEY,
    },
  });
  s3 = { PutObjectCommand, DeleteObjectCommand, GetObjectCommand };
}

interface FileData {
  buffer?: Buffer;
  originalname?: string;
  mimetype?: string;
  path?: string;
}

/**
 * Upload a file to the configured storage provider.
 */
export async function uploadFile(
  file: FileData
): Promise<{ url: string; publicId: string }> {
  if (provider === 'cloudinary' && cloudinary) {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'artist-portfolio',
          resource_type: 'image',
        },
        (error: any, result: any) => {
          if (error) return reject(error);
          resolve({ url: result.secure_url, publicId: result.public_id });
        }
      );
      if (file.buffer) {
        uploadStream.end(file.buffer);
      } else if (file.path) {
        fs.createReadStream(file.path).pipe(uploadStream);
      } else {
        reject(new Error('No file data provided'));
      }
    });
  }

  if (provider === 'r2' && s3Client && s3) {
    const key = `artist-portfolio/${Date.now()}-${(file.originalname || 'file').replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const body = file.buffer || fs.readFileSync(file.path!);
    const command = new s3.PutObjectCommand({
      Bucket: config.R2_BUCKET_NAME,
      Key: key,
      Body: body,
      ContentType: file.mimetype || 'application/octet-stream',
    });
    await s3Client.send(command);
    const url = config.R2_PUBLIC_URL
      ? `${config.R2_PUBLIC_URL.replace(/\/+$/, '')}/${key}`
      : `${config.R2_ENDPOINT}/${config.R2_BUCKET_NAME}/${key}`;
    return { url, publicId: key };
  }

  // Local fallback
  const uploadDir = path.resolve(config.UPLOAD_DIR);
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  const filename = `${Date.now()}-${(file.originalname || 'file').replace(/[^a-zA-Z0-9._-]/g, '_')}`;
  const destPath = path.join(uploadDir, filename);
  const buffer = file.buffer || fs.readFileSync(file.path!);
  fs.writeFileSync(destPath, buffer);
  const url = `${config.SITE_URL.replace(/\/+$/, '')}/uploads/${filename}`;
  return { url, publicId: filename };
}

/**
 * Delete a file from the configured storage provider.
 */
export async function deleteFile(publicId: string): Promise<any> {
  if (provider === 'cloudinary' && cloudinary) {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, (error: any, result: any) => {
        if (error) return reject(error);
        resolve(result);
      });
    });
  }

  if (provider === 'r2' && s3Client && s3) {
    const command = new s3.DeleteObjectCommand({
      Bucket: config.R2_BUCKET_NAME,
      Key: publicId,
    });
    return s3Client.send(command);
  }

  // Local
  const filePath = path.resolve(config.UPLOAD_DIR, publicId);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
  return { status: 'deleted' };
}

/**
 * Get a public URL for a stored file.
 */
export function getFileUrl(key: string): string {
  if (provider === 'cloudinary' && cloudinary) {
    return cloudinary.url(key);
  }
  if (provider === 'r2') {
    return config.R2_PUBLIC_URL
      ? `${config.R2_PUBLIC_URL.replace(/\/+$/, '')}/${key}`
      : `${config.R2_ENDPOINT}/${config.R2_BUCKET_NAME}/${key}`;
  }
  return `${config.SITE_URL.replace(/\/+$/, '')}/uploads/${key}`;
}
