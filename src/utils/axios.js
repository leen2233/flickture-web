import axios from "axios";
import { toast } from "react-toastify";

const API_BASE_URL = "http://localhost:8000/api/v1";

// Add this at the top of your file
const pendingRequests = new Map();

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 second timeout
  headers: {
    "Content-Type": "application/json",
    // Add cache control headers to prevent caching
    "Cache-Control": "no-cache",
    Pragma: "no-cache",
    Expires: "0",
  },
});

// Retry configuration
axiosClient.defaults.retry = 3; // Number of retry attempts
axiosClient.defaults.retryDelay = 1000; // Delay between retries in ms
axiosClient.defaults.shouldRetry = (error) => {
  // Retry on timeout errors and network errors, but not on 4xx or 5xx responses
  return (
    error.code === "ECONNABORTED" ||
    error.code === "ETIMEDOUT" ||
    !error.response
  );
};

// Request interceptor with deduplication
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }

    // Generate a unique key for the request
    const requestKey = `${config.method}:${config.url}:${JSON.stringify(
      config.params
    )}:${JSON.stringify(config.data)}`;

    // Check if there's a pending request
    if (pendingRequests.has(requestKey)) {
      // Return the existing promise to prevent duplicate request
      return Promise.reject({
        __CANCEL__: true,
        promise: pendingRequests.get(requestKey),
      });
    }

    // Create a new promise for this request
    const promise = new Promise((resolve) => {
      // Store the resolver function
      config.__resolve = resolve;
    });

    // Store the promise
    pendingRequests.set(requestKey, promise);
    config.__requestKey = requestKey;

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor with deduplication cleanup
axiosClient.interceptors.response.use(
  (response) => {
    // Clean up the pending request
    if (response.config.__requestKey) {
      const resolver = response.config.__resolve;
      if (resolver) {
        resolver(response);
      }
      pendingRequests.delete(response.config.__requestKey);
    }
    return response;
  },
  async (error) => {
    // If this is a cancelled duplicate request, return the existing promise
    if (error.__CANCEL__ && error.promise) {
      return error.promise;
    }

    // Clean up the pending request on error
    if (error.config?.__requestKey) {
      pendingRequests.delete(error.config.__requestKey);
    }

    // Show error notification
    let errorMessage = "An error occurred. Please try again.";
    if (error.response) {
      console.log(error.response.status);
      if (error.response.status === 404) {
        errorMessage = "Requested content couldn't found";
      } else if (error.response.status === 500) {
        errorMessage = "Internal Server Error";
      } else if (error.response.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.response.data?.message) {
        errorMessage = error.response.data.message;
      } else if (typeof error.response.data === "string") {
        errorMessage = error.response.data;
      }
    } else if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
      errorMessage = "Request timed out. Please try again.";
    } else if (!error.response) {
      errorMessage = "Network error. Please check your connection.";
    }

    toast.error(errorMessage, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark", // Assuming dark theme, adjust if needed
      style: {
        background: "#1a1a1a",
        color: "#fff",
        borderRadius: "8px",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      },
    });

    const originalRequest = error.config;

    // If we shouldn't retry or we've run out of retries, reject the promise
    if (
      !axiosClient.defaults.shouldRetry(error) ||
      originalRequest._retry >= axiosClient.defaults.retry
    ) {
      return Promise.reject(error);
    }

    // Initialize retry count
    originalRequest._retry = (originalRequest._retry || 0) + 1;

    // Wait before retrying
    await new Promise((resolve) =>
      setTimeout(
        resolve,
        axiosClient.defaults.retryDelay * originalRequest._retry
      )
    );

    // Retry the request
    return axiosClient(originalRequest);
  }
);

export default axiosClient;
