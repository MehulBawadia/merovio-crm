import { ApiError } from "../utils/ApiError.js";

export const notFound = (req, res, next) => {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // Mongoose: Bad ObjectId
  if (err.name === "CartError") {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}.`;
  }

  // Mongoose: Duplicate Key (eg: email already exists)
  if (err.name === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue || {})[0] || "field";
    message = `A record with that ${field} already exists.`;
  }

  // Mongoose: schema validation
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.keys(err.errors)
      .map((e) => e.message)
      .join(", ");
  }

  if (process.env.NODE_ENV !== "production" && statusCode === 500) {
    console.log(err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== "production" && statusCode === 500
      ? { stack: err.stack }
      : {}),
  });
};
