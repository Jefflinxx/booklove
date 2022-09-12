const initialState = {
  counter: 0,
  showCounter: true,
};

type BookInfo = {
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
