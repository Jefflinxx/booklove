import store from "./store/store";
import { Provider } from "react-redux";

import { createGlobalStyle } from "styled-components";
import styled from "styled-components";

import Footer from "./components/Footer/Footer";
import Header from "./components/Header/Header";
import { Outlet } from "react-router-dom";

import { addMessageRoom, addUser, getMessageRoom } from "./utils/firestore";

console.log(store);
function App() {
  return (
    <>
      <Provider store={store}>
        <GlobalStyle />

        <Header />
        <Outlet />
        <Footer />
        {/* <button onClick={addMessageRoom}>addMessageRoom按鈕</button>
      <button onClick={addUser}>addUser按鈕</button>
      <button onClick={getMessageRoom}>MessageRoom按鈕</button> */}
      </Provider>
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
`;
