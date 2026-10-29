import type { ErrorRequestHandler } from "express";
import mongoose from "mongoose";
import AppError from "../utils/AppError";
import { RequestValidationError } from "../validation";

const isDuplicateKeyError = (
  error: unknown,
): error is { code: number } =>
  typeof error === "object" &&
  error !== null &&
  "code" in error &&
  error.code === 11000;

const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof RequestValidationError) {
    res.status(400).json({ error: error.message });
    return;
  }

  if (error instanceof AppError) {
    res.status(error.statusCode).json({ error: error.message });
    return;
  }

  if (isDuplicateKeyError(error)) {
    res.status(409).json({ error: "Email already exists" });
    return;
  }

  if (error instanceof mongoose.Error.VersionError) {
    res.status(409).json({
      error: "Conflict: Contact was modified by another user. Please refresh.",
    });
    return;
  }

  if (error instanceof mongoose.Error.ValidationError) {
    res.status(400).json({ error: "Contact data is invalid" });
    return;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "type" in error &&
    error.type === "entity.parse.failed"
  ) {
    res.status(400).json({ error: "Invalid JSON request body" });
    return;
  }

  console.error("Unhandled API request error", error);
  res.status(500).json({ error: "Request failed" });
};

export default errorHandler;
