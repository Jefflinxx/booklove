const userIdReducer = (
  state = null,
  action: { type: string; value: string | null | undefined }
) => {
  if (action.type === "setUserId") return action.value;
  else return state;
};

export default userIdReducer;
