import axiosInstance from "./axiosConfig";
import {
  GET_FEED,
  ADD_COMMENT,
  GET_COMMENTS,
  GET_USER_ACTIVITIES,
} from "./endpoints";

// CREATE
export function createActivityApi({ userId, habitId, activityType, title, visibility, description, caption }) {
  return axiosInstance.post("/activity", {
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

export function getUserActivitiesApi({ userId, page = 0, size = 10 }) {
  return axiosInstance.get(`/${GET_USER_ACTIVITIES}/${userId}`, {
    params: { page, size }
  });
}

export function deleteActivityApi({ activityId, userId }) {
  return axiosInstance.delete(`/activity/${activityId}`, {
    params: { userId }
  });
}