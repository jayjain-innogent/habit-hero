import axiosInstance from "./axiosInstance";

const HABIT_LOG_BASE_URL = "/habits";

export const createLog = async (userId, habitId, logData) => {
    const response = await axiosInstance.post(
        `${HABIT_LOG_BASE_URL}/${habitId}/logs`,
        logData,
        {
            headers: { userId }
        }
    );
    return response.data;
};

export const getLogs = async (userId, habitId) => {
    const response = await axiosInstance.get(
        `${HABIT_LOG_BASE_URL}/${habitId}/logs`,
        {
            headers: { userId }
        }
    );
    return response.data;
};

export const getLogsInRange = async (userId, habitId, start, end) => {
    const response = await axiosInstance.get(
        `${HABIT_LOG_BASE_URL}/${habitId}/logs/range`,
        {
            headers: { userId },
            params: { start, end }
        }
    );
    return response.data;
};

export const getTodayStatus = async (userId) => {
    const response = await axiosInstance.get(
        `${HABIT_LOG_BASE_URL}/today-status`,
        {
            headers: { userId }
        }
    );
    return response.data;
};

export const getNote = async (userId, logId) => {
    const response = await axiosInstance.get(
        `${HABIT_LOG_BASE_URL}/logs/${logId}/note`,
        {
            headers: { userId }
        }
    );
    return response.data;
};

export const updateNote = async (userId, logId, noteText) => {
    const response = await axiosInstance.patch(
        `${HABIT_LOG_BASE_URL}/logs/${logId}/note`,
        noteText,
        {
            headers: {
                userId,
                "Content-Type": "text/plain"
            }
        }
    );
    return response.data;
};

export const deleteNote = async (userId, logId) => {
    const response = await axiosInstance.delete(
        `${HABIT_LOG_BASE_URL}/logs/${logId}/note`,
        {
            headers: { userId }
        }
    );
    return response.data;
};

export const deleteLog = async (userId, logId) => {
    const response = await axiosInstance.delete(
        `${HABIT_LOG_BASE_URL}/logs/${logId}`,
        {
            headers: { userId }
        }
    );
    return response.data;
};