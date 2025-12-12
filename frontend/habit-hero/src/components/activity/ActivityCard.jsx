import React, { useState } from "react";
import { useAppContext } from "../../routes/AppRoutes";
import { addCommentApi } from "../../api/activity";
import Avatar from "../common/Avatar";
import { Target, Flame, Medal, BarChart3, AlertTriangle, FileText, Heart, MessageCircle, Trash2, Zap } from "lucide-react";
import "./ActivityCard.css";

const ActivityCard = ({ activity, onLikeToggle, onCommentClick, onProfileClick, onDelete }) => {
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [commentText, setCommentText] = useState("");
  const { currentUserId } = useAppContext();

  const getActivityIcon = (type) => {
    const icons = {
      COMPLETION: <Target size={16} />,
      STREAK: <Flame size={16} />, 
      MILESTONE: <Medal size={16} />,
      SUMMARY: <BarChart3 size={16} />,
      MISSED: <AlertTriangle size={16} />,
    };
    return icons[type] || <FileText size={16} />;
  };

  const parseContent = (content) => {
    if (!content) return null;
    if (typeof content === "object") return content;
    try {
      return JSON.parse(content);
    } catch {
      return content;
    }
  };

  const parsed = parseContent(activity.content);

  function timeAgo(dateString) {
    const now = new Date();
    const date = new Date(dateString);
    const diff = now - date; 

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return `0 days ago`;
    if (minutes < 60) return `0 days ago`;
    if (hours < 24) return `0 days ago`;
    if (days === 1) return "one day";
    return `${days}d ago`;
}

  return (
    <div className="activity-card">
      <div className="card-header">
        <div 
          className="user-avatar" 
          onClick={() => onProfileClick?.(activity.userId)}
          style={{ cursor: 'pointer' }}
        >
          <Avatar 
            src={activity.profileImage} 
            alt={activity.username}
            style={{ width: '48px', height: '48px' }}
          />
        </div>
        
        <div className="user-info">
          <div className="user-details">
            <div className="user-content">
              <div className="user-name">
                <span 
                  onClick={() => onProfileClick?.(activity.userId)}
                  style={{ cursor: 'pointer' }}
                >
                  {activity.username || "Unknown User"}
                </span>
                
                <span className="activity-text" style={{ whiteSpace: 'pre-line' }}>
                  {activity.title}
                </span>
              </div>
              
              {/* Caption for non-SUMMARY activities */}
              {activity.activityType !== "SUMMARY" && activity.caption && (
                <div className="activity-caption" style={{ fontSize: '14px', marginTop: '4px', color: '#333' }}>
                  {activity.caption}
                </div>
              )}
              
              {/* Description for SUMMARY activities */}
              {activity.activityType === "SUMMARY" && activity.description && (
                <div className="activity-description" style={{ fontSize: '14px', marginTop: '4px', color: '#333' }}>
                  {activity.description}
                </div>
              )}
              
              <div className="activity-time">
                {new Date(activity.createdAt).toLocaleString()}
              </div>
            </div>

            {activity.activityType === "STREAK" && <div className="activity-time">
                {timeAgo(activity.createdAt)}
            </div>}
            
            <div className={`activity-icon ${activity.activityType.toLowerCase()}`}>
              {getActivityIcon(activity.activityType)}
            </div>
          </div>
        </div>

        {currentUserId === activity.userId && onDelete && (
          <button
            onClick={() => onDelete(activity.id)} 
            className="delete-btn"
            style={{
              background: 'none',
              border: 'none',
              color: '#dc3545',
              cursor: 'pointer',
              fontSize: '16px',
              padding: '4px'
            }}
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      {activity.activityType === "SUMMARY" && parsed && (
        <div className="rich-content">
          <div className="summary-card">
            <div className="summary-header">
              <h4 className="summary-title">
                Week {parsed.week || ""} Summary
              </h4>
              {parsed.trend && (
                <span className="summary-trend">
                  +{parsed.trend}% ↑
                </span>
              )}
            </div>
            
            <div className="summary-grid">
              <div className="summary-item">
                <div className="summary-label">Completion Rate</div>
                <div className="summary-value">
                  {parsed.completionRate || parsed.completion || "-"}%
                </div>
              </div>
              <div className="summary-item">
                <div className="summary-label">Top Habit</div>
                <div className="summary-habit">
                  {parsed.topHabit || parsed.habitName || "-"}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activity.activityType === "MISSED" && parsed && (
        <div className="rich-content">
          <div className="missed-card">
            <div className="missed-header">
              <AlertTriangle size={20} className="missed-icon" />
              <span className="missed-title">
                Streak interrupted but bouncing back!
              </span>
            </div>
            <p className="missed-message">
              Every setback is a setup for a comeback. You've got this! <Zap size={16} style={{ display: 'inline' }} />
            </p>
          </div>
        </div>
      )}

      <div className="card-actions">
        <div className="actions-row">
          <button
            onClick={() => onLikeToggle(activity)}
            className={`action-btn ${activity.likedByCurrentUser ? 'liked' : ''}`}
          >
            <Heart size={16} />
            {activity.likesCount || 0}
          </button>
          
          <button
            onClick={() => onCommentClick(activity.activityId)}
            className="action-btn comment-btn"
          >
            <MessageCircle size={16} style={{ marginRight: '4px' }} /> {activity.commentsCount || 0}
          </button>
        </div>
      </div>

      {showCommentInput && activity.recentComments && activity.recentComments.length > 0 && (
        <div className="comments-preview">
          {activity.recentComments.map((comment) => (
            <div key={comment.commentId} className="comment-item">
              <Avatar 
                src={comment.author?.profileImage} 
                alt={comment.author?.username}
                style={{ width: '32px', height: '32px' }}
              />
              <div className="comment-content">
                <div className="comment-text">
                  <span className="comment-author">
                    {comment.author?.username}
                  </span>
                  <span className="comment-message">
                    {comment.text}
                  </span>
                </div>
                <div className="comment-time">
                  {new Date(comment.createdAt).toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActivityCard;
