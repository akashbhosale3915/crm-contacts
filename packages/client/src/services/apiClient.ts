import axios from "axios";
import type { ApiErrorResponse } from "../../../shared/src";

const apiClient = axios.create({
  baseURL: "http://localhost:3000/api",
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

export const isRequestCanceled = (error: unknown): boolean =>
  axios.isCancel(error);

export default apiClient;
