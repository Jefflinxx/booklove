const giveBackAlertReducer = (
  state = [],
  action: {
    type: string;
    value: string[];
  }
) => {
  if (action.type === "setGiveBackAlert") return action.value;
  else return state;
};

export default giveBackAlertReducer;
