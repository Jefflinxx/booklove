const currentLibraryReducer = (state = [], action) => {
  if (action.type === "setLibrary") return action.value;
  else return state;
};

export default currentLibraryReducer;
