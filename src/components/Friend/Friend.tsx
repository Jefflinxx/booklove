import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { getUserInfo } from "../../utils/firestore";
import { User } from "../../reducer/userReducer";

type FriendProps = {
  friendActive: boolean;
  setFriendActive: (value: boolean) => void;
};

const Friend: React.FC<FriendProps> = ({ friendActive, setFriendActive }) => {
  const navigator = useNavigate();
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
      <div
        onClick={() => {
          setFriendActive(false);
        }}
      >
        返回
      </div>
      <FriendWrapper>
        {followList.map((i) => {
          return (
            <FriendDiv
              onClick={() => {
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
  right: 0px;
  width: 350px;
  height: 450px;
  border: 1px solid black;
  background: white;
`;

const FriendWrapper = styled.div`
  position: absolute;
  left: 60px;
  top: 47px;
  width: 240px;
  height: 100px;
  border: 1px solid black;

  display: flex;
  align-items: center;
  justify-content: flex-start;
`;

const FriendDiv = styled.div`
  display: flex;
  align-items: center;

  border: 1px solid black;
`;

const FriendAvatar = styled.img`
  width: 38px;
  height: 38px;
  margin-right: 16px;

  border: 1px solid black;
  border-radius: 50%;
`;
const FriendName = styled.p``;
