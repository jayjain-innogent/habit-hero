import axios from "axios";
import {
  GET_FEED,
  ADD_COMMENT,
  GET_COMMENTS,
  GET_USER_ACTIVITIES,
} from "./endpoints";

const BASE_URL = "http://localhost:8080/";

// CREATE
export function createActivityApi({ userId, habitId, activityType, title, visibility, description, caption }) {
  return axios.post(`${BASE_URL}activity`, {
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
  return axios.get(`${BASE_URL}${GET_FEED}`, {
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
  return axios.post(`${BASE_URL}activity/${activityId}/like`, null, {
    params: {
      userId,
    },
  });
}

// ADD COMMENT
export function addCommentApi({ activityId, userId, text }) {
  return axios.post(`${BASE_URL}${ADD_COMMENT}`, {
    activityId,
    authorUserId: userId,
    text,
  });
}

// GET COMMENTS 
export function getCommentsApi({ activityId }) {
  return axios.get(`${BASE_URL}activity/comments/${activityId}`);
}

export function getUserActivitiesApi({ userId, page = 0, size = 10 }) {
  return axios.get(`${BASE_URL}${GET_USER_ACTIVITIES}/${userId}`, {
    params: { page, size }
  });
}

export function deleteActivityApi({ activityId, userId }) {
  return axios.delete(`${BASE_URL}activity/${activityId}`, {
    params: { userId }
  });
}