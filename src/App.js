import { createGlobalStyle } from "styled-components";
import styled from "styled-components";

import "./App.css";

function App() {
  return (
    <>
      <GlobalStyle />
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
