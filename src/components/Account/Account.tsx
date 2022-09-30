import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { storage } from "../../utils/firebase";
import { getUserInfo, updateUser } from "../../utils/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { User } from "../../reducer/userReducer";
import { useSelector, useDispatch } from "react-redux";
import { actionType } from "../../reducer/rootReducer";
import back from "../Header/back.svg";
import edit from "./edit.svg";

type AccountProps = {
  accountActive: boolean;
  setAccountActive: (value: boolean) => void;
  isEdit: boolean;
  setIsEdit: (value: boolean) => void;
};

const Account: React.FC<AccountProps> = ({
  accountActive,
  setAccountActive,
  isEdit,
  setIsEdit,
}) => {
  const dispatch = useDispatch();
  const user = useSelector((state: { userReducer: User }) => state.userReducer);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [input, setInput] = useState<string>("");
  const [readCount, setReadCount] = useState<number>(0);
  const [writeCount, setWriteCount] = useState<number>(0);
  // const userNameRef = useRef<HTMLInputElement>(null);

  const uploadImage = async () => {
    if (imageFile === null) return;
    const imageRef = ref(storage, `${user.uid}/${Date.now() + imageFile.name}`);
    await uploadBytes(imageRef, imageFile);
    const imageUrl = await getDownloadURL(imageRef);
    return imageUrl;
  };

  useEffect(() => {
    if (user) {
      setInput(user.uname);
    }
  }, [user]);

  useEffect(() => {
    const getReadCount = async () => {
      let counter = 0;

      const a = await getUserInfo(user.uid);

      a?.library?.forEach((i) => {
        if (i.isFinishRead) {
          counter++;
        }
      });
      setReadCount(counter);
    };

    const getWriteCount = async () => {
      let counter = 0;
      const a = await getUserInfo(user.uid);

      a?.library?.forEach((i) => {
        if (i.summary) {
          counter += i.summary.length;
        }
      });

      setWriteCount(counter);
    };

    if (user?.uid) {
      getReadCount();
      getWriteCount();
    }
  }, [accountActive, user]);

  return (
    <Wrapper $active={accountActive}>
      <TitleWrapper>
        <BackIconDiv
          onClick={() => {
            setAccountActive(false);
          }}
        >
          <BackIcon src={back}></BackIcon>
        </BackIconDiv>

        <Title>帳戶資訊</Title>
      </TitleWrapper>

      <Center>
        <AvatarImgLabel>
          <AvatarImgInput
            type="file"
            accept="image/gif, image/jpeg, image/png"
            onChange={(e) => {
              if (e.target.files) {
                setImageFile(e.target.files[0]);
              }
            }}
          />
          <Avatar
            src={imageFile ? URL.createObjectURL(imageFile) : user?.avatar}
          />
          <AvatarImgMask />
          <UploadImgBtn>更新封面</UploadImgBtn>
        </AvatarImgLabel>

        <UnameWrapper>
          <Username $isEdit={isEdit}>{user?.uname}</Username>
          <UsernameInput
            // ref={userNameRef}
            $isEdit={isEdit}
            onChange={(e) => {
              if (e.target.value.length < 17) {
                setInput(e.target.value);
              }
            }}
            value={input}
          ></UsernameInput>
          <EditIconDiv
            onClick={() => {
              setIsEdit(!isEdit);
              // userNameRef?.current?.focus();
            }}
          >
            <EditIcon src={edit}></EditIcon>
          </EditIconDiv>
        </UnameWrapper>
        <ConfirmBtn
          $imageFile={imageFile}
          $isEdit={isEdit}
          onClick={async () => {
            const imageUrl = await uploadImage();
            const a = { cover: imageUrl, uname: input };

            if (input && imageUrl) {
              updateUser(user.uid, input, imageUrl);
              dispatch({
                type: actionType.USER.SETUSER,
                value: { ...user, uname: input, avatar: imageUrl },
              });
            } else if (input) {
              updateUser(user.uid, input, user.avatar);
              dispatch({
                type: actionType.USER.SETUSER,
                value: { ...user, uname: input },
              });
            }
            setIsEdit(false);
          }}
        >
          確認修改
        </ConfirmBtn>

        <ReadCountWrapper $imageFile={imageFile} $isEdit={isEdit}>
          <ReadCountP>閱讀書本累計</ReadCountP>
          <ReadCountP>{readCount}本</ReadCountP>
        </ReadCountWrapper>
        <WriteCountWrapper>
          <WriteCountP>書摘字數累計</WriteCountP>
          <WriteCountP>{writeCount}字</WriteCountP>
        </WriteCountWrapper>
      </Center>
    </Wrapper>
  );
};

export default Account;

