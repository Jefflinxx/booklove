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
  const [summaryData, setSummaryData] = useState<string | null>(null);

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
            } else {
              setSummaryData("");
            }
            setPublicActive(i.isPublic);
            setIsLendToActive(i.isLendTo || false);
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
                //firebase說資料不對就開這個
                //console.log(bookInfoAddSubmitData);

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
                  <Like>愛心</Like>
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
                  ></LikeDiv>
                </SectionItem>

                <SectionItem>
                  <Public>是否公開</Public>
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
                  ></PublicDiv>
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
              {summaryData || summaryData === "" ? (
                <Tiptap data={summaryData} setData={setSummaryData}></Tiptap>
              ) : (
                <></>
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

  background: #f6d4ba;
  width: 100%;
`;

const WholeCenterWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  flex-direction: column;
  width: auto;

  border-radius: 6px;
  margin: 120px 0px;
`;

const DeleteIconDivWrapper = styled.div`
  width: 1080px;
  display: flex;
  align-items: center;
  justify-content: space-between;
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
  display: flex;
  width: 900px;
  display: flex;
  align-items: center;
  margin-bottom: 60px;
`;

const BookImgLabel = styled.label`
  position: relative;
  width: 260px;
  height: 320px;
  margin-right: 80px;
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

const TopRightSection = styled.div`
  border-left: 3px solid #3f612d;
  height: auto;
`;

const SectionItem = styled.div`
  display: flex;

  font-size: 24px;
  margin-left: 32px;

  color: #3f612d;
  min-height: 64px;
`;

const SectionBItem = styled.div`
  display: flex;

  font-size: 24px;
  margin-left: 32px;

  color: #3f612d;
  min-height: 64px;
`;

const BooknameP = styled.div`
  width: 120px;
`;
const Bookname = styled.input`
  color: #3f612d;
  font-size: 24px;
  height: 36px;
  width: 360px;
  text-indent: 8px;
  background: #fefadc;
  border-radius: 6px;
  border: 1px solid #3f612d;
`;

const CategoryP = styled.div`
  width: 120px;
`;
const CategoryWrapper = styled.div`
  display: flex;
  height: auto;
`;
const CategoryDiv = styled.div<{ categoryArray: string[]; $i: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0px 8px;
  height: 36px;
  border: 1px solid #3f612d;
  border-radius: 6px;
  background: ${(props) =>
    props.categoryArray.find((j) => j === props.$i) ? "#f3b391" : "#fefadc"};
`;

const LikeDiv = styled.div<{ likeActive: boolean }>`
  width: 36px;
  height: 36px;
  border: 1px solid #3f612d;
  border-radius: 6px;
  background: ${(props) => (props.likeActive ? "#f3b391" : "#fefadc")};
`;
const Like = styled.div`
  width: 120px;
`;

const PublicDiv = styled.div<{ publicActive: boolean }>`
  width: 36px;
  height: 36px;
  border: 1px solid #3f612d;
  border-radius: 6px;
  background: ${(props) => (props.publicActive ? "#f3b391" : "#fefadc")};
`;
const Public = styled.div`
  width: 120px;
`;

const ProgressP = styled.div`
  width: 120px;
`;
const Progress = styled.input`
  color: #3f612d;
  font-size: 24px;
  height: 36px;
  width: 360px;
  text-indent: 8px;
  background: #fefadc;
  border-radius: 6px;
  border: 1px solid #3f612d;
`;

const ProgressWarn = styled.div<{ progressWarn: boolean }>`
  display: ${(props) => (props.progressWarn ? "block" : "none")};
`;

const PlaceP = styled.div`
  width: 120px;
`;
const Place = styled.input`
  color: #3f612d;
  font-size: 24px;
  height: 36px;
  width: 360px;
  text-indent: 8px;
  background: #fefadc;
  border-radius: 6px;
  border: 1px solid #3f612d;
`;

const IsLendToP = styled.div`
  width: 120px;
`;

const IsLendTo = styled.div<{ isLendToActive: boolean }>`
  width: 36px;
  height: 36px;
  border: 1px solid #3f612d;
  border-radius: 6px;
  background: ${(props) => (props.isLendToActive ? "#f3b391 " : "#fefadc ")};
`;

const LendToWrapper = styled.div<{ isLendToActive: boolean }>`
  display: ${(props) => (props.isLendToActive ? "flex" : "none")};
  font-size: 24px;
  margin-left: 32px;

  color: #3f612d;
  min-height: 64px;
`;

const LendToP = styled.div`
  width: 120px;
`;
const LendTo = styled.input`
  font-size: 24px;
  height: 36px;
  width: 360px;
  text-indent: 8px;
  background: #fefadc;
  border-radius: 6px;
  border: 1px solid #3f612d;
`;

const SummaryP = styled.div`
  font-size: 24px;
  color: #3f612d;
  width: 120px;
  margin: 0px 0px 12px 32px;
`;
const Summary = styled.textarea`
  width: 612px;
  height: 200px;
  border: 1px solid black;
  margin: 0px 0px 24px 32px;
`;

const BottomSection = styled.div`
  width: 900px;
  border-left: 3px solid #3f612d;
  margin-bottom: 54px;
`;

const ModifyButtonDiv = styled.div``;
const ModifyButton = styled.button`
  border: none;
  background-color: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 48px;
  width: 120px;
  font-size: 24px;
  color: #3f612d;

  background: #fefadc;
  border-radius: 6px;
  border: 1px solid #3f612d;
  :hover {
    background: #f3b391;
  }
`;
