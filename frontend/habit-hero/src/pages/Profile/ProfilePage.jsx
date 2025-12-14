import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  getFriendsListApi,
  removeFriendApi,
  sendRequestApi,
  getPendingApi,
  acceptRequestApi,
  rejectRequestApi,
  cancelRequestApi,
  getSentRequestsApi
} from "../../api/social";
import { getUserApi, getMyProfileApi } from "../../api/userApi";
import { useAuth } from "../../context/AuthContext";
import ImageWithFallback from "../../components/ImageWithFallback";
import EditProfileModal from "../../components/modals/EditProfileModals";
import { getUserActivitiesApi, deleteActivityApi, likeActivityApi } from "../../api/activity";
import ActivityCard from "../../components/activity/ActivityCard";
import { fetchDashboardData } from "../../services/api";
import { Edit3, Calendar, Flame, Target, TrendingUp, Users, Activity, ArrowLeft } from "lucide-react";
import CommentsModal from "../../components/activity/CommentsModal";
import FriendListPage from './FriendListPage';
import "./ProfilePage.css";

export default function ProfilePage() {
  const { user: authUser } = useAuth();
  const currentUserId = authUser?.userId;
  const { userId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const sourcePage = location.state?.from || null;
  const friendListRef = useRef();

  const viewedUserId = userId ? parseInt(userId, 10) : currentUserId;
  const isOwn = currentUserId === viewedUserId;

  const [user, setUser] = useState(null);
  const [friendsOfViewed, setFriendsOfViewed] = useState([]);
  const [pendingToMe, setPendingToMe] = useState([]);
  const [sentByMe, setSentByMe] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [error, setError] = useState(null);
  const [justSentRequest, setJustSentRequest] = useState(null);

  const [status, setStatus] = useState("none");
  const [activities, setActivities] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [activeTab, setActiveTab] = useState('activity');

  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [selectedActivityId, setSelectedActivityId] = useState(null);

  const fetchUser = useCallback(async () => {
    try {
      let res;
      if (!viewedUserId) return;

      if (isOwn) {
        res = await getMyProfileApi();
      } else {
        res = await getUserApi({ userId: viewedUserId });
      }
      setUser(res.data);
    } catch (err) {
      console.error("fetchUser:", err);
      setError("Cannot load user profile");
    }
  }, [viewedUserId, isOwn]);

  const fetchActivities = useCallback(async () => {
    try {
      const res = await getUserActivitiesApi({ userId: viewedUserId });
      setActivities(res.data || []);
    } catch (err) {
      console.error("fetchActivities:", err);
    }
  }, [viewedUserId]);

  const fetchDashboard = useCallback(async () => {
    try {
      const data = await fetchDashboardData();
      setDashboardData(data);
    } catch (err) {
      console.error("fetchDashboard:", err);
    }
  }, []);

  const fetchFriendsOfViewed = useCallback(async () => {
    try {
      const res = await getFriendsListApi({ userId: viewedUserId });
      setFriendsOfViewed(res.data || []);
    } catch (err) {
      console.error("fetchFriendsOfViewed:", err);
    }
  }, [viewedUserId]);

  const fetchPendingToMe = useCallback(async () => {
    try {
      const res = await getPendingApi({ userId: currentUserId });
      setPendingToMe(res.data || []);
    } catch (err) {
      console.error("fetchPendingToMe:", err);
    }
  }, [currentUserId]);

  const fetchSentByMe = useCallback(async () => {
    try {
      const res = await getSentRequestsApi({ userId: currentUserId });
      setSentByMe(res.data || []);
    } catch (err) {
      console.error("fetchSentByMe:", err);
    }
  }, [currentUserId]);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([
      fetchUser(),
      fetchFriendsOfViewed(),
      fetchPendingToMe(),
      fetchSentByMe(),
      fetchActivities(),
      fetchDashboard()
    ]);
    setLoading(false);
  }, [fetchUser, fetchFriendsOfViewed, fetchPendingToMe, fetchSentByMe, fetchActivities]);

  const handleDeleteActivity = async (activityId) => {
    try {
      await deleteActivityApi({ activityId, userId: currentUserId });
      setActivities(prev => prev.filter(activity => activity.id !== activityId));
    } catch (err) {
      console.error("Delete activity error:", err);
    }
  };

const handleLikeToggle = async (activity) => {
  try {
    await likeActivityApi({ activityId: activity.id, userId: currentUserId });
    fetchActivities(); // Refresh to get updated data
  } catch (error) {
    console.error("Failed to toggle like:", error);
  }
};

