const notificationReducer = (
  state = [],
  action: {
    type: string;
    value: {
      type: string;
      avatar: string;
      uid: string;
      uname: string;
      isbn: string;
      bookname: string;
    }[];
  }
) => {
  if (action.type === "setNotification") return action.value;
  else return state;
};

export default notificationReducer;
