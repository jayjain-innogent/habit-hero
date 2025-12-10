import React, { useEffect, useState } from "react";
import { useAppContext } from "../../routes/AppRoutes";
import {
  getFeedApi,
  likeActivityApi,
} from "../../api/activity";
import ActivityCard from "../../components/activity/ActivityCard";
import CreateActivityModal from "../../components/activity/CreateActivityModal";
import CommentsModal from "../../components/activity/CommentsModal";
import SegmentedButton from "../../components/common/SegmentedButton";
import "./ActivityFeed.css";

export default function ActivityFeed() {
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCommentsModal, setShowCommentsModal] = useState(false); 
  const [selectedActivityId, setSelectedActivityId] = useState(null);
  const [filter, setFilter] = useState("ALL");
  const { currentUserId } = useAppContext();

  useEffect(() => {
    loadFeed();
  }, [filter]);

  const loadFeed = async () => {
    setLoading(true);
    try {
      const response = await getFeedApi({ userId: currentUserId, filter, page: 0, size: 20 });
      setFeed(response.data || []);
    } catch (error) {
      console.error("Failed to load feed:", error);
      setFeed([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLikeToggle = async (activity) => {
    if (!activity || !activity.id) {
      return;
    }

    const updatedFeed = feed.map((item) =>
      item.id === activity.id
        ? {
            ...item,
            likedByCurrentUser: !item.likedByCurrentUser,
            likesCount: item.likedByCurrentUser 
              ? (item.likesCount || 1) - 1 
              : (item.likesCount || 0) + 1,
          }
        : item
    );
    setFeed(updatedFeed);

    try {
      await likeActivityApi({ activityId: activity.id, userId: currentUserId });
    } catch (error) {
      console.error("Failed to toggle like:", error);
      loadFeed();
    }
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
  };

  const handleCommentClick = (activityId) => {
    setSelectedActivityId(activityId);
    setShowCommentsModal(true);
  };

  return (
    <div className="activity-feed">
      <div className="activity-content">
        <div className="activity-header">
          <h1 className="activity-title">Activity Feed</h1>
          <p className="activity-subtitle">See what your friends are accomplishing</p>
        </div>
        <div className="filter-segment">
          <SegmentedButton
            options={[{ label: "ALL", value: "ALL" }, { label: "FRIENDS", value: "FRIENDS" }]}
            selected={filter}
            onChange={handleFilterChange}
          />
        </div>

        {loading ? (
          <div className="loading-state">Loading feed...</div>
        ) : feed.length === 0 ? (
          <div className="empty-state">No activity yet. Be the first to share!</div>
        ) : (
          <div className="activity-list">
            {feed.map((activity) => (
              <ActivityCard
                key={activity.activityId}
                activity={activity}
                onLikeToggle={handleLikeToggle}
                onCommentClick={() => handleCommentClick(activity.id)}
              />
            ))}
          </div>
        )}
      </div>

      <button onClick={() => setShowCreateModal(true)} className="fab">
        +
      </button>

      <CreateActivityModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={loadFeed}
      />

      <CommentsModal
        isOpen={showCommentsModal}
        onClose={() => setShowCommentsModal(false)}
        activityId={selectedActivityId}
      />
    </div>
  );
}
