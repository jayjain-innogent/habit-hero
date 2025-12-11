import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/notifications';

export const notificationService = {
    getNotifications: async () => {
        const response = await axios.get(API_BASE_URL);
        return response.data;
    },

    getUnreadCount: async () => {
        const response = await axios.get(`${API_BASE_URL}/unread-count`);
        return response.data;
    },

    markAsRead: async (id) => {
        await axios.put(`${API_BASE_URL}/${id}/read`);
    },

    markAllAsRead: async () => {
        await axios.put(`${API_BASE_URL}/read-all`);
    },

    deleteNotification: async (id) => {
        await axios.delete(`${API_BASE_URL}/${id}`);
    }
};
