//friends endpoints
export const SEND_REQUEST      = "friends/request";
export const ACCEPT_REQUEST    = "friends/accept";
export const REJECT_REQUEST    = "friends/reject";
export const CANCEL_REQUEST    = "friends/cancel";
export const GET_PENDING       = "friends/requests";
export const GET_FRIENDS       = "friends";            
export const REMOVE_FRIEND     = "friends/remove";

//activity endpoints 
export const CREATE_ACTIVITY = "activity/create";
export const GET_FEED = "activity/feed";
export const LIKE_ACTIVITY = "activity";    // used as /activity/{id}/like
export const UNLIKE_ACTIVITY = "activity";  // used as /activity/{id}/unlike
export const ADD_COMMENT = "activity/comment";
export const GET_COMMENTS = "activity";     // used as /activity/{id}/comments

//user endpoints
export const GET_USER = "users";
export const UPDATE_USER = "users";
export const GET_SENT_REQUESTS = "friends/requests/sent";