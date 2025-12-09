import axios from "axios";
import {
  SEND_REQUEST,
  ACCEPT_REQUEST,
  REJECT_REQUEST,
  CANCEL_REQUEST,
  GET_PENDING,
  GET_FRIENDS,
  REMOVE_FRIEND,
  GET_SENT_REQUESTS
} from "./endpoints";

const BASE_URL = "http://localhost:8080/";

export function sendRequestApi({ senderId, receiverId }) {
  return axios.post(
    `${BASE_URL}${SEND_REQUEST}?senderId=${senderId}&receiverId=${receiverId}`
  );
}

export function acceptRequestApi({ requestId }) {
  return axios.post(`${BASE_URL}${ACCEPT_REQUEST}`, { requestId });
}


export function rejectRequestApi({ requestId }) {
  return axios.post(`${BASE_URL}${REJECT_REQUEST}`, { requestId });
}

export function cancelRequestApi({ requestId }) {
  return axios.post(`${BASE_URL}${CANCEL_REQUEST}`, { requestId });
}

export function getPendingApi({ userId }) {
  return axios.get(`${BASE_URL}${GET_PENDING}`, {
    params: { userId }
  });
}

export function getFriendsListApi({ userId }) {
  return axios.get(`${BASE_URL}${GET_FRIENDS}`, {
    params: { userId }
  });
}

export function removeFriendApi({ userId, friendId }) {
  return axios.delete(`${BASE_URL}${REMOVE_FRIEND}`, {
    params: { userId, friendId }
  });
}

export function getSentRequestsApi({ userId }) {
  return axios.get(`${BASE_URL}${GET_SENT_REQUESTS}`, {
    params: { userId }
  });
}