const handleCommentClick = (activityId) => {
  setSelectedActivityId(activityId);
  setShowCommentsModal(true);
};



  const computeStatus = useCallback(() => {
    if (isOwn) {
      setStatus("self");
      return;
    }

    const isFriend = friendsOfViewed.some(f => f.friendId === currentUserId);
    const incoming = pendingToMe.find(r => r.senderId === viewedUserId);
    const outgoing = sentByMe.find(r => r.senderId === viewedUserId) || (justSentRequest && justSentRequest.receiverId === viewedUserId);

    if (isFriend) setStatus("friends");
    else if (incoming) setStatus("pending_incoming");
    else if (outgoing) setStatus("pending_outgoing");
    else setStatus("none");
  }, [friendsOfViewed, pendingToMe, sentByMe, viewedUserId, currentUserId, isOwn, justSentRequest]);

  useEffect(() => {
    refreshAll();
  }, [viewedUserId, refreshAll]);

  useEffect(() => {
    computeStatus();
  }, [computeStatus, friendsOfViewed, pendingToMe, sentByMe]);

  const handleAddFriend = async () => {
    try {
      if (status === "friends") return;
      if (status === "pending_outgoing") return;

      await sendRequestApi({ senderId: currentUserId, receiverId: viewedUserId });

      setJustSentRequest({
        requestId: Date.now(),
        receiverId: viewedUserId
      });

      await Promise.all([fetchSentByMe(), fetchPendingToMe(), fetchFriendsOfViewed()]);
      computeStatus();
    } catch (err) {
      console.error("Failed to send friend request:", err);
      setJustSentRequest(null);
      await Promise.all([fetchSentByMe(), fetchPendingToMe(), fetchFriendsOfViewed()]);
      computeStatus();
    }
  };

  const handleRemoveFriend = async (e, friendId) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    try {
      await removeFriendApi({ userId: currentUserId, friendId });
      setJustSentRequest(null);
      await Promise.all([fetchFriendsOfViewed(), fetchSentByMe(), fetchPendingToMe()]);

      // Refresh FriendListPage if it's currently active
      if (activeTab === 'friends' && friendListRef.current?.refreshFriends) {
        friendListRef.current.refreshFriends();
      }

      computeStatus();
    } catch (err) {
      console.error("Failed to remove friend:", err);
      setJustSentRequest(null);
      await Promise.all([fetchFriendsOfViewed(), fetchSentByMe(), fetchPendingToMe()]);
      computeStatus();
    }
  };


  const handleAccept = async (requestId) => {
    try {
      await acceptRequestApi({ requestId });
      await Promise.all([fetchFriendsOfViewed(), fetchPendingToMe(), fetchSentByMe()]);
      computeStatus();
    } catch (err) {
      console.error("Failed to accept request:", err);
      await Promise.all([fetchFriendsOfViewed(), fetchPendingToMe(), fetchSentByMe()]);
      computeStatus();
    }
  };

  const handleReject = async (requestId) => {
    try {
      await rejectRequestApi({ requestId });
      setJustSentRequest(null);
      await Promise.all([fetchPendingToMe(), fetchSentByMe(), fetchFriendsOfViewed()]);
      computeStatus();
    } catch (err) {
      console.error("Failed to reject request:", err);
      setJustSentRequest(null);
      await Promise.all([fetchPendingToMe(), fetchSentByMe(), fetchFriendsOfViewed()]);
      computeStatus();
    }
  };

  const handleCancelRequest = async (requestId) => {
    try {
      if (justSentRequest && requestId === justSentRequest.requestId) {
        setJustSentRequest(null);
        computeStatus();
        return;
      }

      await cancelRequestApi({ requestId });
      setJustSentRequest(null);
      await Promise.all([fetchSentByMe(), fetchPendingToMe(), fetchFriendsOfViewed()]);
      computeStatus();
    } catch (err) {
      console.error("Failed to cancel request:", err);
      setJustSentRequest(null);
      await Promise.all([fetchSentByMe(), fetchPendingToMe(), fetchFriendsOfViewed()]);
      computeStatus();
    }
  };

  const incomingRequest = pendingToMe.find(r => r.senderId === viewedUserId);
  const outgoingRequest = sentByMe.find(r => r.senderId === viewedUserId) || justSentRequest;

  if (loading) return <div className="profile-page"><div className="loading-spinner">Loading...</div></div>;
  if (error) return <div className="profile-page"><p className="error-message">{error}</p></div>;

  return (
    <div className="modern-profile-page">
      <div className="profile-container">
        {!isOwn && (
        <button onClick={() => navigate(-1)} className="back-btn">
          <ArrowLeft size={16} />
          Back
        </button>
      )}
        {/* Profile Header */}
        <div className="profile-header-card">
          <div className="profile-main-info">
            <div className="profile-avatar-section">
              <ImageWithFallback
                src={user?.profileImageUrl}
                fallbackSrc="../../public/avator.jpg"
                alt={`${user?.username} avatar`}
                className="modern-avatar"
              />
            </div>

            <div className="profile-details">
              <div className="profile-name-section">
                <h1 className="profile-name">{user?.username || 'User'}</h1>
                {isOwn && (
                  <button className="edit-profile-btn" onClick={() => setShowEditModal(true)}>
                    <Edit3 size={16} />
                    Edit Profile
                  </button>
                )}
              </div>

              <p className="profile-handle">@{user?.username?.toLowerCase() || 'user'}</p>
              <p className="profile-bio">{user?.userBio || 'Building better habits, one day at a time 🚀'}</p>

              <div className="profile-meta">
                <Calendar size={16} />
                <span>Joined {user?.createdAt ? (() => {
                  const date = new Date(user.createdAt);
                  return isNaN(date.getTime()) ? 'Recently' : date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                })() : 'Recently'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="profile-actions">
          {!isOwn && (
            <>
              {status === "none" && (
                <button type="button" className="btn btn-primary" onClick={handleAddFriend}>
                  Add Friend
                </button>
              )}

              {status === "pending_incoming" && incomingRequest && (
                <>
                  <button type="button" className="btn btn-success" onClick={() => handleAccept(incomingRequest.requestId)}>
                    Accept
                  </button>
                  <button type="button" className="btn btn-danger" onClick={() => handleReject(incomingRequest.requestId)}>
                    Reject
                  </button>
                </>
              )}

              {status === "pending_outgoing" && outgoingRequest && (
                <button type="button" className="btn btn-warning" onClick={() => handleCancelRequest(outgoingRequest.requestId)}>
                  Cancel Request
                </button>
              )}

              {status === "friends" && (
                <button type="button" className="btn btn-danger" onClick={(e) => handleRemoveFriend(e, viewedUserId)}>
                  Remove Friend
                </button>
              )}
            </>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="tab-navigation">
          <button
            className={`tab-btn ${activeTab === 'activity' ? 'active' : ''}`}
            onClick={() => setActiveTab('activity')}
          >
            {isOwn ? 'My Activity' : `${user?.username}'s Activity`}
          </button>
          <button
            className={`tab-btn ${activeTab === 'friends' ? 'active' : ''}`}
            onClick={() => setActiveTab('friends')}
          >
            Friends ({friendsOfViewed.length})
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'activity' && (
            <div className="activities-section">
              {isOwn ? (
                activities.length === 0 ? (
                  <div className="empty-state">
                    <Activity size={48} />
                    <p>No activities yet</p>
                    <span>Start sharing habits today!</span>
                  </div>
                ) : (
                  <div className="activities-list">
                    {activities.map((activity) => (
                      <ActivityCard
                        key={activity.id}
                        activity={activity}
                        onLikeToggle={handleLikeToggle}
                        onCommentClick={() => handleCommentClick(activity.id)}
                        onProfileClick={(userId) => navigate(`/profile/${userId}`)}
                        onDelete={handleDeleteActivity}
                      />
                    ))}
                  </div>
                )
              ) : (
                (() => {
                  const visibleActivities = activities.filter(activity => {
                    if (activity.visibility === 'PUBLIC') return true;
                    if (activity.visibility === 'FRIENDS' && status === 'friends') return true;
                    return false;
                  });

                  const hasPrivateActivities = activities.some(activity => activity.visibility === 'PRIVATE');

                  return visibleActivities.length === 0 ? (
                    <div className="empty-state">
                      <Activity size={48} />
                      <p>{hasPrivateActivities ? 'This account is private' : 'No activities to show'}</p>
                    </div>
                  ) : (
                    <div className="activities-list">
                      {visibleActivities.map((activity) => (
                        <ActivityCard
                          key={activity.id}
                          activity={activity}
                          onLikeToggle={handleLikeToggle} 
                          onCommentClick={() => handleCommentClick(activity.id)} 
                          onProfileClick={(userId) => navigate(`/profile/${userId}`)}
                        />
                      ))}
                    </div>
                  );
                })()
              )}
            </div>
          )}

          {activeTab === 'friends' && (
            <div className="friends-section">
              <FriendListPage ref={friendListRef} userId={viewedUserId} />
            </div>
          )}
        </div>
      </div>

      {showEditModal && (
        <EditProfileModal
          user={user}
          onClose={() => setShowEditModal(false)}
          onUpdate={(updatedUser) => {
            setUser(updatedUser);
            setShowEditModal(false);
          }}
        />
      )}

      <CommentsModal
        isOpen={showCommentsModal}
        onClose={() => setShowCommentsModal(false)}
        activityId={selectedActivityId}
        onCommentAdded={fetchActivities}  // This will refresh activities when comment is added
        onProfileClick={(userId) => navigate(`/profile/${userId}`)}
      />
    </div>
  );
}