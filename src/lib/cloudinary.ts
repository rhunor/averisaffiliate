import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: (process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME)!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export default cloudinary;

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  duration?: number;
  resource_type: string;
  format: string;
  bytes: number;
}

export async function uploadVideo(
  file: Buffer | string,
  folder: string = "averis-academy/courses"
): Promise<CloudinaryUploadResult> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: "video",
        folder,
        chunk_size: 6_000_000,
        eager: [{ streaming_profile: "sd", format: "m3u8" }],
        eager_async: true,
      },
      (error, result) => {
        if (error || !result) return reject(error || new Error("Upload failed"));
        resolve(result as CloudinaryUploadResult);
      }
    );

    if (typeof file === "string") {
      cloudinary.uploader.upload(
        file,
        { resource_type: "video", folder, chunk_size: 6_000_000 },
        (error, result) => {
          if (error || !result) return reject(error || new Error("Upload failed"));
          resolve(result as CloudinaryUploadResult);
        }
      );
    } else {
      stream.end(file);
    }
  });
}

export async function uploadImage(
  file: Buffer | string,
  folder: string = "averis-academy"
): Promise<CloudinaryUploadResult> {
  return new Promise((resolve, reject) => {
    if (typeof file === "string") {
      cloudinary.uploader.upload(
        file,
        { resource_type: "image", folder, transformation: [{ quality: "auto", fetch_format: "auto" }] },
        (error, result) => {
          if (error || !result) return reject(error || new Error("Upload failed"));
          resolve(result as CloudinaryUploadResult);
        }
      );
    } else {
      const stream = cloudinary.uploader.upload_stream(
        { resource_type: "image", folder, transformation: [{ quality: "auto", fetch_format: "auto" }] },
        (error, result) => {
          if (error || !result) return reject(error || new Error("Upload failed"));
          resolve(result as CloudinaryUploadResult);
        }
      );
      stream.end(file);
    }
  });
}

export async function deleteResource(
  publicId: string,
  resourceType: "image" | "video" = "video"
): Promise<void> {
  await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
}
