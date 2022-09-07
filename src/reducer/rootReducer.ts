import { combineReducers } from "redux";
import userReducer from "./userReducer";
import currentBookReducer from "./currentBookReducer";
import currentLibraryReducer from "./currentLibraryReducer";

export const actionType = {
  USER: { SETUSER: "setUser" },
  BOOK: { SETBOOKDATA: "setBookdata" },
  LIBRARY: { SETLIBRARY: "setLibrary" },
};

const rootReducer = combineReducers({
  userReducer,
  currentBookReducer,
  currentLibraryReducer,
});

export default rootReducer;
