import cloudinary from "../src/config/cloudinary.js";

// =====================================================
// UPLOAD IMAGE BUFFER TO CLOUDINARY
// =====================================================

export const uploadToCloudinary = (buffer, folder = "arfusion/products") => {
  return new Promise((resolve, reject) => {
    if (!buffer || !Buffer.isBuffer(buffer)) {
      return reject(new Error("Invalid image buffer"));
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        timeout: 120000,
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary Upload Error:", error);
          return reject(error);
        }

        if (!result) {
          return reject(new Error("Cloudinary returned no upload result"));
        }

        return resolve(result);
      },
    );

    uploadStream.on("error", (error) => {
      console.error("Cloudinary Upload Stream Error:", error);
      reject(error);
    });

    uploadStream.end(buffer);
  });
};
