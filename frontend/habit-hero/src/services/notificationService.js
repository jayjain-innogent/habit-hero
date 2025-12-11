import axiosInstance from '../api/axiosConfig';

const API_BASE_URL = '/notifications'; // BaseURL is already in axiosConfig

export const notificationService = {
    getNotifications: async () => {
        const response = await axiosInstance.get(API_BASE_URL);
        return response.data;
    },

    getUnreadCount: async () => {
        const response = await axiosInstance.get(`${API_BASE_URL}/unread-count`);
        return response.data;
    },

    markAsRead: async (id) => {
        await axiosInstance.put(`${API_BASE_URL}/${id}/read`);
    },

    markAllAsRead: async () => {
        await axiosInstance.put(`${API_BASE_URL}/read-all`);
    },

    deleteNotification: async (id) => {
        await axiosInstance.delete(`${API_BASE_URL}/${id}`);
    }
};

