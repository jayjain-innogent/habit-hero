// Mock data for development when backend is not available
export const mockHabits = [
  {
    id: 1,
    name: "Morning Exercise",
    description: "30 minutes of cardio or strength training",
    category: "FITNESS",
    frequency: "DAILY",
    targetValue: 30,
    unit: "minutes",
    status: "ACTIVE",
    createdAt: "2025-12-01T08:00:00Z"
  },
  {
    id: 2,
    name: "Read Books",
    description: "Read for personal development",
    category: "LEARNING",
    frequency: "DAILY",
    targetValue: 20,
    unit: "pages",
    status: "ACTIVE",
    createdAt: "2025-12-01T09:00:00Z"
  },
  {
    id: 3,
    name: "Drink Water",
    description: "Stay hydrated throughout the day",
    category: "HEALTH",
    frequency: "DAILY",
    targetValue: 8,
    unit: "glasses",
    status: "ACTIVE",
    createdAt: "2025-12-01T07:00:00Z"
  }
];

export const mockTodayStatus = {
  status: {
    1: { completedToday: false, actualValue: null, logId: null },
    2: { completedToday: false, actualValue: null, logId: null },
    3: { completedToday: false, actualValue: null, logId: null }
  }
};