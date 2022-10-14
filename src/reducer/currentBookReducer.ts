import { BookInfo } from "./userReducer";
export type CurrentBook = BookInfo;

const currentBookReducer = (
  state = {},
  action: { type: string; value: CurrentBook }
) => {
  if (action.type === "setBookdata") return action.value;
  else return state;
};

export default currentBookReducer;
