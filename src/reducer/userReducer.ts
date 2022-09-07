const initialState = {
  counter: 0,
  showCounter: true,
};

// 資料庫user結構
// type BookInfo = {
//   isbn: string;
//   author: string;
//   bookname: string;
//   publisher: string;
//   cover: string;
//   likes: number;
//   category: string[];
//   totalChapter: number;
//   alreadyReadChapter: number;
//   place: string;
//   lendTo: string;
//   summary: string;
//   uploadCover: string[];
//   isPublic: boolean;
// };

// export type User = {
//   Uid: string;
//   uname: string;
//   background: string;
//   avatar: string;
//   followList: { Uid: string; name: string }[];
//   category: string[];
//   library: BookInfo[];
//   wishList: BookInfo[];
//   Notification: { follower: string }[];
// };

export type User = {
  uid: string;
};

const userReducer = (
  state = null,
  action: { type: string; value: User | null }
) => {
  if (action.type === "setUser") return action.value;
  else return state;
};

export default userReducer;
