import { combineReducers } from "redux";

import userIdReducer from "./userIdReducer";

import userReducer from "./userReducer";
import currentBookReducer from "./currentBookReducer";
import currentLibraryReducer from "./currentLibraryReducer";
import displayUserReducer from "./displayUserReducer";
import displayLibraryReducer from "./displayLibraryReducer";
import topSDisplayReducer from "./topSDisplayReducer";
import notificationReducer from "./notificationReducer";
import giveBackAlertReducer from "./giveBackAlertReducer";

export const actionType = {
  USERID: { SETUSERID: "setUserId" },

  USER: { SETUSER: "setUser" },
  BOOK: { SETBOOKDATA: "setBookdata" },
  LIBRARY: { SETLIBRARY: "setLibrary" },

  DISPLAYUSER: { SETDISPLAYUSER: "setDisplayUser" },
  DISPLAYLIBRARY: { SETDISPLAYLIBRARY: "setDisplayLibrary" },

  TOPSDISPLAY: { SETTOPSDISPLAY: "setTopSDisplay" },
  NOTIFICATION: { SETNOTIFICATION: "setNotification" },
  GIVEBACK: { SETGIVEBACK: "setGiveBackAlert" },
};

const rootReducer = combineReducers({
  userIdReducer,
  userReducer,
  currentBookReducer,
  currentLibraryReducer,
  displayUserReducer,
  displayLibraryReducer,
  topSDisplayReducer,
  notificationReducer,
  giveBackAlertReducer,
});

export default rootReducer;
