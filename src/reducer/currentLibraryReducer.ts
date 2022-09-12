import { CurrentBook } from "./currentBookReducer";

const currentLibraryReducer = (
  state = [] || null,
  action: { type: string; value: CurrentBook[] }
) => {
  if (action.type === "setLibrary") return action.value;
  else return state;
};

export default currentLibraryReducer;
