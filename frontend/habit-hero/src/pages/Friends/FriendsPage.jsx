import React, { useEffect, useState } from "react";
import { getPendingApi, acceptRequestApi, rejectRequestApi, sendRequestApi, getFriendsListApi, getSentRequestsApi } from "../../api/social";
import { searchUsersApi, getAllUsersApi } from "../../api/userApi";
import FriendRequestCard from "../../components/friends/FriendRequestCard";
import { useNavigate } from "react-router-dom";
import ImageWithFallback from "../../components/ImageWithFallback";
import { FaUserFriends } from "react-icons/fa";
import { Bell, UserPlus } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

import "./FriendsPage.css";

function FriendsPage() {
  const { user } = useAuth();
  const userId = user?.userId;
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [friends, setFriends] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState(null);
  const [buttonLoading, setButtonLoading] = useState({});

  const [activeTab, setActiveTab] = useState(() => {
  return localStorage.getItem('friendsActiveTab') || 'search';
  });

  useEffect(() => {
    if (userId) {
      fetchAllData();
    }
  }, [userId]);

  useEffect(() => {
    if (!loading) {
      fetchSuggestedUsers();
    }
  }, [loading, friends, requests, sentRequests]);

  // Add debounced search
useEffect(() => {
  const timeoutId = setTimeout(() => {
    if (searchQuery.trim()) {
      searchUsers();
    } else {
      setSearchResults([]);
    }
  }, 500); // Wait 500ms after user stops typing

  return () => clearTimeout(timeoutId);
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

  async function fetchSuggestedUsers() {
    try {
      const res = await getAllUsersApi();
      const allUsers = Array.isArray(res.data) ? res.data : [];
      
      console.log("All users:", allUsers.length);
      console.log("Friends:", friends);
      console.log("Requests:", requests);
      console.log("Sent requests:", sentRequests);
      console.log("Current userId:", userId);
      
      const suggested = allUsers.filter(user => {
        const isFriend = friends.some(f => f.friendId === user.userId);
        const hasIncomingRequest = requests.some(r => r.senderId === user.userId);
        const hasSentRequest = sentRequests.some(r => r.receiverId === user.userId);
        const isCurrentUser = user.userId === userId;
        
        console.log(`User ${user.username}:`, {
          isFriend,
          hasIncomingRequest,
          hasSentRequest,
          isCurrentUser,
          shouldInclude: !isFriend && !hasIncomingRequest && !hasSentRequest && !isCurrentUser
        });
        
        return !isFriend && !hasIncomingRequest && !hasSentRequest && !isCurrentUser;
      });
      
      console.log("Suggested users:", suggested);
      setSuggestedUsers(suggested.slice(0, 5));
    } catch (err) {
      console.error("Failed to fetch suggested users:", err);
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
      
      // Update state locally instead of refetching
      setRequests(prev => prev.filter(req => req.requestId !== requestId));
      
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
      
      // Update state locally instead of refetching
      setRequests(prev => prev.filter(req => req.requestId !== requestId));
      
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
      
      setSuggestedUsers(prev => prev.filter(user => user.userId !== receiverId));
      
    } catch (err) {
      console.error("Failed to send friend request:", err);
    } finally {
      setButtonLoading({});
    }
  }

  const getRelationshipStatus = (user) => {
    const isFriend = friends.some(f => f.friendId === user.userId);
    const hasIncomingRequest = requests.some(r => r.senderId === user.userId);
    const hasSentRequest = sentRequests.some(r => r.receiverId === user.userId);
    
    if (isFriend) return "friends";
    if (hasIncomingRequest) return "incoming";
    if (hasSentRequest) return "sent";
    return "none";
  };

  console.log("Render - activeTab:", activeTab, "suggestedUsers:", suggestedUsers.length, "searchQuery:", searchQuery);

  if (!userId) return <div className="loading">Loading user...</div>;
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
          onClick={() => {
                  setActiveTab("requests");
                  localStorage.setItem('friendsActiveTab', 'requests');
                }}
        >
          <Bell size={18} />
          Requests ({requests.length})
        </button>
        <button 
          className={`tab ${activeTab === "search" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("search");
            localStorage.setItem('friendsActiveTab', 'search');
          }}
        >
          <UserPlus size={18} />
          Discover
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

          {!searchQuery && (
            <div className="suggested-section">
              <h3>Suggested for you ({suggestedUsers.length})</h3>
              {suggestedUsers.length === 0 && <p>No suggestions available</p>}
              {suggestedUsers.length > 0 && (
                <div className="users-list">
                  {suggestedUsers.map(user => (
                    <div key={user.userId} className="user-card">
                      <div 
                        className="user-info" 
                        onClick={() => navigate(`/profile/${user.userId}`)}
                      >
                        <ImageWithFallback
                          src={user.profileImageUrl}
                          fallbackSrc="../../public/avator.jpg"
                          alt={`${user.username} avatar`}
                          className="user-avatar"
                        />
                        <div className="user-details">
                          <h4 className="username">{user.username}</h4>
                          <p className="user-bio">{user.userBio || "No bio available"}</p>
                        </div>
                      </div>
                      <div className="user-actions">
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={() => handleAddFriend(user.userId)}
                          disabled={buttonLoading[`add_${user.userId}`]}
                        >
                          <UserPlus size={16} />
                          {buttonLoading[`add_${user.userId}`] ? "Sending..." : "Add Friend"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {searchLoading && <div className="loading">Searching...</div>}

          {searchQuery && !searchLoading && Array.isArray(searchResults) && (
            <div className="search-results">
              {searchResults.filter(user => user.userId !== userId).length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">🔍</div>
                  <h3>No users found</h3>
                  <p>Try a different search term</p>
                </div>
              ) : (
                <div className="users-list">
                  {searchResults.filter(user => user.userId !== userId).map(user => {
                    const status = getRelationshipStatus(user);
                    
                    return (
                      <div key={user.userId} className="user-card">
                        <div 
                          className="user-info" 
                          onClick={() => navigate(`/profile/${user.userId}`)}
                        >
                          <ImageWithFallback
                            src={user.profileImageUrl}
                            fallbackSrc="../../public/avator.jpg"
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
                              <UserPlus size={16} />
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