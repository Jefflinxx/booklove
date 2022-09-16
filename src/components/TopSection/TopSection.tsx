import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import avatar from "./avatar.svg";
import camera from "./camera.svg";
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
    <WholeWrapper>
      <CenterWrapper>
        <BgWrapper>
          <AvatarImgLabel
            confirmActive={confirmActive}
            htmlFor="bg"
            onClick={() => {
              setConfirmActive(true);
            }}
          >
            <EditImgBtn>
              <CameraIcon src={camera} />
              編輯封面相片
            </EditImgBtn>
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
            <Avatar src={user?.avatar} />
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
      </CenterWrapper>
    </WholeWrapper>
  );
}

export default TopSection;

const Center = styled.div`
  display: flex;
  justify-content: center;
`;

const WholeWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  background: white;
  border: 1px solid #e4e6eb;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
`;

const CenterWrapper = styled.div`
  width: 1250px;
`;

const BgWrapper = styled.div`
  position: relative;
  height: 460px;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid #e4e6eb;
`;

const AvatarImgLabel = styled.label<{ confirmActive: boolean }>`
  position: absolute;
  bottom: 20px;
  right: 36px;
  width: 136px;
  height: 36px;
  border-radius: 6px;
  background: white;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  display: ${(props) => (props.confirmActive ? "none" : "flex")};

  :hover {
    background: #e4e6eb;
  }
`;

const CameraIcon = styled.img`
  position: relative;
  top: 1px;
  left: -4px;
  width: 16px;
`;
const EditImgBtn = styled.div`
  font-size: 15px;
`;

const ConfirmBtn = styled.div<{ confirmActive: boolean }>`
  position: absolute;
  bottom: 20px;
  right: 36px;
  width: 68px;
  height: 30px;
  border-radius: 6px;
  background: white;
  font-size: 15px;

  align-items: center;
  justify-content: center;
  display: ${(props) => (props.confirmActive ? "flex" : "none")};
`;
const CancelBtn = styled.div<{ confirmActive: boolean }>`
  position: absolute;
  bottom: 20px;
  right: 124px;
  width: 68px;
  height: 30px;
  border-radius: 6px;
  background: white;
  font-size: 15px;

  align-items: center;
  justify-content: center;
  display: ${(props) => (props.confirmActive ? "flex" : "none")};
`;

const BackgroundImgInput = styled.input`
  opacity: 0;
  z-index: -1;
  display: none;
`;

const Background = styled.img`
  width: 100%;
  height: 100%;
  background: #eff2f5;
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
  width: 168px;
  height: 168px;
  margin-right: 16px;

  border: 6px solid white;
  border-radius: 50%;
  z-index: 1;
  background: #eff2f5;

  position: absolute;
  top: -100px;
  left: 40px;
  user-select: none;
`;

const Username = styled.p`
  width: 228px;
  font-weight: 700;
  font-size: 32px;
  position: absolute;
  top: -40px;
  left: 220px;
  user-select: none;
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
  width: 1186px;
  height: 24px;
  border-bottom: 1px solid rgb(206, 208, 212);
  margin-bottom: 60px;
`;