const Wrapper = styled.div<{ $active: boolean }>`
  z-index: 13;
  display: ${(props) => (props.$active ? "flex" : "none")};
  position: absolute;
  top: 0px;
  left: 0px;
  width: 360px;
  height: 450px;

  background: #f6d4ba;
  flex-direction: column;

  padding-bottom: 8px;
  border-radius: 6px;
  box-shadow: 0 12px 28px 0 rgba(0, 0, 0, 0.2), 0 2px 4px 0 rgba(0, 0, 0, 0.1);
  @media screen and (max-width: 830px) {
    width: 100%;
    border-radius: 0px;
  }
`;

const TitleWrapper = styled.div`
  display: flex;
  align-items: center;
  height: 60px;
  padding: 16px 16px 8px;
  @media screen and (max-width: 830px) {
    justify-content: center;
  }
`;
const BackIconDiv = styled.div`
  width: 38px;
  height: 38px;
  position: relative;
  border-radius: 50%;
  cursor: pointer;
  :hover {
    background: #f3b391;
  }
  @media screen and (max-width: 830px) {
    position: absolute;
    top: 15px;
    left: 12px;
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
  @media screen and (max-width: 830px) {
    padding-left: 0px;
  }
`;

const Center = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;

  padding: 16px 8px 8px;
`;

const AvatarImgLabel = styled.label`
  width: 130px;
  height: 130px;
  border-radius: 50%;
  position: relative;
`;

const AvatarImgInput = styled.input`
  opacity: 0;
  z-index: -1;
`;

const Avatar = styled.img`
  position: absolute;
  width: 130px;
  height: 130px;
  top: 0;
  left: 0;
  border-radius: 50%;
  z-index: 11;
`;

const AvatarImgMask = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 11;
  border-radius: 50%;

  background: rgba(0, 0, 0, 0.3);
`;

const UploadImgBtn = styled.div`
  width: 100px;
  height: 50px;
  border-radius: 30px;
  background-color: black;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  cursor: pointer;
  z-index: 12;
  border: 1px solid black;
  color: #fefadc;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const UnameWrapper = styled.div`
  display: flex;

  width: 130px;
  height: 38px;
  justify-content: center;
  align-items: center;
  position: relative;
  margin: 16px 0px;
`;

const Username = styled.p<{ $isEdit: boolean }>`
  display: ${(props) => (props.$isEdit ? "none" : "block")};
  font-size: 20px;
  font-weight: 500;
  overflow-x: overlay;
  background: #f6d4ba;

  // &::-webkit-scrollbar {
  //   width: 4px;
  // }
  // &::-webkit-scrollbar-button {
  //   display: none;
  //   /* background: transparent;
  // border-radius: 8px; */
  // }
  // &::-webkit-scrollbar-track-piece {
  //   background: transparent;
  // }
  // &::-webkit-scrollbar-thumb {
  //   border-radius: 8px;
  //   background-color: rgba(0, 0, 0, 0.4);
  //   border: 1px solid slategrey;
  // }
  // &::-webkit-scrollbar-track {
  //   box-shadow: transparent;
  // }
`;

const UsernameInput = styled.input<{ $isEdit: boolean }>`
  display: ${(props) => (props.$isEdit ? "block" : "none")};
  width: 130px;
  height: 38px;
  font-size: 20px;
  border-bottom: 1px solid #3f612d;
  color: gray;
  text-align: center;
`;
const EditIconDiv = styled.div`
  width: 38px;
  height: 38px;
  position: absolute;
  bottom: 0px;
  right: -38px;
  cursor: pointer;
  border-radius: 50%;
  :hover {
    background: #f3b391;
  }
`;
const EditIcon = styled.img`
  position: absolute;
  top: 8px;
  left: 8px;
  width: 20px;
`;

const ConfirmBtn = styled.div<{ $imageFile: File | null; $isEdit: boolean }>`
  background: #eff2f5;
  width: 100px;
  height: 38px;
  display: ${(props) => (props.$imageFile || props.$isEdit ? "flex" : "none")};
  cursor: pointer;
  justify-content: center;
  align-items: center;
  border-radius: 6px;
  margin-bottom: 16px;
  background: #fefadc;
  :hover {
    background: #f3eec8;
  }
`;

const ReadCountWrapper = styled.div<{
  $imageFile: File | null;
  $isEdit: boolean;
}>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 200px;

  margin-top: ${(props) =>
    props.$imageFile || props.$isEdit ? "0px" : "54px"};
  margin-bottom: 16px;
`;
const ReadCountP = styled.div`
  font-size: 20px;
`;
const WriteCountWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 200px;

  margin-bottom: 16px;
`;
const WriteCountP = styled.div`
  font-size: 20px;
`;
