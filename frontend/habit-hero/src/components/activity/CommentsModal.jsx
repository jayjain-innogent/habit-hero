import React, { useState, useEffect } from "react";
import { getCommentsApi, addCommentApi } from "../../api/activity";
import Avatar from "../common/Avatar";
import { X, Send } from "lucide-react";
import "./CommentsModal.css";

const CommentsModal = ({ isOpen, onClose, activityId, onCommentAdded , onProfileClick}) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    if (isOpen && activityId) {
      fetchComments();
    }
  }, [isOpen, activityId]);

  const fetchComments = async () => {
    try {
      const response = await getCommentsApi({ activityId });
      setComments(response.data || []);
    } catch (error) {
      console.error("Failed to fetch comments:", error);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      await addCommentApi({ activityId, userId: 1, text: newComment });
      setNewComment("");
      fetchComments();
      onCommentAdded?.(); 
    } catch (error) {
      console.error("Failed to add comment:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">Comments</h2>
          <button onClick={onClose} className="modal-close">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {comments.length === 0 ? (
            <p className="empty-state">No comments yet. Be the first to comment!</p>
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

        <div className="modal-footer">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="comment-input"
          />
          <button onClick={handleAddComment} className="btn-primary">
            <Send size={16} style={{ marginRight: '6px' }} />
            Post
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommentsModal;