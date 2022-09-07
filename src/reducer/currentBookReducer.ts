const initialState = {
  counter: 0,
  showCounter: true,
};

export type CurrentBook = {
  isbn: string;
  author: string;
  bookname: string;
  publisher: string;
  cover: string;
  likes: number;
  category: string[];
  totalChapter: number;
  alreadyReadChapter: number;
  place: string;
  lendTo: string;
  summary: string;
  uploadCover: string[];
  isPublic: boolean;
};

const currentBookReducer = (
  state = {},
  action: { type: string; value: CurrentBook }
) => {
  if (action.type === "setBookdata") return action.value;
  else return state;
};

export default currentBookReducer;
