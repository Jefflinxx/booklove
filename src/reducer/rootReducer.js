import { combineReducers } from "redux";
import userReducer from "./userReducer";
import currentBookIdReducer from "./currentBookIdReducer";

export const actionType = {
  USER: { SETUSER: "setUser" },
  BOOK: { SETBOOKID: "setBookId" },
};

const rootReducer = combineReducers({
  userReducer,
  currentBookIdReducer,
});

export default rootReducer;
