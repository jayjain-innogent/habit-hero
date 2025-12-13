import React, { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getFriendsListApi, removeFriendApi } from "../../api/social";
import { getUserApi } from "../../api/userApi";
import ImageWithFallback from "../../components/ImageWithFallback";
import { FaUserFriends } from "react-icons/fa";
import "./FriendListPage.css";

import { useAuth } from "../../context/AuthContext";
// ... imports

const FriendListPage = forwardRef(({ userId: propUserId }, ref) => {
  const { user: authUser } = useAuth();
  const currentUserId = authUser?.userId;
  const { userId: paramUserId } = useParams();
  const navigate = useNavigate();
  const viewedUserId = propUserId || parseInt(paramUserId, 10);
  const isOwn = currentUserId === viewedUserId;
  const isStandalone = !propUserId;

  const [user, setUser] = useState(null);
  const [friends, setFriends] = useState([]);
  const [filteredFriends, setFilteredFriends] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [buttonLoading, setButtonLoading] = useState({});

  // Expose refreshFriends to parent component
  useImperativeHandle(ref, () => ({
    refreshFriends
  }));

  useEffect(() => {
    fetchUser();
    fetchFriends();
  }, [viewedUserId]);

  useEffect(() => {
    const filtered = friends.filter(friend =>
      friend.friendUsername.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredFriends(filtered);
  }, [friends, searchTerm]);

  async function fetchUser() {
    try {
      const res = await getUserApi({ userId: viewedUserId });
      setUser(res.data);
    } catch (err) {
      console.error(err);
    }
  }

  async function fetchFriends() {
    try {
      setLoading(true);
      const res = await getFriendsListApi({ userId: viewedUserId });
      setFriends(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function refreshFriends() {
    try {
      const res = await getFriendsListApi({ userId: viewedUserId });
      setFriends(res.data || []);
    } catch (err) {
      console.error(err);
    }
  }

  const handleRemoveFriend = async (friendId) => {
    try {
      setButtonLoading({ [`remove_${friendId}`]: true });
      await removeFriendApi({ userId: currentUserId, friendId });
      await refreshFriends();
    } catch (err) {
      console.error("Failed to remove friend:", err);
    } finally {
      setButtonLoading({});
    }
  };

  const handleFriendClick = (friendId) => {
    navigate(`/profile/${friendId}`, {
      state: { from: "friendsList" }
    });
  };

  const handleBack = () => {
    navigate(`/profile/${viewedUserId}`);
  };

  if (loading) return <div className="friend-list-page"><div className="loading">Loading friends...</div></div>;

  return (
    <div className="friend-list-page">
      <div className="search-container">
        <input
          type="text"
          placeholder="Search friends..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="friends-list">
        {filteredFriends.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><FaUserFriends /></div>
            <h3>{searchTerm ? "No friends found" : "No friends yet"}</h3>
            <p>{searchTerm ? "Try a different search term" : "Start connecting with people!"}</p>
          </div>
        ) : (
          filteredFriends.map(friend => (
            <div key={friend.friendId} className="friend-card">
              <div className="friend-info" onClick={() => handleFriendClick(friend.friendId)}>
                <ImageWithFallback
                  src={friend.friendProfileImage}
                  fallbackSrc="../../public/avator.jpeg"
                  alt={`${friend.friendUsername} avatar`}
                  className="friend-avatar"
                />
                <div className="friend-details">
                  <h4 className="friend-name">{friend.friendUsername}</h4>
                </div>
              </div>
              {isOwn && (
                <button
                  type="button"
                  className="remove-btn"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleRemoveFriend(friend.friendId);
                  }}
                  disabled={buttonLoading[`remove_${friend.friendId}`]}
                >
                  {buttonLoading[`remove_${friend.friendId}`] ? "Removing..." : "Remove"}
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
});

export default FriendListPage;
