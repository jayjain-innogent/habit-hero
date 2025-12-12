import axiosInstance from "./axiosConfig";
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

// BASE_URL handled by axiosConfig

export function sendRequestApi({ senderId, receiverId }) {
  return axiosInstance.post(
    `/${SEND_REQUEST}?senderId=${senderId}&receiverId=${receiverId}`
  );
}

export function acceptRequestApi({ requestId }) {
  return axiosInstance.post(`/${ACCEPT_REQUEST}`, { requestId });
}


export function rejectRequestApi({ requestId }) {
  return axiosInstance.post(`/${REJECT_REQUEST}`, { requestId });
}

export function cancelRequestApi({ requestId }) {
  return axiosInstance.post(`/${CANCEL_REQUEST}`, { requestId });
}

export function getPendingApi({ userId }) {
  return axiosInstance.get(`/${GET_PENDING}`, {
    params: { userId }
  });
}

export function getFriendsListApi({ userId }) {
  return axiosInstance.get(`/${GET_FRIENDS}`, {
    params: { userId }
  });
}

export function removeFriendApi({ userId, friendId }) {
  return axiosInstance.delete(`/${REMOVE_FRIEND}`, {
    params: { userId, friendId }
  });
}

export function getSentRequestsApi({ userId }) {
  return axiosInstance.get(`/${GET_SENT_REQUESTS}`, {
    params: { userId }
  });
}   