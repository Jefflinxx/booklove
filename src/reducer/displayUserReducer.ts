import { User } from "./userReducer";

const displayUserReducer = (
  state = null,
  action: { type: string; value: User | null | undefined }
) => {
  if (action.type === "setDisplayUser") return action.value;
  else return state;
};

export default displayUserReducer;
