const API_BASE_URL = 'http://localhost:8080/api';

export const fetchWeeklyReport = async (startDate, endDate, habitId) => {
  try {
    const params = new URLSearchParams({
      startDate: startDate,
      endDate: endDate
    });

    if (habitId) {
      params.append('habitId', habitId);
    }

    const url = `${API_BASE_URL}/reports/weekly?${params}`;
    console.log('Fetching from:', url);
    
    const response = await fetch(url);
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();
    console.log('API Response:', data);
    return data;
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