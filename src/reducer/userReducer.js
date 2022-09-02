const initialState = {
  counter: 0,
  showCounter: true,
};

const userReducer = (state = null, action) => {
  if (action.type === "setUser") return action.value;
  else return state;
};

export default userReducer;
