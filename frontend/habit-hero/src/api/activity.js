import axiosInstance from "./axiosConfig";
import {
  GET_FEED,
  ADD_COMMENT,
  GET_COMMENTS,
  GET_USER_ACTIVITIES,
} from "./endpoints";

// BASE_URL is handled in axiosConfig (http://localhost:8080)
// Endpoints in endpoints.js are relative paths like "activity/feed"
// So we just need to join them.

// CREATE
export function createActivityApi({ userId, habitId, activityType, title, visibility }) {
  return axiosInstance.post(`/activity`, {
    userId,
    habitId,
    activityType,
    title,
    visibility,
    description,
    caption,
  });
}

// GET FEED
export function getFeedApi({ userId, filter = "ALL", page = 0, size = 10 }) {
  return axiosInstance.get(`/${GET_FEED}`, {
    params: {
      userId,
      filter,
      page,
      size,
    },
  });
}

// LIKE/UNLIKE 
export function likeActivityApi({ activityId, userId }) {
  return axiosInstance.post(`/activity/${activityId}/like`, null, {
    params: {
      userId,
    },
  });
}

// ADD COMMENT
export function addCommentApi({ activityId, userId, text }) {
  return axiosInstance.post(`/${ADD_COMMENT}`, {
    activityId,
    authorUserId: userId,
    text,
  });
}

// GET COMMENTS 
export function getCommentsApi({ activityId }) {
  return axiosInstance.get(`/activity/comments/${activityId}`);
}

// GET USER ACTIVITIES
export function getUserActivitiesApi({ userId }) {
  return axiosInstance.get(`/${GET_USER_ACTIVITIES}/${userId}`);
}

// DELETE ACTIVITY
export function deleteActivityApi({ activityId, userId }) {
  return axiosInstance.delete(`/activity/${activityId}`, {
    params: { userId }
  });
}