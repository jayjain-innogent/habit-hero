import axiosInstance from "./axiosInstance";

const HABIT_BASE_URL = "/habits";

export const getAllHabits = async (userId) => {
    const response = await axiosInstance.get(HABIT_BASE_URL, {
        headers: { userId }
    });
    return response.data;
};

export const getHabitById = async (userId, habitId) => {
    const response = await axiosInstance.get(`${HABIT_BASE_URL}/${habitId}`, {
        headers: { userId }
    });
    return response.data;
};

export const createHabit = async (userId, habitData) => {
    const response = await axiosInstance.post(HABIT_BASE_URL, habitData, {
        headers: { userId }
    });
    return response.data;
};

export const updateHabit = async (userId, habitId, updatedFields) => {
    const response = await axiosInstance.patch(
        `${HABIT_BASE_URL}/${habitId}`,
        updatedFields,
        {
            headers: { userId }
        }
    );
    return response.data;
};

export const deleteHabit = async (userId, habitId) => {
    const response = await axiosInstance.delete(
        `${HABIT_BASE_URL}/${habitId}`,
        {
            headers: { userId }
        }
    );
    return true;
};
