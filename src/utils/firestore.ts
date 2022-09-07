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
    followList: [{ Uid: "2", name: "max" }],
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

export const initUser = async (Uid: string, uname: string) => {
  console.log("initUser");
  const users = collection(db, "users");
  const user = doc(users, Uid);
  const docData = {
    Uid: Uid || "",
    uname: uname || "",
  };
  setDoc(user, docData);
};

export const addSearchBookToUserLibrary = async (
  Uid: string,
  isbn: string,
  bookname: string,
  author: string,
  publisher: string,
  cover: string
) => {
  console.log("addSearchBookToUserLibrary");
  const docRef = doc(db, "users", Uid);
  await updateDoc(docRef, {
    library: arrayUnion({
      isbn: isbn,
      bookname: bookname,
      author: author,
      publisher: publisher,
      cover: cover,
      isPublic: true,
    }),
  });
};

export const getUserLibrary = async (Uid: string) => {
  const docRef = doc(db, "users", Uid);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const a = docSnap.data();
    console.log(a);
    return a;
  } else {
    console.log("No such document!");
  }
};

export const updateUserLibrary = async (
  Uid: string,
  library: CurrentBook[]
) => {
  const Ref = doc(db, "users", Uid);
  await updateDoc(Ref, {
    library: library,
  });
};
