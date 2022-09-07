import styled from "styled-components";

type AccountProps = {
  accountActive: boolean;
  setAccountActive: (value: boolean) => void;
};

const Account: React.FC<AccountProps> = ({
  accountActive,
  setAccountActive,
}) => {
  return (
    <Wrapper $active={accountActive}>
      Account:
      <div
        onClick={() => {
          setAccountActive(false);
        }}
      >
        返回
      </div>
    </Wrapper>
  );
};

export default Account;

const Wrapper = styled.div<{ $active: boolean }>`
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
