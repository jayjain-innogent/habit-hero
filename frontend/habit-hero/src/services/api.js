import axiosInstance from '../api/axiosConfig';

const API_BASE_URL = 'http://localhost:8080/api';

export const fetchWeeklyReport = async (startDate, endDate, habitId) => {
  try {
    const params = new URLSearchParams({
      startDate: startDate,
      endDate: endDate,
      habitId: habitId
    });

    const url = `/reports/weekly?${params}`;
    console.log('Fetching from:', url);
    
    const response = await axiosInstance.get(url);
    console.log('Response status:', response.status);
    console.log('API Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Fetch error:', error);
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
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');

    console.log('=== Dashboard API Call ===');
    console.log('Token in localStorage:', token ? token.substring(0, 50) + '...' : 'MISSING');
    console.log('UserId in localStorage:', userId);
    console.log('Query params - Year:', year, 'Month:', month);

    // Backend extracts userId from JWT token, not from headers
    const response = await axiosInstance.get('/reports/dashboard', {
      params: { year, month }
    });

    console.log('Dashboard API Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('=== Dashboard API Error ===');
    console.error('Status:', error.response?.status);
    console.error('Error:', error.response?.data || error.message);

    // Fallback to mock data for 403 errors until backend is fixed
    if (error.response?.status === 403) {
      console.warn('Using mock data due to 403 error');
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