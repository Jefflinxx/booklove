import styled from "styled-components";
import { useSelector, useDispatch } from "react-redux";
import { updateUserLibrary } from "../../utils/firestore";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { storage } from "../../utils/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useEffect, useState } from "react";
import { User } from "../../reducer/userReducer";
import { CurrentBook } from "../../reducer/currentBookReducer";

function Edit() {
  const user = useSelector((state: { userReducer: User }) => state.userReducer);
  const currentBook = useSelector(
    (state: { currentBookReducer: CurrentBook }) => state.currentBookReducer
  );
  const library = useSelector(
    (state: { currentLibraryReducer: CurrentBook[] }) =>
      state.currentLibraryReducer
  );
  const navigator = useNavigate();
  const { register, handleSubmit } = useForm();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [categoryArray, setCategoryArray] = useState<string[]>([]);
  const [progress, setProgress] = useState<number>(0);
  const [progressWarn, setProgressWarn] = useState<boolean>(false);
  const [likeActive, setLikeActive] = useState<boolean>(false);

  const uploadImage = async () => {
    if (imageFile === null) return;
    const imageRef = ref(storage, `${user.uid}/${Date.now() + imageFile.name}`);
    await uploadBytes(imageRef, imageFile);
    const imageUrl = await getDownloadURL(imageRef);
    return imageUrl;
  };

  useEffect(() => {
    setCategoryArray(currentBook?.category || []);
  }, []);

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
              const a = library.filter((i) => i.isbn !== currentBook.isbn);
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
          let submitData: object;

          if (imageUrl) {
            submitData = {
              ...data,
              cover: imageUrl,
              category: categoryArray,
              totalChapter: progress,
            };
          } else {
            submitData = {
              ...data,
              category: categoryArray,
              totalChapter: progress,
            };
          }

          let bookInfoAddSubmitData: object = {};
          library.forEach((i) => {
            if (i.isbn === currentBook.isbn) {
              bookInfoAddSubmitData = { ...i, ...submitData };
            }
          });

          const allBookExceptEditBook: object[] = user.library.filter(
            (i) => i.isbn !== currentBook.isbn
          );
          const allBookData: object[] = [
            ...allBookExceptEditBook,
            bookInfoAddSubmitData,
          ];
          console.log(allBookData);
          updateUserLibrary(user.uid, allBookData);
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
                imageFile ? URL.createObjectURL(imageFile) : currentBook.cover
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
                value: currentBook?.bookname,
              },
              { tagName: "作者", key: "author", value: currentBook?.author },
              {
                tagName: "出版社",
                key: "publisher",
                value: currentBook.publisher,
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
              <CategoryWrapper>
                {user?.category?.map((i) => (
                  <CategoryDiv
                    $i={i}
                    categoryArray={categoryArray}
                    onClick={() => {
                      if (categoryArray.find((j) => j === i)) {
                        setCategoryArray((prev) => {
                          prev.filter((k) => k !== i);
                          return [...prev.filter((k) => k !== i)];
                        });
                      } else {
                        setCategoryArray((prev) => [...prev, i]);
                      }
                    }}
                  >
                    {i}
                  </CategoryDiv>
                ))}
              </CategoryWrapper>
            </SectionItem>

            <SectionItem>
              <LikeDiv
                likeActive={likeActive}
                onClick={() => {
                  setLikeActive(!likeActive);
                  updateUserLibrary(user.uid, [
                    ...user.library.filter((i) => i.isbn !== currentBook.isbn),
                    { ...currentBook, like: !likeActive },
                  ]);
                }}
              >
                <Like>愛心</Like>
              </LikeDiv>
            </SectionItem>
          </TopRightSection>
        </TopSection>

        <BottomSection>
          <SectionItem>
            <ProgressP>總章節</ProgressP>
            <Progress
              onChange={(e) => {
                const a = Number(e.target.value);
                console.log(typeof a, a);
                if (isNaN(a)) {
                  setProgressWarn(true);
                } else {
                  setProgressWarn(false);
                  setProgress(a);
                }
              }}
              defaultValue={currentBook?.totalChapter}
              // {...register("totalChapter")}
            ></Progress>
            <ProgressWarn progressWarn={progressWarn}>請輸入數字</ProgressWarn>
          </SectionItem>
          <SectionItem>
            <PlaceP>地點</PlaceP>
            <Place
              defaultValue={currentBook?.place}
              {...register("place")}
            ></Place>
          </SectionItem>
          <SectionItem>
            <LendToP>出借給</LendToP>
            <LendTo
              defaultValue={currentBook?.lendTo}
              {...register("lendTo")}
            ></LendTo>
          </SectionItem>
          <SummaryP>書摘</SummaryP>
          <Summary
            defaultValue={currentBook?.summary}
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
  border: 1px solid black;
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
  border: 1px solid black;
`;

const CategoryP = styled.div``;
const CategoryWrapper = styled.div`
  display: flex;
  height: 50px;
`;
const CategoryDiv = styled.div<{ categoryArray: string[]; $i: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 50px;
  border: 1px solid black;
  background: ${(props) =>
    props.categoryArray.find((j) => j === props.$i) ? "blue" : "white"};
`;

const LikeDiv = styled.div<{ likeActive: boolean }>`
  background: ${(props) => (props.likeActive ? "blue" : "white")};
`;
const Like = styled.div`
  width: 160px;
  height: 40px;
  border: 1px solid black;
`;

const ProgressP = styled.div``;
const Progress = styled.input`
  width: 160px;
  height: 40px;
  border: 1px solid black;
`;

const ProgressWarn = styled.div<{ progressWarn: boolean }>`
  width: 100px;
  height: 40px;
  border: 1px solid black;
  display: ${(props) => (props.progressWarn ? "block" : "none")};
`;

const PlaceP = styled.div``;
const Place = styled.input`
  width: 160px;
  height: 40px;
  border: 1px solid black;
`;

const LendToP = styled.div``;
const LendTo = styled.input`
  width: 160px;
  height: 40px;
  border: 1px solid black;
`;

const SummaryP = styled.div``;
const Summary = styled.textarea`
  width: 160px;
  height: 40px;
`;

const BottomSection = styled.div``;

const ModifyButton = styled.button``;
const BackButton = styled.button``;
