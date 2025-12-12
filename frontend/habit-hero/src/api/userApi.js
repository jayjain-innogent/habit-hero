import axiosInstance from "./axiosConfig";
import { GET_USER, UPDATE_USER } from "./endpoints";

export async function getUserApi({ userId }) {
  return axiosInstance.get(`/${GET_USER}/${userId}`);
}

export async function getMyProfileApi() {
  return axiosInstance.get(`/users/me`);
}

export const updateUserProfileApi = (userId, formData) => {
  return axiosInstance.put(`/users/${userId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export async function searchUsersApi({ query }) {
  return axiosInstance.get(`/users/search`, { params: { query } });
}

export async function getAllUsersApi() {
  return axiosInstance.get(`/users`);
}