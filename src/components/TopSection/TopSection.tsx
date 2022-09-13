import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import avatar from "./avatar.svg";
import { User } from "../../reducer/userReducer";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  getUserInfo,
  updateBackground,
  updateFollowList,
} from "../../utils/firestore";
import { actionType } from "../../reducer/rootReducer";
import { storage } from "../../utils/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { async } from "@firebase/util";

function TopSection() {
  const Location = useLocation();
  const dispatch = useDispatch();
  const user = useSelector((state: { userReducer: User }) => state.userReducer);
  const [followObj, setFollowObj] = useState<
    { uid: string; uname: string; avatar: string } | undefined
  >(undefined);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [confirmActive, setConfirmActive] = useState<boolean>(false);

  const localPath = Location.pathname.split("/")[1];

  const uploadImage = async () => {
    if (imageFile === null) return;
    const imageRef = ref(storage, `${user.uid}/${Date.now() + imageFile.name}`);
    await uploadBytes(imageRef, imageFile);
    const imageUrl = await getDownloadURL(imageRef);
    return imageUrl;
  };

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

  console.log(imageFile);
  return (
    <>
      <BgWrapper>
        <AvatarImgLabel
          confirmActive={confirmActive}
          htmlFor="bg"
          onClick={() => {
            setConfirmActive(true);
          }}
        >
          <EditImgBtn>圖</EditImgBtn>
        </AvatarImgLabel>

        <ConfirmBtn
          onClick={async () => {
            setConfirmActive(false);
            const imageUrl = await uploadImage();
            const a = { cover: imageUrl };
            console.log(a);
            if (imageUrl) {
              updateBackground(user.uid, imageUrl);
              dispatch({
                type: actionType.USER.SETUSER,
                value: { ...user, background: imageUrl },
              });
            }
          }}
          confirmActive={confirmActive}
        >
          確定
        </ConfirmBtn>
        <CancelBtn
          onClick={() => {
            setConfirmActive(false);
          }}
          confirmActive={confirmActive}
        >
          取消
        </CancelBtn>

        <BackgroundImgInput
          id="bg"
          type="file"
          accept="image/gif, image/jpeg, image/png"
          onChange={(e) => {
            if (e.target.files) {
              setImageFile(e.target.files[0]);
            }
          }}
        />
        <Background
          src={imageFile ? URL.createObjectURL(imageFile) : user?.background}
        />
      </BgWrapper>

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

const BgWrapper = styled.div`
  position: relative;
`;

const AvatarImgLabel = styled.label<{ confirmActive: boolean }>`
  position: absolute;
  bottom: 20px;
  right: 20px;
  border: 1px solid black;
  height: 50px;
  width: 50px;
  border-radius: 50%;

  align-items: center;
  justify-content: center;
  display: ${(props) => (props.confirmActive ? "none" : "flex")};
`;

const EditImgBtn = styled.div``;

const ConfirmBtn = styled.div<{ confirmActive: boolean }>`
  position: absolute;
  bottom: 20px;
  right: 20px;
  width: 50px;
  height: 50px;
  border: 1px solid black;
  display: flex;
  align-items: center;
  justify-content: center;
  display: ${(props) => (props.confirmActive ? "block" : "none")};
`;
const CancelBtn = styled.div<{ confirmActive: boolean }>`
  position: absolute;
  bottom: 20px;
  right: 100px;
  width: 50px;
  height: 50px;
  border: 1px solid black;
  display: flex;
  align-items: center;
  justify-content: center;
  display: ${(props) => (props.confirmActive ? "block" : "none")};
`;

const BackgroundImgInput = styled.input`
  opacity: 0;
  z-index: -1;
  display: none;
`;

const Background = styled.img`
  height: 400px;
  width: 100%;
  background: gray;
  object-fit: cover;
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
