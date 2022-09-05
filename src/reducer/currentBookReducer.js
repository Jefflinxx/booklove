const initialState = {
  counter: 0,
  showCounter: true,
};

const currentBookReducer = (state = {}, action) => {
  if (action.type === "setBookdata") return action.value;
  else return state;
};

export default currentBookReducer;
