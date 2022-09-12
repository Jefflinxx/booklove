import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import avatar from "./avatar.svg";
import { User } from "../../reducer/userReducer";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { getUserInfo, updateFollowList } from "../../utils/firestore";
import { actionType } from "../../reducer/rootReducer";

function TopSection() {
  const Location = useLocation();
  const dispatch = useDispatch();
  const user = useSelector((state: { userReducer: User }) => state.userReducer);
  const [followObj, setFollowObj] = useState<
    { uid: string; uname: string; avatar: string } | undefined
  >(undefined);
  const localPath = Location.pathname.split("/")[1];
  useEffect(() => {
    const getFollowObj = async () => {
      const a = await getUserInfo(localPath);
      console.log(a);
      if (a) {
        setFollowObj({ uid: a.uid, uname: a.uname, avatar: a.avatar });
      }
    };
    getFollowObj();
  }, []);
  return (
    <>
      <Background />
      <InfoDiv>
        <InfoLeft>
          <Avatar src={user?.avatar || avatar} />
          <Username>{user?.uname}</Username>
        </InfoLeft>
        <InfoRight>
          <InfoRightP
            $uid={user?.uid}
            localPath={localPath}
            onClick={() => {
              const a:
                | {
                    uid: string;
                    uname: string;
                    avatar: string;
                  }[]
                | undefined = user?.followList;
              if (a?.find((k) => k.uid === localPath)) {
                updateFollowList(
                  user.uid,
                  a.filter((j) => j.uid !== localPath)
                );
                dispatch({
                  type: actionType.USER.SETUSER,
                  value: {
                    ...user,
                    followList: a.filter((j) => j.uid !== localPath),
                  },
                });
              } else if (a && !a?.find((k) => k.uid === localPath)) {
                if (followObj) {
                  updateFollowList(user.uid, [...a, followObj]);
                  dispatch({
                    type: actionType.USER.SETUSER,
                    value: { ...user, followList: [...a, followObj] },
                  });
                }
              } else if (!a) {
                if (followObj) {
                  updateFollowList(user.uid, [followObj]);
                  dispatch({
                    type: actionType.USER.SETUSER,
                    value: { ...user, followList: [followObj] },
                  });
                }
              }
            }}
          >
            {user?.followList?.find((k) => k.uid === localPath)
              ? "unfollow"
              : "follow"}
          </InfoRightP>
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

const InfoRightP = styled.p<{ localPath: string; $uid: string }>`
  font-size: 20px;
  margin-right: 30px;
  padding: 4px 20px;
  border: 1px solid black;
  display: ${(props) => {
    if (props.localPath === props.$uid || props.localPath === "") return "none";
    else return "block";
  }};
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
