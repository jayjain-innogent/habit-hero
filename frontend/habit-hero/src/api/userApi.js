import axios from "axios";
import { GET_USER, UPDATE_USER } from "./endpoints";

const BASE_URL = "http://localhost:8080/";

export async function getUserApi({ userId }) {
  return axios.get(`${BASE_URL}${GET_USER}/${userId}`);
}

export const updateUserApi = (userId, data) => {
  return axios.put(`${BASE_URL}${UPDATE_USER}/${userId}`, data);
};

export async function searchUsersApi({ query }) {
  return axios.get(`${BASE_URL}users/search`, { params: { query } });
}
