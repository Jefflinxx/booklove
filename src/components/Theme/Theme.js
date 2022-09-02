import styled from "styled-components";

function Theme({ themeActive, setThemeActive }) {
  return (
    <Wrapper $active={themeActive}>
      Theme:
      <div
        onClick={() => {
          setThemeActive(false);
        }}
      >
        返回
      </div>
    </Wrapper>
  );
}

export default Theme;

const Wrapper = styled.div`
  z-index: 3;
  display: ${(props) => (props.$active ? "block" : "none")};
  position: absolute;
  top: 0px;
  right: 0px;
  width: 350px;
  height: 450px;
  border: 1px solid black;
  background: white;
`;
