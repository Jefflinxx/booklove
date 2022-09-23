import { app } from "./firebase";

import {
  getFirestore,
  addDoc,
  collection,
  onSnapshot,
  serverTimestamp,
  setDoc,
  doc,
  query,
  where,
  getDocs,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { async } from "@firebase/util";
import { User } from "../reducer/userReducer";
import { CurrentBook } from "../reducer/currentBookReducer";

const db = getFirestore(app);

//collection

export const addMessageRoom = (Uid: [], from: string, message: string) => {
  console.log("add Message");
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
  //setDoc(content, subDoc);
  setDoc(
    doc(db, "messageRooms", messageRoom.id, "contents", content.id),
    ContentDocData
  );
};

export const addUser = (Uid: string, uname: string) => {
  console.log("add User");
  const users = collection(db, "users");
  const user = doc(users, Uid);
  const docData = {
    Uid: Uid || "",
    uname: uname || "",
    background: "",
    avatar: "",
    followList: [{ Uid: "2", name: "max", avatar: "a" }],
    category: ["文學", "漫畫", "美術"], //opt1
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
    wishList: [], //opt2
    Notification: [{ follower: "name" }],
  };
  setDoc(user, docData);
};

export const getMessageRoom = async () => {
  console.log("get");
  const docRef = doc(
    db,
    "messageRooms",
    "yeozOWhDD2NinUdjIjOr"
    // "contents",
    // "9D1kN6vXebfWky8If2ZK"
  );
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    console.log("Document data:", docSnap.data());
  } else {
    // doc.data() will be undefined in this case
    console.log("No such document!");
  }
};

export const initUser = async (uid: string, uname: string, avatar: string) => {
  console.log("initUser");
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
  console.log("editUser");
  const Ref = doc(db, "users", uid);
  await updateDoc(Ref, {
    uname: uname,
    avatar: avatar,
  });
};

export const updateBackground = async (uid: string, background: string) => {
  console.log("editBG");
  const Ref = doc(db, "users", uid);
  await updateDoc(Ref, {
    background: background,
  });
};

export const updateCategory = async (uid: string, category: string[]) => {
  console.log("editCategory");
  const Ref = doc(db, "users", uid);
  await updateDoc(Ref, {
    category: category,
  });
};

export const updateWishList = async (uid: string, wishList: CurrentBook[]) => {
  console.log("editWishList");
  const Ref = doc(db, "users", uid);
  await updateDoc(Ref, {
    wishList: wishList,
  });
};

export const updatelendFromList = async (
  uid: string,
  lendFromList: CurrentBook[]
) => {
  console.log("editlendFromList");

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
  console.log("editlendFromNotification");
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
  console.log("addSearchBookToUserLibrary");
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
  console.log("addSearchBookToUserWishList");
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
    const a = docSnap.data();

    return a as User;
  } else {
    return null;
  }
};

export const updateUserLibrary = async (
  uid: string,
  library: CurrentBook[] | object[]
) => {
  console.log("editlibrary");
  const Ref = doc(db, "users", uid);
  await updateDoc(Ref, {
    library: library,
  });
};

export const updateGiveBackAlert = async (
  uid: string,
  giveBackAlert: string[]
) => {
  console.log("editGiveBackAlert");
  const Ref = doc(db, "users", uid);
  await updateDoc(Ref, {
    giveBackAlert: giveBackAlert,
  });
};

export const searchFriend = async (uname: string) => {
  const q = query(collection(db, "users"), where("uname", "==", uname));
  const querySnapshot = await getDocs(q);
  let a: { uid: string; uname: string; avatar: string }[] = [];
  querySnapshot.forEach((doc) => {
    a = [
      ...a,
      { uid: doc.id, avatar: doc.data().avatar, uname: doc.data().uname },
    ];
  });
  if (a.length > 0) return a;
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
  const a: any = [];
  querySnapshot.forEach((doc) => {
    a.push(doc.data());
  });
  return a;
};
