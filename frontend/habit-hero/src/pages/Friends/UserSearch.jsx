import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { sendRequestApi, cancelRequestApi, removeFriendApi, acceptRequestApi, rejectRequestApi } from '../api/friendsApi';
import './UserSearch.css';

const UserSearch = ({ user }) => {
  const navigate = useNavigate();
  const { currentUser, friends, pendingRequests, sentRequests, refreshFriends, refreshRequests } = useApp();
  const [loading, setLoading] = useState(false);

  const isFriend = friends.some(f => f.id === user.id);
  const hasIncomingRequest = pendingRequests.some(r => r.senderId === user.id);
  const hasOutgoingRequest = sentRequests.some(r => r.receiverId === user.id);

  const handleAddFriend = async () => {
    try {
      setLoading(true);
      await sendRequestApi(currentUser.id, user.id);
      refreshRequests();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFriend = async () => {
    try {
      setLoading(true);
      await removeFriendApi(currentUser.id, user.id);
      refreshFriends();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    try {
      setLoading(true);
      const request = pendingRequests.find(r => r.senderId === user.id);
      await acceptRequestApi(request.id);
      refreshFriends();
      refreshRequests();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    try {
      setLoading(true);
      const request = pendingRequests.find(r => r.senderId === user.id);
      await rejectRequestApi(request.id);
      refreshRequests();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const renderActionButton = () => {
    if (loading) return <button className="btn loading">...</button>;

    if (isFriend) {
      return <button className="btn remove" onClick={handleRemoveFriend}>Remove Friend</button>;
    }

    if (hasIncomingRequest) {
      return (
        <div className="btn-group">
          <button className="btn accept" onClick={handleAccept}>Accept</button>
          <button className="btn reject" onClick={handleReject}>Reject</button>
        </div>
      );
    }

    if (hasOutgoingRequest) {
      return <button className="btn cancel">Request Sent</button>;
    }

    return <button className="btn add" onClick={handleAddFriend}>Add Friend</button>;
  };

  return (
    <div className="user-search-item">
      <div className="user-info" onClick={() => navigate(`/profile/${user.id}`)}>
        <img
          src={user.profilePic || '/default-avatar.png'}
          alt={user.username}
          className="profile-pic"
        />
        <div className="user-details">
          <div className="username">{user.username}</div>
          <div className="bio">{user.bio}</div>
        </div>
      </div>
      <div className="actions">
        {renderActionButton()}
      </div>
    </div>
  );
};

export default UserSearch;