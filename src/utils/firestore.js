import app from "./firebase";

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

const db = getFirestore(app);

//collection
const messageRooms = collection(db, "messageRooms");
const contents = collection(db, "contents");
const users = collection(db, "users");

export const addMessageRoom = (Uid, from, message) => {
  console.log("add");
  const messageRoom = doc(messageRooms);
  const content = doc(contents);
  //const content = doc(db, "messageRooms", messageRoom.id, "contents");

  const subDoc = {
    Mid: content.id,
    from: "from",
    timestamp: serverTimestamp(),
    message: "message",
  };
  const docData = {
    Rid: messageRoom.id,
    Uid: ["1", "2"],
    // content: [
    //   { from: "from", timestamp: serverTimestamp(), message: "message" },
    //   { from: "from2", timestamp: serverTimestamp(), message: "message2" },
    // ],
  };

  setDoc(messageRoom, docData);
  //setDoc(content, subDoc);
  setDoc(
    doc(db, "messageRooms", messageRoom.id, "contents", content.id),
    subDoc
  );
};

//serverTimestamp()
//Timestamp.now()
