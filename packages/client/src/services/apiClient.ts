import axios from "axios";
import type { ApiErrorResponse } from "../../../shared/src";

const apiClient = axios.create({
  baseURL:
    import.meta.env.MODE === "development"
      ? "http://localhost:8000/api"
      : "/api",
});

export const getApiErrorMessage = (
  error: unknown,
  fallback: string,
): string => {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data?.error ?? fallback;
  }
  return fallback;
};

export const isConflictError = (error: unknown): boolean =>
  axios.isAxiosError(error) && error.response?.status === 409;

export const isDuplicateEmailError = (error: unknown): boolean =>
  axios.isAxiosError<ApiErrorResponse>(error) &&
  error.response?.status === 409 &&
  error.response.data?.error === "Email already exists";

export const isRequestCanceled = (error: unknown): boolean =>
  axios.isCancel(error);

export default apiClient;
