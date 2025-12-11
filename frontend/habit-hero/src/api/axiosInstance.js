import axios from "axios";

const axiosInstance = axios.create({
    baseURL: "http://localhost:8080",
    timeout: 10000,
    withCredentials: false,
    headers: {
        'Content-Type': 'application/json'
    }
});

axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error("API ERROR:", error);
        return Promise.reject(error);
    }
);

export default axiosInstance;