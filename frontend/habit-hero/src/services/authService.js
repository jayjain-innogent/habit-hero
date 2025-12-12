import axiosInstance from "../api/axiosConfig";

const AuthService = {
    // A. Register
    register: async (userData) => {
        const response = await axiosInstance.post("/auth/register", userData);
        return response.data;
    },

    // B. Verify OTP
    verifyOtp: async (otpData) => {
        // otpData should be { email: "...", otp: "..." }
        const response = await axiosInstance.post("/auth/verify-otp", otpData);
        return response.data;
    },

    // C. Login
    login: async (loginData) => {
        // loginData should be { email: "...", password: "..." }
        const response = await axiosInstance.post("/auth/login", loginData);
        return response.data;
    },

    // D. Forgot Password
    forgotPassword: async (email) => {
        // Sending as query param but with empty body to avoid 400 Bad Request on some servers
        const response = await axiosInstance.post("/auth/forgot-password", {}, { params: { email } });
        return response.data;
    },

    // E. Reset Password
    resetPassword: async (resetData) => {
        // resetData should be { token: "...", newPassword: "..." }
        const response = await axiosInstance.post("/auth/reset-password", resetData);
        return response.data;
    }
};

export default AuthService;
