import React, { useState, useEffect } from "react";
import { useAppContext } from "../../routes/AppRoutes";
import { createActivityApi } from "../../api/activity";
import { getAllHabits } from "../../api/habits";
import { Target, Flame, Medal, BarChart3 } from "lucide-react";
import Avatar from "../common/Avatar";
import SegmentedButton from "../common/SegmentedButton";
import { getTodayStatus } from "../../api/habitLogs";
import { fetchDashboardData } from "../../services/api";
import "./CreateActivityModal.css";

const CreateActivityModal = ({ isOpen, onClose, onSubmit, summary: summaryData }) => {
  const [activityType, setActivityType] = useState("COMPLETION");
  const [selectedHabit, setSelectedHabit] = useState(null);
  const [summary, setSummary] = useState("");
  const [caption, setCaption] = useState("");
  const [visibility, setVisibility] = useState("FRIENDS");
  const [habits, setHabits] = useState([]);
  const { currentUserId } = useAppContext();

  // Filter habits based on activity type and completion status
  const filteredHabits = activityType === "COMPLETION"
    ? habits.filter(habit => habit.completedToday === true)
    : habits;

  useEffect(() => {
    if (isOpen) {
      fetchHabits();
    }
  }, [isOpen]);

  // Reset selected habit when activity type changes
  useEffect(() => {
    setSelectedHabit(null);
  }, [activityType]);

// Add this useEffect after the existing ones
useEffect(() => {
  if (activityType === "SUMMARY" && selectedHabit) {
    const generateSummary = async () => {
      setSummary("Generating summary..."); // Loading state
      try {
        const generatedSummary = await generateHabitSummary(selectedHabit.id, selectedHabit.title);
        setSummary(generatedSummary);
      } catch (error) {
        setSummary(`Weekly summary for ${selectedHabit.title}: Great progress this week!`);
      }
    };
    
    generateSummary();
  }
}, [activityType, selectedHabit]);


  const fetchHabits = async () => {
    try {
      const habitList = await getAllHabits(currentUserId);
      const todayStatus = await getTodayStatus(currentUserId);

      const habitsWithStatus = habitList.map(h => ({
        ...h,
        completedToday: todayStatus?.status?.[h.id]?.completedToday || false,
      }));

      setHabits(habitsWithStatus);
    } catch (error) {
      console.error("Failed to fetch habits:", error);
    }
  };

 const generateHabitSummary = async (habitId, habitTitle) => {
   try {
     // Try to fetch habit-specific weekly report
     let habitReport = null;
     try {
       const endDate = new Date().toISOString().split('T')[0];
       const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
       
       const reportResponse = await fetch(`http://localhost:8080/reports/weekly?startDate=${startDate}&endDate=${endDate}&habitId=${habitId}`, {
         headers: {
           'Authorization': `Bearer ${localStorage.getItem('token')}`
         }
       });
       if (reportResponse.ok) {
         habitReport = await reportResponse.json();
       }
     } catch (err) {
       console.log('Weekly report not available, using dashboard data');
     }

     // Fallback to dashboard data
     const dashboardData = await fetchDashboardData();
     const habitStats = dashboardData.tableData?.find(h => 
       h.habitName.toLowerCase().includes(habitTitle.toLowerCase()) ||
       habitTitle.toLowerCase().includes(h.habitName.toLowerCase())
     );
     const overallStats = dashboardData.cardData || {};
     
     // Create a personal achievement-focused prompt
      const prompt = `Write a personal weekly summary for my "${habitTitle}" habit as if I'm sharing my achievements with friends. Use this real data:

      My Progress This Week:
      - Habit: ${habitTitle}
      - Completion Rate: ${habitReport?.completionRate || habitStats?.completionRate || 'N/A'}%
      - Current Streak: ${habitReport?.currentStreak || habitStats?.streak || overallStats.currentStreak || 'N/A'} days
      - Days Completed: ${habitReport?.completedDays || habitReport?.daysCompleted || 'N/A'}
      - Total Days: ${habitReport?.totalDays || 7}
      - Category: ${habitStats?.category || 'Personal Development'}

      Write in first person (I achieved, I worked on, I maintained, etc.) as a personal accomplishment post. Make it:
      1. Celebratory of specific achievements (use actual numbers)
      2. Personal and authentic 
      3. 2-3 sentences maximum
      4. Include what I accomplished and how it benefited me
      5. DO NOT use any markdown formatting like **bold** or *italic* - use plain text only

      Example tone: "I successfully maintained my meditation habit with an 85% completion rate this week, achieving a 5-day streak! This consistent practice has really helped me feel more centered and focused throughout my busy days."`;


     const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=AIzaSyDOSfWFFpJNsuj12zYXe5UjdCLzwbxUixk`, {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json',
       },
       body: JSON.stringify({
         contents: [{
           parts: [{
             text: prompt
           }]
         }]
       })
     });
     
     const data = await response.json();
     
     if (data.candidates && data.candidates[0] && data.candidates[0].content) {
       return data.candidates[0].content.parts[0].text;
     } else {
       throw new Error('Invalid response format');
     }
   } catch (error) {
     console.error('Failed to generate summary:', error);
     return `I've been working consistently on my ${habitTitle} habit this week and feeling great about the progress! This routine is really making a positive impact on my daily life.`;
   }
 };


      

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedHabit) return;

    const getActivityTitle = (type, habitTitle) => {
      switch (type) {
        case 'COMPLETION':
          return `completed ${habitTitle}`;
        case 'STREAK':
          return `achieved streak for ${habitTitle}`;
        case 'MILESTONE':
          return `reached milestone for ${habitTitle}`;
        case 'SUMMARY':
          return `summary for ${habitTitle}`;
        default:
          return `completed ${habitTitle}`;
      }
    };

    try {
      const payload = {
        userId: currentUserId,
        habitId: selectedHabit.id,
        activityType,
        title: getActivityTitle(activityType, selectedHabit.title),
        description: summary,
        caption,
        visibility,
      };

      await createActivityApi(payload);
      onSubmit();
      onClose();
      setSelectedHabit(null);
      setCaption("");
      setSummary("");
      setActivityType("COMPLETION");
      setVisibility("FRIENDS");
    } catch (error) {
      console.error("Failed to create activity:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="create-activity-overlay">
      <div className="create-activity-content">
        <div className="create-activity-header">
          <h2 className="create-activity-title">Share Activity</h2>
          <button onClick={onClose} className="create-activity-close">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="create-activity-form">
          <div className="create-form-group">
            <label className="create-form-label">Activity Type</label>
            <div className="create-button-group">
              {[
                { value: "COMPLETION", label: "Completion" },
                { value: "STREAK", label: "Streak" },
                { value: "MILESTONE", label: "Milestone" },
                { value: "SUMMARY", label: "Summary" }
              ].map((type) => (
                <button
                  key={type.value}
                  type="button"
                  className={`create-option-btn ${activityType === type.value ? 'active' : ''}`}
                  onClick={() => setActivityType(type.value)}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          <div className="create-form-group">
            <label className="create-form-label">Select Habit</label>
            <select
              value={selectedHabit?.id || ""}
              onChange={(e) =>
                setSelectedHabit(
                  filteredHabits.find((habit) => habit.id === parseInt(e.target.value))
                )
              }
              className="create-form-input"
            >
              <option value="" disabled>
                Select a habit...
              </option>
              {filteredHabits.map((habit) => (
                <option key={habit.id} value={habit.id}>
                  {habit.title}
                </option>
              ))}
            </select>
          </div>

          <div className="create-form-group">
            <label className="create-form-label">Visibility</label>
            <SegmentedButton
              options={[
                { label: "Public", value: "PUBLIC" },
                { label: "Private", value: "PRIVATE" },
                { label: "Friends", value: "FRIENDS" },
              ]}
              selected={visibility}
              onChange={setVisibility}
            />
          </div>

          {activityType != "SUMMARY" && <div className="create-form-group">
            <label className="create-form-label">Add a caption</label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={3}
              className="create-form-textarea"
              placeholder="Caption."
            />
          </div>}

          {activityType === "SUMMARY" && <div className="create-form-group">
            <label className="create-form-label">Add a summary</label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={3}
              className="create-form-textarea"
              placeholder="Share summary."
            />
          </div>}

          <div className="create-activity-footer">
            <button type="button" onClick={onClose} className="create-btn-secondary">
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedHabit}
              className="create-btn-primary"
            >
              Share Activity
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateActivityModal;