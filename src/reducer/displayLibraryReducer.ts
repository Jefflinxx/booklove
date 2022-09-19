import { CurrentBook } from "./currentBookReducer";

const displayLibraryReducer = (
  state = [] || null,
  action: { type: string; value: CurrentBook[] }
) => {
  if (action.type === "setDisplayLibrary") return action.value;
  else return state;
};

export default displayLibraryReducer;
