import React, { useState, useEffect } from "react";
import { useAppContext } from "../../routes/AppRoutes";
import { createActivityApi } from "../../api/activity";
import { getAllHabits } from "../../api/habits";
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
        description : summary,
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
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">Share Activity</h2>
          <button onClick={onClose} className="modal-close">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label className="form-label">Activity Type</label>
            <select
              value={activityType}
              onChange={(e) => setActivityType(e.target.value)}
              className="form-input"
            >
              <option value="COMPLETION">Completion</option>
              <option value="STREAK">Streak</option>
              <option value="MILESTONE">Milestone</option>
              <option value="SUMMARY">Summary</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Select Habit</label>
            <select
              value={selectedHabit?.id || ""}
              onChange={(e) =>
                setSelectedHabit(
                  filteredHabits.find((habit) => habit.id === parseInt(e.target.value))
                )
              }

              className="form-input"
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

          <div className="form-group">
            <label className="form-label">Visibility</label>
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

          {activityType != "SUMMARY" && <div className="form-group">
            <label className="form-label">Add a caption</label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={3}
              className="form-textarea"
              placeholder="Caption."
            />
          </div>}

          {activityType === "SUMMARY" && <div className="form-group">
            <label className="form-label">Add a summary</label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={3}
              className="form-textarea"
              placeholder="Share summary."
            />
          </div>}


          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedHabit}
              className="btn-primary"
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
