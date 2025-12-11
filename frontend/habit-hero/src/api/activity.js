import axios from "axios";
import {
  CREATE_ACTIVITY,
  GET_FEED,
  LIKE_ACTIVITY,
  UNLIKE_ACTIVITY,
  ADD_COMMENT,
  GET_COMMENTS,
} from "./endpoints";

const BASE_URL = "http://localhost:8080/";

// CREATE
export function createActivityApi(payload) {
  return axios.post(`${BASE_URL}${CREATE_ACTIVITY}`, payload);
}

// GET FEED
export function getFeedApi({ userId, page = 0, size = 20 }) {
  return axios.get(`${BASE_URL}${GET_FEED}`, { params: { userId, page, size } });
}

// LIKE (note: route is /activity/{id}/like)
export function likeActivityApi({ activityId, userId }) {
  return axios.post(
    `${BASE_URL}${LIKE_ACTIVITY}/${activityId}/like`,
    null,
    { params: { userId } }
  );
}

// UNLIKE (route is /activity/{id}/unlike)
export function unlikeActivityApi({ activityId, userId }) {
  return axios.post(
    `${BASE_URL}${UNLIKE_ACTIVITY}/${activityId}/unlike`,
    null,
    { params: { userId } }
  );
}

// ADD COMMENT
export function addCommentApi({ activityId, userId, text }) {
  return axios.post(`${BASE_URL}${ADD_COMMENT}`, {
    activityId,
    authorUserId: userId,
    text,
  });
}

// GET COMMENTS (route is /activity/{id}/comments)
export function getCommentsApi({ activityId }) {
  return axios.get(`${BASE_URL}${GET_COMMENTS}/${activityId}/comments`);
}