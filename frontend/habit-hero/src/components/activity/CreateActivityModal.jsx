import React, { useState, useEffect } from "react";
import { useAppContext } from "../../routes/AppRoutes";
import { createActivityApi } from "../../api/activity";
import { getAllHabits } from "../../api/habits";
import Avatar from "../common/Avatar";
import SegmentedButton from "../common/SegmentedButton";
import "./CreateActivityModal.css";

const CreateActivityModal = ({ isOpen, onClose, onSubmit }) => {
  const [activityType, setActivityType] = useState("COMPLETION");
  const [selectedHabit, setSelectedHabit] = useState(null);
  const [note, setNote] = useState("");
  const [visibility, setVisibility] = useState("FRIENDS"); 
  const [habits, setHabits] = useState([]);
  const { currentUserId } = useAppContext();

  useEffect(() => {
    if (isOpen) {
      fetchHabits();
    }
  }, [isOpen]);

  const fetchHabits = async () => {
    try {
      const data = await getAllHabits(currentUserId);
      setHabits(data);
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
        title: `${getActivityTitle(activityType, selectedHabit.title)}${note ? `\n${note}` : ''}`,
        visibility,
      };


      await createActivityApi(payload);
      onSubmit();
      onClose();
      setSelectedHabit(null);
      setNote("");
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
                  habits.find((habit) => habit.id === parseInt(e.target.value))
                )
              }
              className="form-input"
            >
              <option value="" disabled>
                Select a habit...
              </option>
              {habits.map((habit) => (
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

          <div className="form-group">
            <label className="form-label">Add a note (optional)</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className="form-textarea"
              placeholder="Share your thoughts..."
            />
          </div>

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
