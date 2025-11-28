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
