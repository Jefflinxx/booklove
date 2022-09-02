import styled from "styled-components";

function Friend({ friendActive, setFriendActive }) {
  return (
    <Wrapper $active={friendActive}>
      friend:
      <div
        onClick={() => {
          setFriendActive(false);
        }}
      >
        返回
      </div>
    </Wrapper>
  );
}

export default Friend;

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
