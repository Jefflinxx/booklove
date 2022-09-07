import { CurrentBook } from "./currentBookReducer";

type Library = CurrentBook[];

const currentLibraryReducer = (
  state = [],
  action: { type: string; value: [] }
) => {
  if (action.type === "setLibrary") return action.value;
  else return state;
};

export default currentLibraryReducer;
