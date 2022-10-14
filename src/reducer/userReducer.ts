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
  page: number;
  isFinishRead: boolean;
  place: string;
  lendTo: string;
  isLendTo: boolean;
  lendFrom: string;
  lendFromName: string;
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
  lendFromList?: BookInfo[];
  notification?: {
    type: string;
    avatar: string;
    uid: string;
    uname: string;
    isbn: string;
    bookname: string;
  }[];
  giveBackAlert: string[];
};

const userReducer = (
  state = null,
  action: { type: string; value: User | null | undefined }
) => {
  if (action.type === "setUser") return action.value;
  else return state;
};

export default userReducer;
