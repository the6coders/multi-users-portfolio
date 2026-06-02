import multer from "multer";
import { ApiError } from "../utils/apiError.js";

const storage = multer.memoryStorage();

const IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

function imageFilter(_req, file, cb) {
  if (IMAGE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ApiError(400, "Only JPG, JPEG, PNG, WEBP images are allowed"), false);
  }
}

function pdfFilter(_req, file, cb) {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new ApiError(400, "Only PDF files are allowed"), false);
  }
}

const _imageUpload = multer({
  storage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

const _pdfUpload = multer({
  storage,
  fileFilter: pdfFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

/**
 * Wraps a multer middleware so MulterError instances are converted to ApiError
 * and reported with a proper 400 status instead of the default 500.
 */
function wrapMulter(multerMiddleware) {
  return (req, res, next) => {
    multerMiddleware(req, res, (err) => {
      if (!err) return next();
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return next(new ApiError(400, "File size exceeds the allowed limit"));
        }
        return next(new ApiError(400, err.message));
      }
      // ApiError from fileFilter or unknown error — pass through as-is
      return next(err);
    });
  };
}

/** Single image upload middleware (5 MB limit, JPG/PNG/WEBP) */
export const imageUploadMiddleware = (field = "file") =>
  wrapMulter(_imageUpload.single(field));

/** Single PDF upload middleware (10 MB limit) */
export const pdfUploadMiddleware = (field = "file") =>
  wrapMulter(_pdfUpload.single(field));
