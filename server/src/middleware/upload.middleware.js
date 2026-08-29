import multer from "multer";

// =====================================================
// MEMORY STORAGE
// =====================================================

const storage = multer.memoryStorage();

// =====================================================
// IMAGE FILE FILTER
// =====================================================

const fileFilter = (req, file, cb) => {
  // ---------------------------------------------------
  // Allowed MIME types
  // ---------------------------------------------------

  const allowedMimeTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
  ];

  // ---------------------------------------------------
  // Allowed extensions
  // ---------------------------------------------------

  const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp", ".gif"];

  // ---------------------------------------------------
  // Get extension
  // ---------------------------------------------------

  const originalName = file.originalname || "";

  const extension = originalName
    .substring(originalName.lastIndexOf("."))
    .toLowerCase();

  // ---------------------------------------------------
  // Check MIME
  // ---------------------------------------------------

  const validMimeType = allowedMimeTypes.includes(file.mimetype);

  // ---------------------------------------------------
  // Check extension
  // ---------------------------------------------------

  const validExtension = allowedExtensions.includes(extension);

  // ---------------------------------------------------
  // Accept
  //
  // Some Windows/browser combinations may
  // report image files as application/octet-stream.
  // In that case, the known image extension allows
  // the upload to continue to Cloudinary.
  // ---------------------------------------------------

  if (
    validMimeType ||
    (file.mimetype === "application/octet-stream" && validExtension)
  ) {
    return cb(null, true);
  }

  // ---------------------------------------------------
  // Reject
  // ---------------------------------------------------

  return cb(
    new Error("Only JPG, JPEG, PNG, WEBP and GIF image files are allowed"),
    false,
  );
};

// =====================================================
// MULTER
// =====================================================

const upload = multer({
  storage,

  fileFilter,

  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

export default upload;
