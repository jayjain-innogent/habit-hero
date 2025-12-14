import React, { useState, useEffect } from "react";
import { useAppContext } from "../../routes/AppRoutes";
import { createActivityApi } from "../../api/activity";
import { getAllHabits } from "../../api/habits";
import { Target, Flame, Medal, BarChart3 } from "lucide-react";
import Avatar from "../common/Avatar";
import SegmentedButton from "../common/SegmentedButton";
import { getTodayStatus } from "../../api/habitLogs";
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

  console.log('All habits:', habits);
  console.log('Filtered habits:', filteredHabits);

  useEffect(() => {
    if (isOpen) {
      fetchHabits();
    }
  }, [isOpen]);

  // Reset selected habit when activity type changes
  useEffect(() => {
    setSelectedHabit(null);
  }, [activityType]);

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