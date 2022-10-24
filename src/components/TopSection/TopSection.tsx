import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import camera from "../../assets/camera.png";
import { User } from "../../reducer/userReducer";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  getUserInfo,
  updateBackground,
  updateFollowList,
} from "../../utils/firestore";
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
  const [libraryCount, setLibraryCount] = useState<number | null>(0);
  const topSDisplay = useSelector(
    (state: {
      topSDisplayReducer: {
        avatar: string;
        uname: string;
        background: string | undefined;
      };
    }) => state.topSDisplayReducer
  );
  const grayBack =
    "https://firebasestorage.googleapis.com/v0/b/booklove-d393f.appspot.com/o/defaultBG.jpeg?alt=media&token=3a992fc9-e591-440a-838d-45155bfebffe";
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
      setLibraryCount(user.library?.length || 0);
    }

    const getFollowObj = async () => {
      if (localPath) {
        const userData = await getUserInfo(localPath);
        if (userData) {
          dispatch({
            type: actionType.TOPSDISPLAY.SETTOPSDISPLAY,
            value: {
              avatar: userData.avatar,
              uname: userData.uname,
              background: userData.background || grayBack,
            },
          });
          setLibraryCount(userData.library?.length || 0);
          setFollowObj({
            uid: userData.uid,
            uname: userData.uname,
            avatar: userData.avatar,
            background: userData.background || grayBack,
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
              if (imageUrl) {
                updateBackground(user.uid, imageUrl);
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
                if (
                  e.target.files[0].type === "image/jpeg" ||
                  e.target.files[0].type === "image/png" ||
                  e.target.files[0].type === "image/gif"
                ) {
                  setImageFile(e.target.files[0]);
                } else {
                  alert("格式不符");
                }
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
            {Number(libraryCount) === 0 || Number(libraryCount) === 1 ? (
              <LibraryCount>{`${libraryCount} book`}</LibraryCount>
            ) : (
              <LibraryCount>{`${libraryCount} books`}</LibraryCount>
            )}
          </InfoLeft>
          <InfoRight>
            <InfoRightP
              $uid={user?.uid}
              localPath={localPath}
              onClick={() => {
                const userFollowList:
                  | {
                      uid: string;
                      uname: string;
                      avatar: string;
                    }[]
                  | undefined = user?.followList;
                if (userFollowList?.find((k) => k.uid === localPath)) {
                  updateFollowList(
                    user.uid,
                    userFollowList.filter((j) => j.uid !== localPath)
                  );
                  dispatch({
                    type: actionType.USER.SETUSER,
                    value: {
                      ...user,
                      followList: userFollowList.filter(
                        (j) => j.uid !== localPath
                      ),
                    },
                  });
                } else if (
                  userFollowList &&
                  !userFollowList?.find((k) => k.uid === localPath)
                ) {
                  if (followObj) {
                    updateFollowList(user.uid, [...userFollowList, followObj]);
                    dispatch({
                      type: actionType.USER.SETUSER,
                      value: {
                        ...user,
                        followList: [...userFollowList, followObj],
                      },
                    });
                  }
                } else if (!userFollowList) {
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
  @media screen and (max-width: 830px) {
    border-radius: 0px;
  }
`;

const BgWrapper = styled.div`
  position: relative;
  height: 400px;
  border-radius: 6px 6px 0px 0px;
  overflow: hidden;
  @media screen and (max-width: 830px) {
    border-radius: 0px;
  }
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
    background: #fefadc;
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
  cursor: pointer;
  :hover {
    background: #f3eec8;
  }
  font-size: 15px;

  align-items: center;
  justify-content: center;
  display: ${(props) => (props.confirmActive ? "flex" : "none")};
  @media screen and (max-width: 666px) {
    bottom: 60px;
    right: 36px;
  }
  @media screen and (max-width: 480px) {
    right: 16px;
  }
`;
const CancelBtn = styled.div<{ confirmActive: boolean }>`
  position: absolute;
  bottom: 20px;
  right: 124px;
  width: 68px;
  height: 30px;
  border-radius: 6px;
  background: #fefadc;
  cursor: pointer;
  :hover {
    background: #f3eec8;
  }
  font-size: 15px;
  align-items: center;
  justify-content: center;
  display: ${(props) => (props.confirmActive ? "flex" : "none")};
  @media screen and (max-width: 666px) {
    bottom: 20px;
    right: 36px;
  }
  @media screen and (max-width: 480px) {
    right: 16px;
  }
`;

const BackgroundImgInput = styled.input`
  opacity: 0;
  z-index: -1;
  display: none;
`;

const Background = styled.img`
  width: 100%;
  height: 100%;
  background: #e9c5a9;
  object-fit: cover;
`;

const BackgroundSKT = styled.div`
  width: 100%;
  height: 100%;
  background: #e9c5a9;
`;

const InfoDiv = styled.div`
  height: 160px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  @media screen and (max-width: 830px) {
    justify-content: center;
    height: 182px;
  }
`;

const InfoLeft = styled.div`
  display: flex;
  align-items: center;
  position: relative;
  @media screen and (max-width: 830px) {
    justify-content: center;
  }
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
  @media screen and (max-width: 830px) {
    position: relative;
    left: 0px;
    margin-right: 0px;
  }
  @media screen and (max-width: 444px) {
    width: 160px;
    height: 160px;
    top: -100px;
  }
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
  @media screen and (max-width: 830px) {
    top: 60px;
    left: -10px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  @media screen and (max-width: 444px) {
    font-size: 24px;
    left: -36px;
  }
`;

const LibraryCount = styled.p`
  width: 228px;
  font-size: 28px;
  position: absolute;
  top: -10px;
  left: 290px;
  user-select: none;
  color: #3f612d;
  @media screen and (max-width: 830px) {
    top: 110px;
    left: -10px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  @media screen and (max-width: 444px) {
    font-size: 20px;
    left: -36px;
    top: 98px;
  }
`;

const InfoRight = styled.div`
  display: flex;
  align-items: center;
  @media screen and (max-width: 830px) {
  }
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
  @media screen and (max-width: 830px) {
    position: absolute;
    bottom: 0px;
    left: 0px;
    width: calc(100vw - 15px);
    border-radius: 0px;
    background: #fefadc;
    z-index: 2;
    :hover {
      background: #f3eec8;
    }
  }
`;
