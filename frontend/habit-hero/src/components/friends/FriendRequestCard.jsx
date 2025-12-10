import React from "react";
import { useNavigate } from "react-router-dom";
import "./FriendRequestCard.css";
import ImageWithFallback from "../ImageWithFallback";

export default function FriendRequestCard({ request, onAccept, onReject, buttonLoading }) {
  const navigate = useNavigate();

  const handleProfileClick = () => {
   navigate(`/profile/${request.senderId}`, {
    state: { from: "friendRequests" }
    });
  }

  return (
    <div className="friend-request-card">
      <div className="user-info" onClick={handleProfileClick}>
        <ImageWithFallback
          src={request.senderProfileImage}
          fallbackSrc="../../public/avator.jpeg"
          alt={`${request.senderUsername} avatar`}
          className="user-avatar"
        />
        <div className="user-details">
          <h4 className="username">{request.senderUsername}</h4>
          <p className="user-bio">{request.senderBio || "No bio available"}</p>
        </div>
      </div>
      <div className="actions">
        <button 
          type="button"
          className="btn accept" 
          onClick={(e) => { e.stopPropagation(); onAccept(request.requestId); }}
          disabled={buttonLoading[`accept_${request.requestId}`]}
          >
            {buttonLoading[`accept_${request.requestId}`] ? "Accepting..." : "Accept"}
          </button>

        <button 
          type="button"
          className="btn reject"
          onClick={(e) => { e.stopPropagation(); onReject(request.requestId); }}
          disabled={buttonLoading[`reject_${request.requestId}`]}
        >
          {buttonLoading[`reject_${request.requestId}`] ? "Rejecting..." : "Reject"}
        </button>
      </div>
    </div>
  );
}
