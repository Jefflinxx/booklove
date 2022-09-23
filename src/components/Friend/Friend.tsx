import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { actionType } from "../../reducer/rootReducer";
import styled from "styled-components";
import { getUserInfo } from "../../utils/firestore";
import { User } from "../../reducer/userReducer";
import ReactLoading from "react-loading";

import back from "../Header/back.svg";

type FriendProps = {
  friendActive: boolean;
  setFriendActive: (value: boolean) => void;
  friendLoading: boolean;
  setFriendLoading: (value: boolean) => void;
};

const Friend: React.FC<FriendProps> = ({
  friendActive,
  setFriendActive,
  friendLoading,
  setFriendLoading,
}) => {
  const Location = useLocation();
  const navigator = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state: { userReducer: User }) => state.userReducer);
  const [followList, setFollowList] = useState<
    { uid: string; avatar: string; uname: string }[]
  >([]);
  const localPath = Location.pathname.split("/")[1];
  useEffect(() => {
    const f = async () => {
      const a: User | null = await getUserInfo(user.uid);

      if (a?.followList) {
        setFollowList(a.followList);
      }
      setFriendLoading(false);
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
        {friendLoading && (
          <Loading>
            <ReactLoading type="cylon" color="black" width={50} />
          </Loading>
        )}
        {followList.map((i) => {
          return (
            <FriendDiv
              key={i.uid}
              onClick={async () => {
                // const a = await getUserInfo(i.uid);
                // dispatch({
                //   type: actionType.DISPLAYUSER.SETDISPLAYUSER,
                //   value: a,
                // });
                if (!localPath) {
                  dispatch({
                    type: actionType.TOPSDISPLAY.SETTOPSDISPLAY,
                    value: {
                      avatar: "",
                      uname: "",
                      background: "",
                    },
                  });
                }

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
  position: relative;
`;

const Loading = styled.div`
  position: absolute;
  top: 0px;
  left: 0px;
  width: 100%;
  height: 100%;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
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
