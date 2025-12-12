import axios from "axios";

const axiosInstance = axios.create({
    baseURL: "http://localhost:8080", // Backend Base URL
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
});

// Request Interceptor: Attach Token
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        console.log('=== Axios Request Interceptor ===');
        console.log('Token from localStorage:', token ? token.substring(0, 50) + '...' : 'NO TOKEN');
        
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log('Authorization header set:', `Bearer ${token.substring(0, 50)}...`);
        } else {
            console.warn('NO TOKEN IN LOCALSTORAGE - Request will not have Authorization header');
        }
        console.log('Request URL:', config.url);
        console.log('Request headers:', config.headers);
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor: Handle Errors (Optional but good practice)
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        // You could handle 401 (Unauthorized) here by logging out
        if (error.response && error.response.status === 401) {
            // Optional: localStorage.removeItem("token"); window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
