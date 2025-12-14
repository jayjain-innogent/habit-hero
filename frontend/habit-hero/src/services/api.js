import axiosInstance from '../api/axiosConfig';

export const fetchWeeklyReport = async (startDate, endDate, habitId) => {
  try {
    const params = new URLSearchParams({
      startDate: startDate,
      endDate: endDate,
      habitId: habitId
    });
    const url = `/reports/weekly?${params}`;
    const response = await axiosInstance.get(url);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchHabitData = async (habitId) => {
  return {
    id: habitId,
    title: "Meditate for 10 Minutes",
    category: "Mind & Learning",
    frequency: "Daily",
    status: "On Track"
  };
};

export const fetchDashboardData = async () => {
  try {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;

    const response = await axiosInstance.get('/reports/dashboard', {
      params: { year, month }
    });
    return response.data;
  } catch (error) {
    // Fallback to mock data for 403 errors
    if (error.response?.status === 403) {
      return {
        cardData: {
          scorePercentage: 75,
          currentStreak: 5,
          perfectDays: 12,
          longestStreak: 15,
          activeDaysCount: 20
        },
        tableData: [
          { habitName: 'Morning Exercise', completionRate: 80, streak: 5, category: 'FITNESS' },
          { habitName: 'Read Books', completionRate: 60, streak: 3, category: 'LEARNING' },
          { habitName: 'Drink Water', completionRate: 90, streak: 7, category: 'HEALTH' }
        ],
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        motivationMessage: 'Keep building great habits!'
      };
    }
    throw error;
  }
};