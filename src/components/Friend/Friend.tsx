import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { actionType } from "../../reducer/rootReducer";
import styled from "styled-components";
import { getUserInfo } from "../../utils/firestore";
import { User } from "../../reducer/userReducer";

import back from "../Header/back.svg";

type FriendProps = {
  friendActive: boolean;
  setFriendActive: (value: boolean) => void;
};

const Friend: React.FC<FriendProps> = ({ friendActive, setFriendActive }) => {
  const navigator = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state: { userReducer: User }) => state.userReducer);
  const [followList, setFollowList] = useState<
    { uid: string; avatar: string; uname: string }[]
  >([]);
  useEffect(() => {
    const f = async () => {
      const a: User | null = await getUserInfo(user.uid);
      console.log(a);
      if (a?.followList) {
        setFollowList(a.followList);
      }
    };
    if (user) {
      f();
    }
  }, [friendActive]);
  return (
    <Wrapper $active={friendActive}>
      <TitleWrapper>
        <BackIconDiv
          onClick={() => {
            setFriendActive(false);
          }}
        >
          <BackIcon src={back}></BackIcon>
        </BackIconDiv>

        <Title>追蹤名單</Title>
      </TitleWrapper>

      <FriendWrapper>
        {followList.map((i) => {
          return (
            <FriendDiv
              onClick={async () => {
                // const a = await getUserInfo(i.uid);
                // dispatch({
                //   type: actionType.DISPLAYUSER.SETDISPLAYUSER,
                //   value: a,
                // });
                navigator(`./${i.uid}`);
              }}
            >
              <FriendAvatar src={i.avatar} />
              <FriendName>{i.uname}</FriendName>
            </FriendDiv>
          );
        })}
        {!true && <FriendDiv>暫無結果</FriendDiv>}
      </FriendWrapper>
    </Wrapper>
  );
};

export default Friend;

const Wrapper = styled.div<{
  $active: boolean;
}>`
  z-index: 3;
  display: ${(props) => (props.$active ? "flex" : "none")};
  position: absolute;
  top: 0px;
  left: 0px;
  width: 360px;
  height: 450px;

  background: white;
  flex-direction: column;

  padding-bottom: 8px;
  border-radius: 6px;
  box-shadow: 0 12px 28px 0 rgba(0, 0, 0, 0.2), 0 2px 4px 0 rgba(0, 0, 0, 0.1);
`;

const TitleWrapper = styled.div`
  display: flex;
  align-items: center;
  height: 60px;
  padding: 16px 16px 8px;
`;
const BackIconDiv = styled.div`
  width: 38px;
  height: 38px;
  position: relative;
  border-radius: 50%;
  :hover {
    background: rgba(200, 200, 200, 0.4);
  }
`;

const BackIcon = styled.img`
  width: 10px;
  position: absolute;
  top: 10px;
  left: 12px;
`;
const Title = styled.div`
  font-size: 24px;
  font-weight: 500;
  padding-left: 10px;
`;

const FriendWrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: flex-start;

  overflow: overlay;
`;

const FriendDiv = styled.div`
  width: 344px;
  height: 52px;
  display: flex;
  align-items: center;
  padding: 0px 8px;
  border-radius: 6px;

  :hover {
    background: rgba(200, 200, 200, 0.4);
  }
`;

const FriendAvatar = styled.img`
  width: 38px;
  height: 38px;
  margin-right: 16px;
  background: #eff2f5;
  border: 2px solid white;
  border-radius: 50%;
`;
const FriendName = styled.p``;
