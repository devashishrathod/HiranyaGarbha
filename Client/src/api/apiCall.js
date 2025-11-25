import { useMutation, useQuery } from "@tanstack/react-query";
import axiosInstance from "./axiosInstance";

// Generic GET request with React Query
export const useGetQuery = (endpoint, queryKey, options = {}) => {
  return useQuery({
    queryKey: queryKey,
    queryFn: async () => {
      const response = await axiosInstance.get(endpoint);
      return response.data;
    },
    ...options,
  });
};

// Generic POST request with React Query
export const usePostMutation = (endpoint, options = {}) => {
  return useMutation({
    mutationFn: async (data) => {
      const response = await axiosInstance.post(endpoint, data);
      return response.data;
    },
    ...options,
  });
};

// Generic PUT request with React Query
export const usePutMutation = (endpoint, options = {}) => {
  return useMutation({
    mutationFn: async (data) => {
      const response = await axiosInstance.put(endpoint, data);
      console.log(response.data, "datatatat");
      return response.data;
    },
    ...options,
  });
};

// Generic DELETE request with React Query
export const useDeleteMutation = (endpoint, options = {}) => {
  return useMutation({
    mutationFn: async (id) => {
      const response = await axiosInstance.delete(`${endpoint}/${id}`);
      return response.data;
    },
    ...options,
  });
};
