import { createGlobalStyle } from "styled-components";
import styled from "styled-components";

import Footer from "./components/Footer/Footer";
import Header from "./components/Header/Header";
import { Outlet } from "react-router-dom";

import { addMessageRoom, addUser, getMessageRoom } from "./utils/firestore";

function App() {
  return (
    <>
      <GlobalStyle />
      <Header />
      <Outlet />
      <Footer />
      <button onClick={addMessageRoom}>addMessageRoom按鈕</button>
      <button onClick={addUser}>addUser按鈕</button>
      <button onClick={getMessageRoom}>MessageRoom按鈕</button>
    </>
  );
}

export default App;

const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
    margin:0;
  }
`;
