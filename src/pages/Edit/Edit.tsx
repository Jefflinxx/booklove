import styled from "styled-components";
import { useSelector, useDispatch } from "react-redux";
import { updateUserLibrary } from "../../utils/firestore";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { storage } from "../../utils/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useState } from "react";
import { User } from "../../reducer/userReducer";
import { CurrentBook } from "../../reducer/currentBookReducer";

function Edit() {
  const user = useSelector((state: { userReducer: User }) => state.userReducer);
  const currentbook = useSelector(
    (state: { currentBookReducer: CurrentBook }) => state.currentBookReducer
  );
  const library = useSelector(
    (state: { currentLibraryReducer: CurrentBook[] }) =>
      state.currentLibraryReducer
  );
  const navigator = useNavigate();
  const { register, handleSubmit } = useForm();
  const [imageFile, setImageFile] = useState<File | null>(null);

  const uploadImage = async () => {
    if (imageFile === null) return;
    const imageRef = ref(storage, `${user.uid}/${Date.now() + imageFile.name}`);
    await uploadBytes(imageRef, imageFile);
    const imageUrl = await getDownloadURL(imageRef);
    return imageUrl;
  };

  return (
    <>
      <Center>
        <DeleteIconDivWrapper>
          <BackDiv
            onClick={() => {
              navigator(-1);
            }}
          >
            <Back></Back>Back
          </BackDiv>
          <DeleteIconDiv
            onClick={() => {
              const a = library.filter((i) => i.isbn !== currentbook.isbn);
              console.log(a);
              updateUserLibrary(user.uid, a);
              navigator("../../");
            }}
          >
            <DeleteIcon></DeleteIcon>delete
          </DeleteIconDiv>
        </DeleteIconDivWrapper>
      </Center>
      <form
        onSubmit={handleSubmit(async (data) => {
          const imageUrl = await uploadImage();
          let a: object;

          if (imageUrl) {
            a = { ...data, cover: imageUrl };
          } else {
            a = { ...data };
          }
          let b: object = {};
          library.forEach((i) => {
            if (i.isbn === currentbook.isbn) {
              b = { ...i, ...a };
            }
          });
          const c: object[] = library.filter(
            (i) => i.isbn !== currentbook.isbn
          );
          const d: object[] = [...c, b];
          console.log(d);
          updateUserLibrary(user.uid, d);
          navigator(-1);
        })}
      >
        <TopSection>
          {/* <UploadCard /> */}
          <BookImgLabel>
            <BookImgInput
              type="file"
              accept="image/gif, image/jpeg, image/png"
              onChange={(e) => {
                if (e.target.files) {
                  setImageFile(e.target.files[0]);
                }
              }}
            />
            <BookImg
              src={
                imageFile ? URL.createObjectURL(imageFile) : currentbook.cover
              }
            />
            <BookImgMask />
            <UploadImgBtn>更新封面</UploadImgBtn>
          </BookImgLabel>

          <TopRightSection>
            {[
              {
                tagName: "書名",
                key: "bookname",
                value: currentbook?.bookname,
              },
              { tagName: "作者", key: "author", value: currentbook?.author },
              {
                tagName: "出版社",
                key: "publisher",
                value: currentbook.publisher,
              },
            ].map((i) => {
              return (
                <SectionItem>
                  <BooknameP>{i.tagName}</BooknameP>
                  <Bookname
                    defaultValue={i.value}
                    {...register(`${i.key}`)}
                  ></Bookname>
                </SectionItem>
              );
            })}
            <SectionItem>
              <CategoryP>分類</CategoryP>
              <Category
                defaultValue={currentbook?.category}
                {...register("category")}
              ></Category>
            </SectionItem>
          </TopRightSection>
        </TopSection>

        <BottomSection>
          <SectionItem>
            <ProgressP>總章節</ProgressP>
            <Progress
              defaultValue={currentbook?.totalChapter}
              {...register("totalChapter")}
            ></Progress>
          </SectionItem>
          <SectionItem>
            <PlaceP>地點</PlaceP>
            <Place
              defaultValue={currentbook?.place}
              {...register("place")}
            ></Place>
          </SectionItem>
          <SectionItem>
            <LendToP>出借給</LendToP>
            <LendTo
              defaultValue={currentbook?.lendTo}
              {...register("lendTo")}
            ></LendTo>
          </SectionItem>
          <SummaryP>書摘</SummaryP>
          <Summary
            defaultValue={currentbook?.summary}
            {...register("summary")}
          ></Summary>
        </BottomSection>

        <ModifyButton type="submit">修改</ModifyButton>
      </form>
    </>
  );
}

export default Edit;

const Center = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const DeleteIconDivWrapper = styled.div`
  width: 80%;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const BackDiv = styled.div`
  width: 40px;
  height: 40px;
  border: 1px solid black;
`;
const Back = styled.div``;

const DeleteIconDiv = styled.div`
  width: 40px;
  height: 40px;
  border: 1px solid black;
`;

const DeleteIcon = styled.div``;

const TopSection = styled.div`
  display: flex;
`;

const BookImgLabel = styled.label`
  width: 220px;
  height: 300px;
  border: 1px solid black;
  position: relative;
`;

const BookImgInput = styled.input`
  opacity: 0;
  z-index: -1;
`;

const BookImg = styled.img`
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
`;

const BookImgMask = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;

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

const TopRightSection = styled.div``;

const SectionItem = styled.div`
  display: flex;
`;

const BooknameP = styled.div``;
const Bookname = styled.input`
  width: 160px;
  height: 40px;
`;

const CategoryP = styled.div``;
const Category = styled.input`
  width: 160px;
  height: 40px;
`;

const ProgressP = styled.div``;
const Progress = styled.input`
  width: 160px;
  height: 40px;
`;

const PlaceP = styled.div``;
const Place = styled.input`
  width: 160px;
  height: 40px;
`;

const LendToP = styled.div``;
const LendTo = styled.input`
  width: 160px;
  height: 40px;
`;

const SummaryP = styled.div``;
const Summary = styled.textarea`
  width: 160px;
  height: 40px;
`;

const BottomSection = styled.div``;

const ModifyButton = styled.button``;
const BackButton = styled.button``;
