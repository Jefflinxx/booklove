import { app } from "./firebase";

import {
  getFirestore,
  collection,
  serverTimestamp,
  setDoc,
  doc,
  query,
  where,
  getDocs,
  getDoc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";

import { User } from "../reducer/userReducer";
import { CurrentBook } from "../reducer/currentBookReducer";

const db = getFirestore(app);

export const addMessageRoom = (Uid: [], from: string, message: string) => {
  const messageRooms = collection(db, "messageRooms");
  const contents = collection(db, "contents");
  const messageRoom = doc(messageRooms);
  const content = doc(contents);

  const ContentDocData = {
    Mid: content.id,
    from: from || "",
    timestamp: serverTimestamp(),
    message: message || "",
  };
  const docData = {
    Rid: messageRoom.id,
    Uid: Uid || "",
  };

  setDoc(messageRoom, docData);

  setDoc(
    doc(db, "messageRooms", messageRoom.id, "contents", content.id),
    ContentDocData
  );
};

export const addUser = (Uid: string, uname: string) => {
  const users = collection(db, "users");
  const user = doc(users, Uid);
  const docData = {
    Uid: Uid || "",
    uname: uname || "",
    background: "",
    avatar: "",
    followList: [{ Uid: "2", name: "max", avatar: "a" }],
    category: ["文學", "漫畫", "美術"],
    library: [
      {
        Bid: "1",
        ISBN: "1234",
        author: "ironman",
        bookname: "spiderman",
        publish: "batman",
        cover: "",
        category: [],
        totalChapter: 0,
        alreadyReadChapter: 0,
        place: "",
        lendTo: "",
        summary: "",
        uploadCover: [],
        isPublic: true,
      },
    ],
    wishList: [],
    Notification: [{ follower: "name" }],
  };
  setDoc(user, docData);
};

export const getMessageRoom = async () => {
  const docRef = doc(db, "messageRooms", "yeozOWhDD2NinUdjIjOr");
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    console.log("Document data:", docSnap.data());
  } else {
    console.log("No such document!");
  }
};

export const initUser = async (uid: string, uname: string, avatar: string) => {
  const users = collection(db, "users");
  const user = doc(users, uid);
  const docData = {
    uid: uid || "",
    uname: uname || "",
    avatar: avatar,
  };
  setDoc(user, docData);
};

export const updateUser = async (
  uid: string,
  uname: string,
  avatar: string
) => {
  const Ref = doc(db, "users", uid);
  await updateDoc(Ref, {
    uname: uname,
    avatar: avatar,
  });
};

export const updateBackground = async (uid: string, background: string) => {
  const Ref = doc(db, "users", uid);
  await updateDoc(Ref, {
    background: background,
  });
};

export const updateCategory = async (uid: string, category: string[]) => {
  const Ref = doc(db, "users", uid);
  await updateDoc(Ref, {
    category: category,
  });
};

export const updateWishList = async (uid: string, wishList: CurrentBook[]) => {
  const Ref = doc(db, "users", uid);
  await updateDoc(Ref, {
    wishList: wishList,
  });
};

export const updatelendFromList = async (
  uid: string,
  lendFromList: CurrentBook[]
) => {
  const Ref = doc(db, "users", uid);
  await updateDoc(Ref, {
    lendFromList: lendFromList,
  });
};

export const updateNotification = async (
  uid: string,
  notification: {
    type: string;
    avatar: string;
    uid: string;
    uname: string;
    isbn: string;
    bookname: string;
  }[]
) => {
  const Ref = doc(db, "users", uid);
  await updateDoc(Ref, {
    notification: notification,
  });
};

export const addSearchBookToUserLibrary = async (
  uid: string,
  isbn: string,
  bookname: string,
  author: string,
  publisher: string,
  cover: string
) => {
  const docRef = doc(db, "users", uid);
  await updateDoc(docRef, {
    library: arrayUnion({
      isbn: isbn,
      bookname: bookname,
      author: author,
      publisher: publisher,
      cover: cover,
      isPublic: true,
      isLendTo: false,
      alreadyReadChapter: 0,
    }),
  });
};

export const addSearchBookToUserWishList = async (
  uid: string,
  isbn: string,
  bookname: string,
  author: string,
  publisher: string,
  cover: string
) => {
  const docRef = doc(db, "users", uid);
  await updateDoc(docRef, {
    wishList: arrayUnion({
      isbn: isbn,
      bookname: bookname,
      author: author,
      publisher: publisher,
      cover: cover,
      isPublic: true,
    }),
  });
};

export const getUserInfo = async (uid: string) => {
  const docRef = doc(db, "users", uid);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    const data = docSnap.data();
    return data as User;
  } else {
    return null;
  }
};

export const updateUserLibrary = async (
  uid: string,
  library: CurrentBook[] | object[]
) => {
  const Ref = doc(db, "users", uid);
  await updateDoc(Ref, {
    library: library,
  });
};

export const updateGiveBackAlert = async (
  uid: string,
  giveBackAlert: string[]
) => {
  const Ref = doc(db, "users", uid);
  await updateDoc(Ref, {
    giveBackAlert: giveBackAlert,
  });
};

export const searchFriend = async (uname: string) => {
  const q = query(collection(db, "users"), where("uname", "==", uname));
  const querySnapshot = await getDocs(q);
  let friendList: { uid: string; uname: string; avatar: string }[] = [];
  querySnapshot.forEach((doc) => {
    friendList = [
      ...friendList,
      { uid: doc.id, avatar: doc.data().avatar, uname: doc.data().uname },
    ];
  });
  if (friendList.length > 0) return friendList;
  else return null;
};

export const updateFollowList = async (
  uid: string,
  followArray: {
    uid: string;
    uname: string;
    avatar: string;
  }[]
) => {
  const Ref = doc(db, "users", uid);
  await updateDoc(Ref, {
    followList: followArray,
  });
};

export const getAllUserDoc = async () => {
  const querySnapshot = await getDocs(collection(db, "users"));
  const allUser: any = [];
  querySnapshot.forEach((doc) => {
    allUser.push(doc.data());
  });
  return allUser;
};
