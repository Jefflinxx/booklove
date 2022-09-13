import { useEffect, useState } from "react";
import styled from "styled-components";
import { storage } from "../../utils/firebase";
import { updateUser } from "../../utils/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { User } from "../../reducer/userReducer";
import { useSelector, useDispatch } from "react-redux";
import { actionType } from "../../reducer/rootReducer";

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

  return (
    <Wrapper $active={accountActive}>
      Account:
      <div
        onClick={() => {
          setAccountActive(false);
        }}
      >
        返回
      </div>
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
            $isEdit={isEdit}
            onChange={(e) => {
              setInput(e.target.value);
            }}
            value={input}
          ></UsernameInput>
          <EditIcon
            onClick={() => {
              setIsEdit(true);
            }}
          >
            edit
          </EditIcon>
        </UnameWrapper>
        <button
          onClick={async () => {
            const imageUrl = await uploadImage();
            const a = { cover: imageUrl, uname: input };
            console.log(a);
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
        </button>
      </Center>
    </Wrapper>
  );
};

export default Account;

const Wrapper = styled.div<{ $active: boolean }>`
  z-index: 3;
  display: ${(props) => (props.$active ? "block" : "none")};
  position: absolute;
  top: 0px;
  right: 0px;
  width: 350px;
  height: 450px;
  border: 1px solid black;
  background: white;
`;

const Center = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
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
  z-index: 1;
`;

const AvatarImgMask = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
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
  z-index: 2;
  border: 1px solid black;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const UnameWrapper = styled.div`
  display: flex;
  border: 1px solid black;
  width: 130px;
  height: 60px;
  justify-content: center;
  align-items: center;
  position: relative;
`;

const Username = styled.p<{ $isEdit: boolean }>`
  display: ${(props) => (props.$isEdit ? "none" : "block")};
  font-size: 20px;
  border-bottom: 1px solid black;
  overflow: scroll;
`;

const UsernameInput = styled.input<{ $isEdit: boolean }>`
  display: ${(props) => (props.$isEdit ? "block" : "none")};
  width: 130px;
  height: 60px;
  font-size: 20px;
`;

const EditIcon = styled.div`
  position: absolute;

  right: -30px;
  width: 30px;
  height: 30px;
  border: 1px solid black;
`;
