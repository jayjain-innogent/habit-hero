import axios from "axios";
import { sendRequest, acceptRequest, rejectRequest, cancelRequest,
   getPending, getFriendsList, removeFriend } from "./endpoints";

const BASE_URL = "http://localhost:8080/";
export const sendRequestApi = (data) => {
  const data = axios.post(BASE_URL + { sendRequest } , {
    receiverId: data.receiverId
  } , {
    params: {
      senderId: data.senderId
    },
  });
};

export const acceptRequestApi = (data) => {
  const data = axios.post(BASE_URL + { acceptRequest } , {
    requestId: data.requestId
  });
};

export const rejectRequestApi = (data) => {
  const data = axios.post(BASE_URL + { rejectRequest } , {
    requestId: data.requestId
  });
};

export const cancelRequestApi = (data) => {
  const data = axios.post(BASE_URL + { cancelRequest } , {
    requestId: data.requestId
  });
};

export const getPendingApi = (data) => {
  const data = axios.get(BASE_URL + { getPending } , {
    params: {
      userId: data.userId
    },
  });
};

export const getFriendsListApi = (data) => {
  const data = axios.get(BASE_URL + { getFriendsList } , {
    params: {
      userId: data.userId
    },
  });
};

export const removeFriendApi = (data) => {
  const data = axios.delete(BASE_URL + { removeFriend } , {
    params: {
      userId: data.userId,
      friendId: data.friendId  
    },
  });
};