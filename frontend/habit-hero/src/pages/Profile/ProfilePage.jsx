import React, { useEffect, useState, useCallback } from "react";
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
import { getUserActivitiesApi, deleteActivityApi } from "../../api/activity";
import ActivityCard from "../../components/activity/ActivityCard";
import "./ProfilePage.css";

export default function ProfilePage() {
  const { user: authUser } = useAuth();
  const currentUserId = authUser?.userId;
  const { userId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const sourcePage = location.state?.from || null;

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



  const fetchUser = useCallback(async () => {
    try {
      let res;
      // If no viewedUserId yet (e.g. auth not loaded), skip
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
      fetchActivities()
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
      if (status === "friends") {
        return;
      }
      if (status === "pending_outgoing") {
        return;
      }

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
    <div className="profile-page">
      <div className="profile-nav">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>
      </div>

      <div className="profile-header">
        <div className="profile-avatar">
          <ImageWithFallback
            src={user?.profileImageUrl}
            fallbackSrc="../../public/avator.jpeg"
            alt={`${user?.username} avatar`}
            className="avatar-large"
          />
        </div>
        <h2 className="profile-username">{user?.username}</h2>
        <p className="profile-bio">{user?.userBio || "No bio available"}</p>

        <div className="profile-stats">
          <div className="stat">
            <span className="stat-number">{friendsOfViewed.length}</span>
            <span className="stat-label">Friends</span>
          </div>
        </div>
      </div>

      <div className="profile-actions">
        {isOwn ? (
          <>
            <button className="btn btn-primary" onClick={() => navigate(`/profile/${viewedUserId}/friends`)}>
              Friend List ({friendsOfViewed.length})
            </button>
            <button className="btn btn-secondary" onClick={() => setShowEditModal(true)}>
              Edit Profile
            </button>
          </>
        ) : (
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


      {/* Activities Section */}
      <div className="profile-activities">
        <h3>Activities</h3>
        {isOwn ? (
          // Current user sees all their activities
          activities.length === 0 ? (
            <p>No activities yet.</p>
          ) : (
            <div className="activities-list">
              {activities.map((activity) => (
                <ActivityCard
                  key={activity.id}
                  activity={activity}
                  onLikeToggle={() => {}}
                  onCommentClick={() => {}}
                  onProfileClick={(userId) => navigate(`/profile/${userId}`)}
                  onDelete={handleDeleteActivity}
                />
              ))}
            </div>
          )
        ) : (
          // Other users - filter by visibility
          (() => {
            const visibleActivities = activities.filter(activity => {
              if (activity.visibility === 'PUBLIC') return true;
              if (activity.visibility === 'FRIENDS' && status === 'friends') return true;
              return false;
            });

            return visibleActivities.length === 0 ? (
              <p>{status === 'friends' ? 'No activities to show.' : 'This account is private.'}</p>
            ) : (
              <div className="activities-list">
                {visibleActivities.map((activity) => (
                  <ActivityCard
                    key={activity.id}
                    activity={activity}
                    onLikeToggle={() => {}}
                    onCommentClick={() => {}}
                    onProfileClick={(userId) => navigate(`/profile/${userId}`)}
                  />
                ))}
              </div>
            );
          })()
        )}
      </div>
    </div>
  );
}