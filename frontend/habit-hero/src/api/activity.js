import axios from "axios";
import {
  GET_FEED,
  ADD_COMMENT,
  GET_COMMENTS,
} from "./endpoints";

const BASE_URL = "http://localhost:8080/";

// CREATE
export function createActivityApi({ userId, habitId, activityType, title, visibility }) {
  return axios.post(`${BASE_URL}activity`, {
    userId,
    habitId,
    activityType,
    title,
    visibility,
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