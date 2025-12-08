import React, { useEffect, useState } from "react";
import { getPendingApi, acceptRequestApi, rejectRequestApi, sendRequestApi, getFriendsListApi, getSentRequestsApi } from "../../api/social";
import { searchUsersApi } from "../../api/userApi";
import FriendRequestCard from "../../components/friends/FriendRequestCard";
import { useNavigate } from "react-router-dom";
import ImageWithFallback from "../../components/ImageWithFallback";
import { FaUserFriends } from "react-icons/fa";
import "./FriendsPage.css";

function FriendsPage() {
  const userId = 1;
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [friends, setFriends] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState(null);
  const [buttonLoading, setButtonLoading] = useState({});
  const [activeTab, setActiveTab] = useState("requests");

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      searchUsers();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  async function fetchAllData() {
    try {
      setLoading(true);
      const [pendingRes, friendsRes, sentRes] = await Promise.all([  
        getPendingApi({ userId }),
        getFriendsListApi({ userId }),
        getSentRequestsApi({ userId })
      ]);
      
      setRequests(pendingRes.data || []);
      setFriends(friendsRes.data || []);
      setSentRequests(sentRes.data || []);  
    } catch (err) {
      console.error(err);
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  async function searchUsers() {
    try {
      setSearchLoading(true);
      const res = await searchUsersApi({ query: searchQuery });
      setSearchResults(res.data || []);
    } catch (err) {
      console.error("Search failed:", err);
      setSearchResults([]); 
    } finally {
      setSearchLoading(false);
    }
  }

  async function handleAccept(requestId) {
    try {
      setButtonLoading({ [`accept_${requestId}`]: true });
      await acceptRequestApi({ requestId });
      await fetchAllData();
    } catch (err) {
      console.error("Failed to accept request:", err);
    } finally {
      setButtonLoading({});
    }
  }

  async function handleReject(requestId) {
    try {
      setButtonLoading({ [`reject_${requestId}`]: true });
      await rejectRequestApi({ requestId });
      await fetchAllData();
    } catch (err) {
      console.error("Failed to reject request:", err);
    } finally {
      setButtonLoading({});
    }
  }

  async function handleAddFriend(receiverId) {
    try {
      setButtonLoading({ [`add_${receiverId}`]: true });
      await sendRequestApi({ senderId: userId, receiverId });
      await fetchAllData();
    } catch (err) {
      console.error("Failed to send friend request:", err);
    } finally {
      setButtonLoading({});
    }
  }

  const getRelationshipStatus = (user) => {
    const isFriend = friends.some(f => f.friendId === user.userId);
    const hasIncomingRequest = requests.some(r => r.senderId === user.userId);
    const hasSentRequest = sentRequests.some(r => r.senderId === user.userId); 
    
    if (isFriend) return "friends";
    if (hasIncomingRequest) return "incoming";
    if (hasSentRequest) return "sent";
    return "none";
  };

  if (loading) return <div className="loading">Loading requests…</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="friends-page">
      <div className="page-header">
        <h2>Friends</h2>
        <p className="subtitle">Manage your friend requests and find new friends</p>
      </div>

      <div className="tab-navigation">
        <button 
          className={`tab ${activeTab === "requests" ? "active" : ""}`}
          onClick={() => setActiveTab("requests")}
        >
          Friend Requests ({requests.length})
        </button>
        <button 
          className={`tab ${activeTab === "search" ? "active" : ""}`}
          onClick={() => setActiveTab("search")}
        >
          Find Friends
        </button>
      </div>

      {activeTab === "requests" && (
        <div className="requests-section">
          {requests.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon"><FaUserFriends /></div>
              <h3>No pending requests</h3>
              <p>You're all caught up! No new friend requests at the moment.</p>
            </div>
          ) : (
            <div className="requests-list">
              {requests.map(req => (
                <FriendRequestCard
                  key={req.requestId}
                  request={req}
                  onAccept={handleAccept}
                  onReject={handleReject}
                  buttonLoading={buttonLoading}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "search" && (
        <div className="search-section">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search for users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          {searchLoading && <div className="loading">Searching...</div>}

          {searchQuery && !searchLoading && Array.isArray(searchResults) && (
            <div className="search-results">
              {searchResults.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">🔍</div>
                  <h3>No users found</h3>
                  <p>Try a different search term</p>
                </div>
              ) : (
                <div className="users-list">
                  {searchResults.map(user => {
                    const status = getRelationshipStatus(user);
                    
                    return (
                      <div key={user.userId} className="user-card">
                        <div 
                          className="user-info" 
                          onClick={() => navigate(`/profile/${user.userId}`)}
                        >
                          <ImageWithFallback
                            src={user.profileImageUrl}
                            fallbackSrc="../../public/avator.jpeg"
                            alt={`${user.username} avatar`}
                            className="user-avatar"
                          />
                          <div className="user-details">
                            <h4 className="username">{user.username}</h4>
                            <p className="user-bio">{user.userBio || "No bio available"}</p>
                          </div>
                        </div>
                        <div className="user-actions">
                          {status === "friends" && (
                            <button className="btn btn-secondary" disabled>
                              Friends
                            </button>
                          )}
                          {status === "incoming" && (
                            <button className="btn btn-success" disabled>
                              Request Received
                            </button>
                          )}
                          {status === "sent" && (
                            <button className="btn btn-warning" disabled>
                              Request Sent
                            </button>
                          )}
                          {status === "none" && (
                            <button
                              type="button"
                              className="btn btn-primary"
                              onClick={() => handleAddFriend(user.userId)}
                              disabled={buttonLoading[`add_${user.userId}`]}
                            >
                              {buttonLoading[`add_${user.userId}`] ? "Sending..." : "Add Friend"}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default FriendsPage;
