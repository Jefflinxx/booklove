const initialState = {
  counter: 0,
  showCounter: true,
};

export type BookInfo = {
  isbn: string;
  author: string;
  bookname: string;
  publisher: string;
  cover: string;
  like: boolean;
  category: string[];
  totalChapter: number;
  alreadyReadChapter: number;
  isFinishRead: boolean;
  place: string;
  lendTo: string;
  isLendTo: boolean;
  summary: string;
  uploadCover: string[];
  isPublic: boolean;
};

export type User = {
  uid: string;
  uname: string;
  background?: string;
  avatar: string;
  followList?: { uid: string; uname: string; avatar: string }[];
  category?: string[];
  library: BookInfo[];
  wishList?: BookInfo[];
  Notification?: { follower: string }[];
};

const userReducer = (
  state = null,
  action: { type: string; value: User | null | undefined }
) => {
  if (action.type === "setUser") return action.value;
  else return state;
};

export default userReducer;
