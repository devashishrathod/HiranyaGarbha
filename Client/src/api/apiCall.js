import { useMutation, useQuery } from "@tanstack/react-query";
import axiosInstance from "./axiosInstance";
import { toast } from "react-hot-toast";

export const getApiErrorMessage = (
  error,
  fallback = "Something went wrong",
) => {
  const data = error?.response?.data;

  const direct =
    data?.message ||
    data?.data?.message ||
    data?.error?.message ||
    error?.message ||
    "";

  if (typeof direct === "string" && direct.trim()) return direct;

  const status = error?.response?.status;
  if (status === 400) return "Invalid request. Please check your input.";
  if (status === 401) return "Session expired. Please login again.";
  if (status === 403) return "You are not allowed to perform this action.";
  if (status === 404) return "Requested data was not found.";
  if (status === 409) return "Conflict detected. Please try again.";
  if (status >= 500) return "Server error. Please try again later.";

  return fallback;
};

// Generic GET request with React Query
export const useGetQuery = (endpoint, queryKeyOrOptions, options = {}) => {
  const queryKey = Array.isArray(queryKeyOrOptions)
    ? queryKeyOrOptions
    : endpoint
      ? [endpoint]
      : ["__disabled__"];

  const mergedOptions = Array.isArray(queryKeyOrOptions)
    ? options
    : queryKeyOrOptions || {};

  const enabledFromOptions =
    typeof mergedOptions.enabled === "boolean" ? mergedOptions.enabled : true;

  return useQuery({
    queryKey,
    enabled: !!endpoint && enabledFromOptions,
    queryFn: async () => {
      const response = await axiosInstance.get(endpoint);
      console.log(response.data, "response data from api call");
      return response.data;
    },
    ...mergedOptions,
  });
};

// // Generic POST request with React Query
// export const usePostMutation = (endpoint, options = {}) => {
//   return useMutation({
//     mutationFn: async (data) => {
//       const response = await axiosInstance.post(endpoint, data);
//       return response.data;
//     },
//     ...options,
//   });
// };

// // Generic PUT request with React Query
// export const usePutMutation = (endpoint, options = {}) => {
//   return useMutation({
//     mutationFn: async (data) => {
//       const response = await axiosInstance.put(endpoint, data);
//       console.log(response.data, "datatatat");
//       return response.data;
//     },
//     ...options,
//   });
// };

export const usePostMutation = (endpoint, options = {}) => {
  const { onError, toastOnError = true, ...restOptions } = options || {};

  return useMutation({
    mutationFn: async (data) => {
      const response = await axiosInstance.post(endpoint, data, {
        onUploadProgress: options.onUploadProgress,
      });
      return response.data;
    },
    onError: (error, variables, context) => {
      if (toastOnError && typeof onError !== "function") {
        toast.error(getApiErrorMessage(error));
      }
      return onError?.(error, variables, context);
    },
    ...restOptions,
  });
};

export const usePutMutation = (endpoint, options = {}) => {
  const { onError, toastOnError = true, ...restOptions } = options || {};

  return useMutation({
    mutationFn: async (data) => {
      const response = await axiosInstance.put(endpoint, data, {
        onUploadProgress: options.onUploadProgress,
      });
      return response.data;
    },
    onError: (error, variables, context) => {
      if (toastOnError && typeof onError !== "function") {
        toast.error(getApiErrorMessage(error));
      }
      return onError?.(error, variables, context);
    },
    ...restOptions,
  });
};

// Generic DELETE request with React Query
export const useDeleteMutation = (endpoint, options = {}) => {
  const { onError, toastOnError = true, ...restOptions } = options || {};

  return useMutation({
    mutationFn: async (id) => {
      const url = endpoint?.includes(":id")
        ? endpoint.replace(":id", id)
        : `${endpoint}/${id}`;
      const response = await axiosInstance.delete(url);
      return response.data;
    },
    onError: (error, variables, context) => {
      if (toastOnError && typeof onError !== "function") {
        toast.error(getApiErrorMessage(error));
      }
      return onError?.(error, variables, context);
    },
    ...restOptions,
  });
};
