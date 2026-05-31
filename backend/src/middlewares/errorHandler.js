export function errorHandler(err, _req, res, _next) {
  const status = err.statusCode || 500;
  const message = err.isOperational ? err.message : "Internal Server Error";
  if (!err.isOperational) console.error("[ERROR]", err);
  res.status(status).json({ success: false, message });
}
