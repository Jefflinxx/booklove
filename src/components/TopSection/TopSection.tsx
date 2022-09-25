import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import avatar from "./avatar.svg";
import camera from "./camera.svg";
import grayBack from "./grayBack.png";
import { User } from "../../reducer/userReducer";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  getUserInfo,
  updateBackground,
  updateFollowList,
} from "../../utils/firestore";
import { CurrentBook } from "../../reducer/currentBookReducer";
import { actionType } from "../../reducer/rootReducer";
import { storage } from "../../utils/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

function TopSection() {
  const Location = useLocation();
  const dispatch = useDispatch();
  const user = useSelector((state: { userReducer: User }) => state.userReducer);

  const [followObj, setFollowObj] = useState<
    | {
        uid: string;
        uname: string;
        avatar: string;
        background: string | undefined;
      }
    | undefined
  >(undefined);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [bSKT, setBSKT] = useState<boolean>(true);
  const [confirmActive, setConfirmActive] = useState<boolean>(false);
  const [libraryCount, setLibraryCount] = useState<number | null>(null);
  const library = useSelector(
    (state: { currentLibraryReducer: CurrentBook[] }) =>
      state.currentLibraryReducer
  );
  const topSDisplay = useSelector(
    (state: {
      topSDisplayReducer: {
        avatar: string;
        uname: string;
        background: string | undefined;
      };
    }) => state.topSDisplayReducer
  );

  const localPath = Location.pathname.split("/")[1];

  const uploadImage = async () => {
    if (imageFile === null) return;
    const imageRef = ref(storage, `${user.uid}/${Date.now() + imageFile.name}`);
    await uploadBytes(imageRef, imageFile);
    const imageUrl = await getDownloadURL(imageRef);
    return imageUrl;
  };

  useEffect(() => {
    if (user && !localPath) {
      dispatch({
        type: actionType.TOPSDISPLAY.SETTOPSDISPLAY,
        value: {
          avatar: user.avatar,
          uname: user.uname,
          background: user.background || grayBack,
        },
      });
      setLibraryCount(library.length);
    }

    const getFollowObj = async () => {
      if (localPath) {
        const a = await getUserInfo(localPath);

        if (a) {
          dispatch({
            type: actionType.TOPSDISPLAY.SETTOPSDISPLAY,
            value: {
              avatar: a.avatar,
              uname: a.uname,
              background: a.background || grayBack,
            },
          });
          setLibraryCount(a.library.length);
          setFollowObj({
            uid: a.uid,
            uname: a.uname,
            avatar: a.avatar,
            background: a.background || grayBack,
          });
        }
      }
    };
    getFollowObj();
  }, [user, localPath]);

  return (
    <WholeWrapper>
      <CenterWrapper>
        <BgWrapper>
          {!localPath && (
            <AvatarImgLabel
              confirmActive={confirmActive}
              htmlFor="bg"
              onClick={() => {
                setConfirmActive(true);
              }}
            >
              <EditImgBtn>
                <CameraIcon src={camera} />
              </EditImgBtn>
            </AvatarImgLabel>
          )}

          <ConfirmBtn
            onClick={async () => {
              setConfirmActive(false);
              const imageUrl = await uploadImage();
              const a = { cover: imageUrl };

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
            src={
              imageFile
                ? URL.createObjectURL(imageFile)
                : topSDisplay.background
            }
            onLoad={(e) => {
              e.stopPropagation();
              setBSKT(false);
            }}
          />
          {bSKT && <BackgroundSKT />}
        </BgWrapper>

        <InfoDiv>
          <InfoLeft>
            <Avatar src={topSDisplay.avatar} />
            <Username>{topSDisplay.uname}</Username>
            <LibraryCount>{`${libraryCount} books`}</LibraryCount>
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
                ? "取消追蹤"
                : "追蹤用戶"}
            </InfoRightP>
          </InfoRight>
        </InfoDiv>
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
  position: absolute;
  top: 56px;
  left: 0px;
  width: 100%;
  display: flex;
  justify-content: center;
`;

const CenterWrapper = styled.div`
  width: 1080px;
  border-radius: 6px;
  background: #fefadc;
`;

const BgWrapper = styled.div`
  position: relative;
  height: 400px;
  border-radius: 6px 6px 0px 0px;
  overflow: hidden;
`;

const AvatarImgLabel = styled.label<{ confirmActive: boolean }>`
  position: absolute;
  bottom: 20px;
  right: 36px;
  width: 50px;
  height: 50px;
  border-radius: 6px;

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
  top: 0px;
  left: 0px;
  width: 40px;
`;
const EditImgBtn = styled.div`
  font-size: 15px;
  align-items: center;
  justify-content: center;
  display: flex;

  width: 50px;
  height: 50px;
`;

const ConfirmBtn = styled.div<{ confirmActive: boolean }>`
  position: absolute;
  bottom: 20px;
  right: 36px;
  width: 68px;
  height: 30px;
  border-radius: 6px;
  background: #fefadc;
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
  background: #fefadc;
  object-fit: cover;
`;

const BackgroundSKT = styled.div`
  width: 100%;
  height: 100%;
  background: #fefadc;
`;

const InfoDiv = styled.div`
  height: 160px;
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
  width: 210px;
  height: 210px;
  margin-right: 16px;

  border: 6px solid #fefadc;
  border-radius: 50%;
  z-index: 1;
  background: #fefadc;

  position: absolute;
  top: -144px;
  left: 48px;
  user-select: none;
`;

const Username = styled.p`
  width: 228px;
  font-weight: 700;
  font-size: 36px;
  position: absolute;
  top: -60px;
  left: 286px;
  user-select: none;
  color: #3f612d;
`;

const LibraryCount = styled.p`
  width: 228px;

  font-size: 28px;
  position: absolute;
  top: -10px;
  left: 290px;
  user-select: none;
  color: #3f612d;
`;

const InfoRight = styled.div`
  display: flex;
  align-items: center;
`;

const InfoRightP = styled.p<{ localPath: string; $uid: string }>`
  width: 120px;
  height: 40px;
  font-size: 16px;

  align-items: center;
  justify-content: center;
  margin-right: 30px;
  padding: 4px 20px;
  background: #f6d4ba;
  border-radius: 6px;
  user-select: none;
  color: #3f612d;
  font-size: 20px;
  cursor: pointer;
  :hover {
    background: #e9c5a9;
  }
  display: ${(props) => {
    if (props.localPath === props.$uid || props.localPath === "") return "none";
    else return "flex";
  }};
`;

const Split = styled.div`
  width: 1186px;
  height: 24px;
  border-bottom: 1px solid rgb(206, 208, 212);
  margin-bottom: 60px;
`;
