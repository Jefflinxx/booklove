import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: `${process.env.REACT_APP_FIREBASE_API_KEY}`,
  authDomain: "booklove-d393f.firebaseapp.com",
  projectId: "booklove-d393f",
  storageBucket: "booklove-d393f.appspot.com",
  messagingSenderId: "107181938796",
  appId: "1:107181938796:web:4853099e40c27769ffe049",
  measurementId: "G-SS4WL1F6HY",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const storage = getStorage(app);
export { app, auth, storage };
