import React from "react";
import { useNavigate } from "react-router-dom";
import { IoCheckmark, IoClose } from "react-icons/io5";
import "./FriendRequestCard.css";
import ImageWithFallback from "../ImageWithFallback";

/*************  ✨ Windsurf Command ⭐  *************/
/**
 * A component to display a friend request with accept and reject buttons.
 *
 * @param {object} request - The friend request object.
 * @param {function} onAccept - A function to call when the accept button is clicked.
 * @param {function} onReject - A function to call when the reject button is clicked.
 * @param {object} buttonLoading - An object containing the loading state of the buttons.
 */
/*******  eeca425a-da93-4cd0-a0de-f6658615efd9  *******/export default function FriendRequestCard({ request, onAccept, onReject, buttonLoading }) {
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
          className="btn-icon accept" 
          onClick={(e) => { e.stopPropagation(); onAccept(request.requestId); }}
          disabled={buttonLoading[`accept_${request.requestId}`]}
          >
            <IoCheckmark size={20} />
          </button>

        <button 
          type="button"
          className="btn-icon reject"
          onClick={(e) => { e.stopPropagation(); onReject(request.requestId); }}
          disabled={buttonLoading[`reject_${request.requestId}`]}
        >
          <IoClose size={20} />
        </button>
      </div>
    </div>
  );
}
