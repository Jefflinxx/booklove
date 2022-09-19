import { combineReducers } from "redux";
import userReducer from "./userReducer";
import currentBookReducer from "./currentBookReducer";
import currentLibraryReducer from "./currentLibraryReducer";
import displayUserReducer from "./displayUserReducer";
import displayLibraryReducer from "./displayLibraryReducer";

export const actionType = {
  USER: { SETUSER: "setUser" },
  BOOK: { SETBOOKDATA: "setBookdata" },
  LIBRARY: { SETLIBRARY: "setLibrary" },

  DISPLAYUSER: { SETDISPLAYUSER: "setDisplayUser" },
  DISPLAYLIBRARY: { SETDISPLAYLIBRARY: "setDisplayLibrary" },
};

const rootReducer = combineReducers({
  userReducer,
  currentBookReducer,
  currentLibraryReducer,
  displayUserReducer,
  displayLibraryReducer,
});

export default rootReducer;
