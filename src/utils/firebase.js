import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDen2Hgkf-7u-rgYrcMPpWO78jm4L5rOWc",
  authDomain: "booklove-d393f.firebaseapp.com",
  projectId: "booklove-d393f",
  storageBucket: "booklove-d393f.appspot.com",
  messagingSenderId: "107181938796",
  appId: "1:107181938796:web:4853099e40c27769ffe049",
  measurementId: "G-SS4WL1F6HY",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
export { app, auth };
