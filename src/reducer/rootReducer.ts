import { combineReducers } from "redux";
import userReducer from "./userReducer";
import currentBookReducer from "./currentBookReducer";
import currentLibraryReducer from "./currentLibraryReducer";
import displayUserReducer from "./displayUserReducer";
import displayLibraryReducer from "./displayLibraryReducer";
import topSDisplayReducer from "./topSDisplayReducer";

export const actionType = {
  USER: { SETUSER: "setUser" },
  BOOK: { SETBOOKDATA: "setBookdata" },
  LIBRARY: { SETLIBRARY: "setLibrary" },

  DISPLAYUSER: { SETDISPLAYUSER: "setDisplayUser" },
  DISPLAYLIBRARY: { SETDISPLAYLIBRARY: "setDisplayLibrary" },

  TOPSDISPLAY: { SETTOPSDISPLAY: "setTopSDisplay" },
};

const rootReducer = combineReducers({
  userReducer,
  currentBookReducer,
  currentLibraryReducer,
  displayUserReducer,
  displayLibraryReducer,
  topSDisplayReducer,
});

export default rootReducer;
