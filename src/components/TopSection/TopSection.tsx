import styled from "styled-components";

function TopSection() {
  return (
    <>
      <Background />
      <InfoDiv>
        <InfoLeft>
          <Avatar />
          <Username>username</Username>
        </InfoLeft>
        <InfoRight>
          <InfoRightP>朋友</InfoRightP>
          <InfoRightP>訊息</InfoRightP>
        </InfoRight>
      </InfoDiv>
      <Center>
        <Split />
      </Center>
    </>
  );
}

export default TopSection;

const Background = styled.div`
  height: 200px;
  background: gray;
`;

const InfoDiv = styled.div`
  height: 130px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;
const InfoLeft = styled.div`
  display: flex;
  align-items: center;
  position: relative;
`;

const Avatar = styled.img`
  width: 130px;
  height: 130px;
  margin-right: 16px;

  border: 6px solid white;
  border-radius: 50%;
  z-index: 1;

  position: absolute;
  top: -80px;
  left: 20px;
  background: black;
`;

const Username = styled.p`
  font-size: 30px;
  position: absolute;
  top: -26px;
  left: 160px;
`;

const InfoRight = styled.div`
  display: flex;
  align-items: center;
`;

const InfoRightP = styled.p`
  font-size: 20px;
  margin-right: 30px;
  padding: 4px 20px;
  border: 1px solid black;
`;

const Split = styled.div`
  width: 80%;
  height: 40px;
  border-bottom: 2px solid black;
`;

const Center = styled.div`
  display: flex;
  justify-content: center;
`;
