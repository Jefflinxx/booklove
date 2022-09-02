const initialState = {
  counter: 0,
  showCounter: true,
};

const currentBookIdReducer = (state = null, action) => {
  if (action.type === "setBookId") return action.value;
  else return state;
};

export default currentBookIdReducer;
