import { useDispatch } from "react-redux";
import { onAuthStateChanged } from "firebase/auth";
import { createGlobalStyle } from "styled-components";
import styled from "styled-components";
import { auth } from "./utils/firebase";
import { getUserInfo } from "./utils/firestore";
import { actionType } from "./reducer/rootReducer";

import Footer from "./components/Footer/Footer";
import Header from "./components/Header/Header";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";

function App() {
  const dispatch = useDispatch();
  const navigator = useNavigate();
  const Location = useLocation();
  const localPath = Location.pathname.split("/")[1];
  useEffect(() => {
    onAuthStateChanged(auth, async (u) => {
      console.log("監聽登入變化");
      console.log(u);
      console.log(localPath);

      if (u) {
        const uid = u.uid;
        const user = await getUserInfo(uid);
        dispatch({
          type: actionType.USER.SETUSER,
          value: user || null,
        });
        if (localPath === "login") {
          navigator("../");
        }
      } else {
        navigator("../login");
      }
    });
  }, []);
  return (
    <>
      <GlobalStyle />

      <Header />
      <Outlet />
      <Footer />
      {/* <button onClick={addMessageRoom}>addMessageRoom按鈕</button>
      <button onClick={addUser}>addUser按鈕</button>
      <button onClick={getMessageRoom}>MessageRoom按鈕</button> */}
    </>
  );
}

export default App;

const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
    margin:0;
    font-family: 'Noto Sans TC', sans-serif;
    font-family: 'Poppins', sans-serif;
  }
  input{
    background:none;  	
    outline:none;  	
    border:none;
}
`;
