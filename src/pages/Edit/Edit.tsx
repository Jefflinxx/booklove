import styled from "styled-components";
import { actionType } from "../../reducer/rootReducer";
import { useSelector, useDispatch } from "react-redux";
import { getUserInfo, updateUserLibrary } from "../../utils/firestore";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { storage } from "../../utils/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useEffect, useState } from "react";
import { User } from "../../reducer/userReducer";
import { CurrentBook } from "../../reducer/currentBookReducer";
import back from "./back.svg";
import deleteIcon from "./delete.svg";
import Tiptap from "../../components/Tiptap/Tiptap";

function Edit() {
  const dispatch = useDispatch();
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
  const [publicActive, setPublicActive] = useState<boolean>(true);
  const [isLendToActive, setIsLendToActive] = useState<boolean>(false);
  const [summaryData, setSummaryData] = useState("");

  const uploadImage = async () => {
    if (imageFile === null) return;
    const imageRef = ref(storage, `${user.uid}/${Date.now() + imageFile.name}`);
    await uploadBytes(imageRef, imageFile);
    const imageUrl = await getDownloadURL(imageRef);
    return imageUrl;
  };

  useEffect(() => {
    setCategoryArray(currentBook?.category || []);
    if (user?.uid) {
      getUserInfo(user.uid).then((v) => {
        v?.library.forEach((i) => {
          if (i.isbn === currentBook.isbn) {
            if (i.totalChapter) {
              setProgress(i.totalChapter);
            }
            if (i.like) {
              setLikeActive(i.like);
            }
            if (i.summary) {
              setSummaryData(i.summary);
            }
            setPublicActive(i.isPublic);
            setIsLendToActive(i.isLendTo);
          }
        });
      });
    }
  }, [user]);

  return (
    <>
      <WholeWrapper>
        <WholeCenterWrapper>
          <DeleteIconDivWrapper>
            <BackIconDiv
              onClick={() => {
                navigator(-1);
              }}
            >
              <BackIcon src={back}></BackIcon>
            </BackIconDiv>

            <DeleteIconDiv
              onClick={() => {
                const a = library.filter((i) => i.isbn !== currentBook.isbn);

                updateUserLibrary(user.uid, a);
                navigator("../../");
              }}
            >
              <DeleteIcon src={deleteIcon}></DeleteIcon>
            </DeleteIconDiv>
          </DeleteIconDivWrapper>
          <form
            onSubmit={handleSubmit(async (data) => {
              const imageUrl = await uploadImage();
              let submitData: object;

              if (imageUrl) {
                if (currentBook.alreadyReadChapter < progress) {
                  submitData = {
                    ...data,
                    cover: imageUrl,
                    category: categoryArray,
                    totalChapter: progress,
                    like: likeActive,
                    isPublic: publicActive,
                    isLendTo: isLendToActive,
                    summary: summaryData,
                  };
                } else {
                  submitData = {
                    ...data,
                    cover: imageUrl,
                    category: categoryArray,
                    totalChapter: progress,
                    alreadyReadChapter: progress,
                    like: likeActive,
                    isPublic: publicActive,
                    isLendTo: isLendToActive,
                    summary: summaryData,
                  };
                }
              } else {
                // console.log(
                //   currentBook.alreadyReadChapter,
                //   currentBook.alreadyReadChapter <= progress
                // );
                if (currentBook.alreadyReadChapter <= progress) {
                  submitData = {
                    ...data,
                    category: categoryArray,
                    totalChapter: progress,
                    like: likeActive,
                    isPublic: publicActive,
                    isLendTo: isLendToActive,
                    summary: summaryData,
                  };
                } else {
                  submitData = {
                    ...data,
                    category: categoryArray,
                    totalChapter: progress,
                    alreadyReadChapter: progress,
                    like: likeActive,
                    isPublic: publicActive,
                    isLendTo: isLendToActive,
                    summary: summaryData,
                  };
                }
              }
              // console.log(submitData);

              const userData = await getUserInfo(user.uid);
              if (userData) {
                let bookInfoAddSubmitData: object = {};
                userData.library.forEach((i) => {
                  if (i.isbn === currentBook.isbn) {
                    bookInfoAddSubmitData = { ...i, ...submitData };
                  }
                });

                dispatch({
                  type: actionType.BOOK.SETBOOKDATA,
                  value: bookInfoAddSubmitData,
                });

                const allBookExceptEditBook: object[] = userData.library.filter(
                  (i) => i.isbn !== currentBook.isbn
                );
                const allBookData: object[] = [
                  bookInfoAddSubmitData,
                  ...allBookExceptEditBook,
                ];

                updateUserLibrary(user.uid, allBookData);
                navigator(-1);
              }
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
                    imageFile
                      ? URL.createObjectURL(imageFile)
                      : currentBook.cover
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
                  {
                    tagName: "作者",
                    key: "author",
                    value: currentBook?.author,
                  },
                  {
                    tagName: "出版社",
                    key: "publisher",
                    value: currentBook.publisher,
                  },
                ].map((i) => {
                  return (
                    <SectionItem key={i.key}>
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
                        key={i}
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
                      // updateUserLibrary(user.uid, [
                      //   ...user.library.filter(
                      //     (i) => i.isbn !== currentBook.isbn
                      //   ),
                      //   { ...currentBook, like: !likeActive },
                      // ]);
                    }}
                  >
                    <Like>愛心</Like>
                  </LikeDiv>
                </SectionItem>

                <SectionItem>
                  <PublicDiv
                    publicActive={publicActive}
                    onClick={() => {
                      setPublicActive(!publicActive);
                      // updateUserLibrary(user.uid, [
                      //   ...user.library.filter(
                      //     (i) => i.isbn !== currentBook.isbn
                      //   ),
                      //   { ...currentBook, like: !publicActive },
                      // ]);
                    }}
                  >
                    <Public>是公開</Public>
                  </PublicDiv>
                </SectionItem>
              </TopRightSection>
            </TopSection>

            <BottomSection>
              <SectionBItem>
                <ProgressP>總章節</ProgressP>
                <Progress
                  onChange={(e) => {
                    const a = Number(e.target.value);

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
                <ProgressWarn progressWarn={progressWarn}>
                  請輸入數字
                </ProgressWarn>
              </SectionBItem>
              <SectionBItem>
                <PlaceP>地點</PlaceP>
                <Place
                  defaultValue={currentBook?.place}
                  {...register("place")}
                ></Place>
              </SectionBItem>

              <SectionBItem>
                <IsLendToP>是否出借</IsLendToP>
                <IsLendTo
                  isLendToActive={isLendToActive}
                  onClick={() => {
                    setIsLendToActive(!isLendToActive);
                    // updateUserLibrary(user.uid, [
                    //   ...user.library.filter(
                    //     (i) => i.isbn !== currentBook.isbn
                    //   ),
                    //   { ...currentBook, isLendTo: !isLendToActive },
                    // ]);
                  }}
                ></IsLendTo>
              </SectionBItem>

              <LendToWrapper isLendToActive={isLendToActive}>
                <LendToP>出借給</LendToP>
                <LendTo
                  defaultValue={currentBook?.lendTo}
                  {...register("lendTo")}
                ></LendTo>
              </LendToWrapper>
              <SummaryP>書摘</SummaryP>
              {summaryData && (
                <Tiptap data={summaryData} setData={setSummaryData}></Tiptap>
              )}

              {/* <Summary
                defaultValue={currentBook?.summary}
                {...register("summary")}
              ></Summary> */}
            </BottomSection>
            <ModifyButtonDiv>
              <ModifyButton type="submit">修改</ModifyButton>
            </ModifyButtonDiv>
          </form>
        </WholeCenterWrapper>
      </WholeWrapper>
    </>
  );
}

export default Edit;

const WholeWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  background: #eff2f5;
  width: 100%;
`;

const WholeCenterWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #e4e6eb;
  flex-direction: column;
  width: 902px;
  background: #ffffff;
  border-radius: 6px;
  margin: 120px 0px;
`;

const DeleteIconDivWrapper = styled.div`
  width: 902px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
  padding: 8px;
`;

const BackIconDiv = styled.div`
  position: relative;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  :hover {
    background: rgba(200, 200, 200, 0.4);
  }
`;
const BackIcon = styled.img`
  position: absolute;
  top: 8px;
  left: 10px;
  width: 14px;
`;

const DeleteIconDiv = styled.div`
  position: relative;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  :hover {
    background: rgba(200, 200, 200, 0.4);
  }
`;
const DeleteIcon = styled.img`
  position: absolute;
  top: 5px;
  left: 5px;
  width: 28px;
`;

const TopSection = styled.div`
  border: 1px solid black;
  display: flex;
  width: 720px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const BookImgLabel = styled.label`
  position: relative;
  width: 180px;
  height: 250px;
  margin: 32px;
  box-shadow: 0 12px 28px 0 rgba(0, 0, 0, 0.2), 0 2px 4px 0 rgba(0, 0, 0, 0.1);
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
  border: 1px solid black;
  margin: 12px 0px;
  width: 440px;
`;

const SectionBItem = styled.div`
  display: flex;
  border: 1px solid black;
  margin: 24px 0px 24px 54px;
`;

const BooknameP = styled.div`
  width: 90px;
  color: gray;
`;
const Bookname = styled.input`
  width: auto;
  height: auto;
  border: 1px solid black;
`;

const CategoryP = styled.div`
  width: 90px;
  color: gray;
`;
const CategoryWrapper = styled.div`
  display: flex;
  height: auto;
`;
const CategoryDiv = styled.div<{ categoryArray: string[]; $i: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  height: auto;
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

const PublicDiv = styled.div<{ publicActive: boolean }>`
  background: ${(props) => (props.publicActive ? "blue" : "white")};
`;
const Public = styled.div`
  width: 160px;
  height: 40px;
  border: 1px solid black;
`;

const ProgressP = styled.div`
  width: 90px;
  color: gray;
`;
const Progress = styled.input`
  width: 160px;

  border: 1px solid black;
`;

const ProgressWarn = styled.div<{ progressWarn: boolean }>`
  display: ${(props) => (props.progressWarn ? "block" : "none")};
`;

const PlaceP = styled.div`
  width: 90px;
  color: gray;
`;
const Place = styled.input`
  width: 160px;

  border: 1px solid black;
`;

const IsLendToP = styled.div`
  width: 90px;
  color: gray;
`;

const IsLendTo = styled.div<{ isLendToActive: boolean }>`
  width: 24px;
  border: 1px solid black;
  background: ${(props) => (props.isLendToActive ? "blue" : "white")};
`;

const LendToWrapper = styled.div<{ isLendToActive: boolean }>`
  display: ${(props) => (props.isLendToActive ? "flex" : "none")};
  border: 1px solid black;
  margin: 24px 0px 24px 54px;
`;

const LendToP = styled.div`
  width: 90px;
  color: gray;
`;
const LendTo = styled.input`
  width: 160px;
  border: 1px solid black;
`;

const SummaryP = styled.div`
  width: 90px;
  color: gray;
  margin: 24px 0px 12px 54px;
`;
const Summary = styled.textarea`
  width: 612px;
  height: 200px;
  border: 1px solid black;
  margin: 0px 0px 24px 54px;
`;

const BottomSection = styled.div`
  width: 720px;
  border: 1px solid black;
`;

const ModifyButtonDiv = styled.div`
  border: 1px solid black;
  margin-bottom: 54px;
`;
const ModifyButton = styled.button`
  border: none;
  background-color: transparent;
  display: flex;
  border: 1px solid black;
`;
