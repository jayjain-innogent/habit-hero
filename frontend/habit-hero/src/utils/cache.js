export const getCacheKey = (userId) => `habit_status_${userId}`;

export const loadTodayCache = (userId) => {
    const key = getCacheKey(userId);
    const cached = localStorage.getItem(key);
    return cached ? JSON.parse(cached) : null;
};

export const saveTodayCache = (userId, list) => {
    const key = getCacheKey(userId);

    localStorage.setItem(
        key,
        JSON.stringify({
            date: new Date().toISOString().split("T")[0],
            data: list
        })
    );
};

export const updateTodayStatusCache = (userId, habitId, actualValue) => {
    const key = getCacheKey(userId);
    const cached = loadTodayCache(userId);

    if (!cached) return;

    const updatedData = cached.data.map((h) =>
        h.id === habitId
            ? { ...h, completedToday: true, actualValue: actualValue }
            : h
    );

    saveTodayCache(userId, updatedData);
};