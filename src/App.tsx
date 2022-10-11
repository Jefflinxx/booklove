import { useDispatch } from "react-redux";
import { onAuthStateChanged } from "firebase/auth";
import { createGlobalStyle } from "styled-components";

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

      if (u) {
        dispatch({
          type: actionType.USERID.SETUSERID,
          value: u.uid,
        });
        const uid = u.uid;
        const user = await getUserInfo(uid);

        dispatch({
          type: actionType.USER.SETUSER,
          value: user || null,
        });

        if (localPath === "login") {
          navigator("../");
        } else if (localPath === "book" || localPath === "edit") {
          const pathname = Location.pathname.split("/")[2];
          const bookId = pathname.slice(-13);
          const userId = pathname.split(bookId)[0];
          getUserInfo(userId).then((v) => {
            if (v) {
              v.library.forEach((i) => {
                if (i.isbn === bookId) {
                  // console.log("進到book edit時dispatch資料 ");
                  dispatch({
                    type: actionType.BOOK.SETBOOKDATA,
                    value: i,
                  });
                }
              });
            }
          });
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
   
    user-select:none;
   
  }
  input{
    background:none;  	
    outline:none;  	
    border:none;
    user-select: auto;
}
body{
  background:#f6d4ba;
}
`;
