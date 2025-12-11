import axiosInstance from '../services/apis';

/**
 * Generic API response type
 */
export interface ApiResponse<T = any> {
  data: T;
  message: string;
  success: boolean;
}

/**
 * Error response type
 */
export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

/**
 * Base API class for making HTTP requests
 * This provides a consistent interface for all API calls
 */
class ApiService {
  /**
   * GET request
   */
  async get<T>(url: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    const response = await axiosInstance.get(url, { params });
    return response.data;
  }

  /**
   * POST request
   */
  async post<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    const response = await axiosInstance.post(url, data);
    return response.data;
  }

  /**
   * PUT request
   */
  async put<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    const response = await axiosInstance.put(url, data);
    return response.data;
  }

  /**
   * PATCH request
   */
  async patch<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    const response = await axiosInstance.patch(url, data);
    return response.data;
  }

  /**
   * DELETE request
   */
  async delete<T>(url: string): Promise<ApiResponse<T>> {
    const response = await axiosInstance.delete(url);
    return response.data;
  }
}

export const api = new ApiService();