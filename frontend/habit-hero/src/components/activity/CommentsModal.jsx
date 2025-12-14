import React, { useState, useEffect } from "react";
import { getCommentsApi, addCommentApi } from "../../api/activity";
import { useAppContext } from "../../routes/AppRoutes";
import Avatar from "../common/Avatar";
import { X, Send } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import "./CommentsModal.css";

const CommentsModal = ({ isOpen, onClose, activityId, onCommentAdded, onProfileClick }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const { currentUserId } = useAppContext();
  const { user: currentUser } = useAuth(); // Add this line

  useEffect(() => {
    if (isOpen && activityId) {
      fetchComments();
    }
  }, [isOpen, activityId]);

  const fetchComments = async () => {
    try {
      const response = await getCommentsApi({ activityId });
      // Sort comments by createdAt descending (newest first)
      const sortedComments = (response.data || []).sort((a, b) =>
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      setComments(sortedComments);
    } catch (error) {
      console.error("Failed to fetch comments:", error);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      await addCommentApi({ activityId, userId: currentUserId, text: newComment });
      setNewComment("");
      fetchComments();
      onCommentAdded?.();
    } catch (error) {
      console.error("Failed to add comment:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="comments-modal-overlay">
      <div className="comments-modal-content">
        <div className="comments-modal-header">
          <h2 className="comments-modal-title">Comments</h2>
          <button onClick={onClose} className="comments-modal-close">
            <X size={18} />
          </button>
        </div>

        <div className="comments-modal-body">
          {comments.length === 0 ? (
            <p className="comments-empty-state">No comments yet. Be the first to comment!</p>
          ) : (
            <ul className="comments-list">
              {comments.map((comment) => (
                <li key={comment.commentId} className="comment-item">
                  <div
                    onClick={() => onProfileClick?.(comment.author?.userId)}
                    style={{ cursor: 'pointer' }}
                  >
                    <Avatar src={comment.author?.profileImage} alt={comment.author?.username} />
                  </div>
                  <div className="comment-content">
                    <span
                      className="comment-author"
                      onClick={() => onProfileClick?.(comment.author?.userId)}
                      style={{ cursor: 'pointer' }}
                    >
                      {comment.author?.username}
                    </span>
                    <p className="comment-text">{comment.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="comments-modal-footer">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="comments-input"
          />
          <button onClick={handleAddComment} className="comments-submit-btn">
            <Send size={16} style={{ marginRight: '6px' }} />
            Post
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommentsModal;