import { createGlobalStyle } from "styled-components";
import styled from "styled-components";
//booklove-d393f
import { addMessageRoom } from "./utils/firestore";

function App() {
  return (
    <>
      <GlobalStyle />

      <button onClick={addMessageRoom}>按鈕</button>
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
