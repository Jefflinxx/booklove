const topSDisplayReducer = (
  state = {},
  action: {
    type: string;
    value: {
      avatar: string;
      uname: string;
      background: string | undefined;
    };
  }
) => {
  if (action.type === "setTopSDisplay") return action.value;
  else return state;
};

export default topSDisplayReducer;
