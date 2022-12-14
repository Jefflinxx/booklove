import styled from "styled-components";
import { actionType } from "../../reducer/rootReducer";
import { useSelector, useDispatch } from "react-redux";
import {
  getUserInfo,
  updateUserLibrary,
  updateCategory,
} from "../../utils/firestore";
import { useNavigate } from "react-router-dom";
import { appendErrors, useForm } from "react-hook-form";
import { storage } from "../../utils/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useEffect, useState } from "react";
import { User } from "../../reducer/userReducer";
import { CurrentBook } from "../../reducer/currentBookReducer";
import Tiptap from "../../components/Tiptap/Tiptap";

import back from "../../assets/back.svg";
import deleteIcon from "../../assets/delete.svg";

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
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [categoryArray, setCategoryArray] = useState<string[]>([]);
  const [progress, setProgress] = useState<number>(0);
  const [page, setPage] = useState<number>(0);
  const [progressWarn, setProgressWarn] = useState<boolean>(false);
  const [pageWarn, setPageWarn] = useState<boolean>(false);
  const [likeActive, setLikeActive] = useState<boolean>(false);
  const [publicActive, setPublicActive] = useState<boolean>(true);
  const [isLendToActive, setIsLendToActive] = useState<boolean>(false);
  const [summaryData, setSummaryData] = useState<string | null>(null);
  const [categoryInput, setCategoryInput] = useState<string>("");
  const [popupActive, setPopupActive] = useState(false);
  const [barrierBGActive, setBarrierBGActive] = useState<boolean>(false);

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
            if (i.page) {
              setPage(i.page);
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
      <BarrierBG barrierBGActive={barrierBGActive} />
      <Popup $active={popupActive}>
        ????????????????????????????????????????????????
        <PopupClose
          onClick={() => {
            setPopupActive(false);
            setBarrierBGActive(false);
          }}
        >
          ???
        </PopupClose>
      </Popup>
      <WholeWrapper>
        <WholeCenterWrapper>
          <DeleteIconDivWrapper>
            <BackIconDiv
              onClick={() => {
                navigator(`../book/${user.uid}${currentBook.isbn}`);
              }}
            >
              <BackIcon src={back}></BackIcon>
            </BackIconDiv>

            <DeleteIconDiv
              onClick={() => {
                if (currentBook.isLendTo) {
                  setPopupActive(true);
                  setBarrierBGActive(true);
                  return;
                }
                const filterItems = library.filter(
                  (i) => i.isbn !== currentBook.isbn
                );

                updateUserLibrary(user.uid, filterItems);
                navigator("../../");
                getUserInfo(user.uid).then((v) => {
                  dispatch({
                    type: actionType.USER.SETUSER,
                    value: v,
                  });
                });
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
                    page: page,
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
                    page: page,
                    like: likeActive,
                    isPublic: publicActive,
                    isLendTo: isLendToActive,
                    summary: summaryData,
                  };
                }
              } else {
                if (currentBook.alreadyReadChapter <= progress) {
                  submitData = {
                    ...data,
                    category: categoryArray,
                    totalChapter: progress,
                    page: page,
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
                    page: page,
                    like: likeActive,
                    isPublic: publicActive,
                    isLendTo: isLendToActive,
                    summary: summaryData,
                  };
                }
              }

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
                <UploadImgBtn>????????????</UploadImgBtn>
              </BookImgLabel>

              <TopRightSection>
                {[
                  {
                    tagName: "??????",
                    key: "bookname",
                    value: currentBook?.bookname,
                  },
                  {
                    tagName: "??????",
                    key: "author",
                    value: currentBook?.author,
                  },
                  {
                    tagName: "?????????",
                    key: "publisher",
                    value: currentBook.publisher,
                  },
                ].map((i) => {
                  return (
                    <SectionItem key={i.key}>
                      <BooknameP>{i.tagName}</BooknameP>
                      <Bookname
                        defaultValue={i.value}
                        {...register(`${i.key}`, {
                          required: { value: true, message: "???????????????" },
                        })}
                      ></Bookname>
                      <Errorp>
                        {errors[i.key] && (errors[i.key]!.message as string)}
                      </Errorp>
                    </SectionItem>
                  );
                })}
                <SectionItem>
                  <CategoryP>??????</CategoryP>
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

                    <CategoryInputWrapper>
                      <CategoryInput
                        placeholder="????????????"
                        value={categoryInput}
                        onChange={(e) => {
                          setCategoryInput(e.target.value);
                        }}
                      />
                      <CategoryPlus
                        onClick={() => {
                          if (
                            user?.category &&
                            user?.category.find((j) => j === categoryInput)
                          ) {
                            return;
                          } else if (categoryInput.trim() === "") {
                            return;
                          } else if (user?.category) {
                            updateCategory(user.uid, [
                              ...user.category,
                              categoryInput,
                            ]);
                            dispatch({
                              type: actionType.USER.SETUSER,
                              value: {
                                ...user,
                                category: [...user.category, categoryInput],
                              },
                            });
                          } else {
                            updateCategory(user.uid, [categoryInput]);
                            dispatch({
                              type: actionType.USER.SETUSER,
                              value: {
                                ...user,
                                category: [categoryInput],
                              },
                            });
                          }
                          setCategoryInput("");
                        }}
                      >
                        +
                      </CategoryPlus>
                    </CategoryInputWrapper>
                  </CategoryWrapper>
                </SectionItem>

                <SectionItem>
                  <Like>??????</Like>
                  <LikeDiv
                    likeActive={likeActive}
                    onClick={() => {
                      setLikeActive(!likeActive);
                    }}
                  ></LikeDiv>
                </SectionItem>

                <SectionItem>
                  <Public>????????????</Public>
                  <PublicDiv
                    publicActive={publicActive}
                    onClick={() => {
                      setPublicActive(!publicActive);
                    }}
                  ></PublicDiv>
                </SectionItem>
              </TopRightSection>
            </TopSection>

            <BottomSection>
              <SectionBItem>
                <ProgressP>?????????</ProgressP>
                <Progress
                  onChange={(e) => {
                    const allChapterInput = Number(e.target.value);

                    if (isNaN(allChapterInput) || allChapterInput > 30) {
                      setProgressWarn(true);
                    } else {
                      setProgressWarn(false);
                      setProgress(allChapterInput);
                    }
                  }}
                  defaultValue={currentBook?.totalChapter}
                ></Progress>
                <ProgressWarn progressWarn={progressWarn}>
                  ?????????????????????????????????30
                </ProgressWarn>
                <PTipP>????????????????????????????????????????????????????????????</PTipP>
              </SectionBItem>
              <SectionBItem>
                <BookmarkP>?????????</BookmarkP>
                <Bookmark
                  onChange={(e) => {
                    const bookmarkInput = Number(e.target.value);

                    if (isNaN(bookmarkInput)) {
                      setPageWarn(true);
                    } else {
                      setPageWarn(false);
                      setPage(bookmarkInput);
                    }
                  }}
                  defaultValue={currentBook?.page}
                ></Bookmark>
                <PageWarn pageWarn={pageWarn}>???????????????</PageWarn>
              </SectionBItem>
              <SectionBItem>
                <PlaceP>????????????</PlaceP>
                <Place
                  defaultValue={currentBook?.place}
                  {...register("place")}
                ></Place>
              </SectionBItem>

              <SectionBItem>
                <IsLendToP>????????????</IsLendToP>
                <IsLendTo
                  isLendToActive={isLendToActive}
                  onClick={() => {
                    setIsLendToActive(!isLendToActive);
                  }}
                ></IsLendTo>
              </SectionBItem>

              <LendToWrapper isLendToActive={isLendToActive}>
                <LendToP>?????????</LendToP>
                <LendTo
                  defaultValue={currentBook?.lendTo}
                  {...register("lendTo")}
                ></LendTo>
              </LendToWrapper>
              <SummaryP>??????</SummaryP>
              {summaryData || summaryData === "" ? (
                <Tiptap data={summaryData} setData={setSummaryData}></Tiptap>
              ) : (
                <></>
              )}
            </BottomSection>
            <ModifyButtonDiv>
              <ModifyButton type="submit">??????</ModifyButton>
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
  @media screen and (max-width: 620px) {
    margin: 60px 0px 120px 0px;
  }
`;

const DeleteIconDivWrapper = styled.div`
  width: 1080px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px;
  @media screen and (max-width: 1100px) {
    width: 900px;
    margin-bottom: 32px;
  }
  @media screen and (max-width: 920px) {
    width: 560px;
  }
  @media screen and (max-width: 620px) {
    width: 348px;
  }
`;

const BackIconDiv = styled.div`
  position: relative;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  cursor: pointer;
  :hover {
    background: #f3b391;
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
  cursor: pointer;
  :hover {
    background: #f3b391;
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
  @media screen and (max-width: 920px) {
    width: 560px;
    flex-direction: column;
  }
  @media screen and (max-width: 620px) {
    width: 348px;
    margin-bottom: 0px;
  }
`;

const BookImgLabel = styled.label`
  position: relative;
  width: 260px;
  height: 320px;
  margin-right: 80px;
  box-shadow: 0 12px 28px 0 rgba(0, 0, 0, 0.2), 0 2px 4px 0 rgba(0, 0, 0, 0.1);
  @media screen and (max-width: 920px) {
    margin-right: 0px;
    margin-bottom: 32px;
  }
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
  @media screen and (max-width: 920px) {
    border-left: none;
  }
`;

const SectionItem = styled.div`
  position: relative;
  display: flex;

  font-size: 24px;
  margin-left: 32px;

  color: #3f612d;
  min-height: 64px;
  @media screen and (max-width: 920px) {
    margin-left: 0px;
  }
  @media screen and (max-width: 620px) {
    flex-direction: column;
  }
`;

const SectionBItem = styled.div`
  position: relative;
  display: flex;

  font-size: 24px;
  margin-left: 32px;

  color: #3f612d;
  min-height: 64px;

  @media screen and (max-width: 920px) {
    margin-left: 0px;
    width: 480px;
  }
  @media screen and (max-width: 620px) {
    flex-direction: column;
    width: 320px;
  }
`;

const Title = styled.div`
  width: 120px;
`;
const Input = styled.input`
  width: 360px;
  height: 36px;
  color: #3f612d;
  font-size: 24px;
  text-indent: 8px;
  background: #fefadc;
  border-radius: 6px;
  border: 1px solid #3f612d;
  @media screen and (max-width: 620px) {
    width: 320px;
    margin-bottom: 16px;
  }
`;

const BooknameP = styled(Title)``;
const Bookname = styled(Input)``;

const Errorp = styled.p`
  font-size: 16px;
  position: absolute;
  left: 120px;
  bottom: 2px;
  color: #b9480c;
`;

const CategoryP = styled(Title)``;
const CategoryWrapper = styled.div`
  display: flex;
  height: auto;
  width: 320px;
  flex-wrap: wrap;
  @media screen and (max-width: 620px) {
    margin-bottom: 16px;
  }
`;
const CategoryDiv = styled.div<{ categoryArray: string[]; $i: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0px 8px;
  margin-right: 8px;
  height: 36px;
  border: 1px solid #3f612d;
  border-radius: 6px;
  background: ${(props) =>
    props.categoryArray.find((j) => j === props.$i) ? "#f3b391" : "#fefadc"};
`;

const CategoryInputWrapper = styled.div`
  position: relative;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
`;

const CategoryInput = styled.input`
  border-bottom: 1px solid #3f612d;
  width: 220px;
  text-align: center;
  font-size: 24px;
  color: #1f2e16;
  ::placeholder {
    color: gray;
  }
`;
const CategoryPlus = styled.div`
  position: absolute;
  bottom: 12px;
  right: 0px;
  width: 28px;
  height: 28px;
  font-size: 28px;
  border-radius: 6px;
  cursor: pointer;
  user-select: none;
  z-index: 3;
  color: #3f612d;
  display: flex;
  align-items: center;
  justify-content: center;
  :hover {
    background: #f3eec8;
    color: #1f2e16;
  }
`;

const LikeDiv = styled.div<{ likeActive: boolean }>`
  width: 36px;
  height: 36px;
  border: 1px solid #3f612d;
  border-radius: 6px;
  background: ${(props) => (props.likeActive ? "#f3b391" : "#fefadc")};
  @media screen and (max-width: 620px) {
    margin-bottom: 16px;
  }
`;
const Like = styled(Title)``;

const PublicDiv = styled.div<{ publicActive: boolean }>`
  width: 36px;
  height: 36px;
  border: 1px solid #3f612d;
  border-radius: 6px;
  background: ${(props) => (props.publicActive ? "#f3b391" : "#fefadc")};
  @media screen and (max-width: 620px) {
    margin-bottom: 16px;
  }
`;
const Public = styled(Title)``;

const ProgressP = styled(Title)``;
const Progress = styled(Input)`
  margin-bottom: 0px;
`;

const BookmarkP = styled(Title)``;
const Bookmark = styled(Input)``;

const ProgressWarn = styled.div<{ progressWarn: boolean }>`
  display: ${(props) => (props.progressWarn ? "block" : "none")};
`;

const PageWarn = styled.div<{ pageWarn: boolean }>`
  display: ${(props) => (props.pageWarn ? "block" : "none")};
`;

const PTipP = styled.p`
  font-size: 16px;
  position: absolute;
  left: 120px;
  bottom: 2px;
  @media screen and (max-width: 620px) {
    position: static;
    margin-bottom: 16px;
  }
`;

const PlaceP = styled(Title)``;
const Place = styled(Input)``;

const IsLendToP = styled(Title)``;

const IsLendTo = styled.div<{ isLendToActive: boolean }>`
  width: 36px;
  height: 36px;
  border: 1px solid #3f612d;
  border-radius: 6px;
  background: ${(props) => (props.isLendToActive ? "#f3b391 " : "#fefadc ")};
  @media screen and (max-width: 620px) {
    margin-bottom: 16px;
  }
`;

const LendToWrapper = styled.div<{ isLendToActive: boolean }>`
  display: ${(props) => (props.isLendToActive ? "flex" : "none")};
  font-size: 24px;
  margin-left: 32px;

  color: #3f612d;
  min-height: 64px;
  @media screen and (max-width: 920px) {
    margin-left: 0px;
  }
  @media screen and (max-width: 620px) {
    flex-direction: column;
  }
`;

const LendToP = styled(Title)``;
const LendTo = styled(Input)``;

const SummaryP = styled(Title)`
  font-size: 24px;
  color: #3f612d;

  margin: 0px 0px 12px 32px;
  @media screen and (max-width: 920px) {
    width: 480px;
    margin-left: 0px;
  }
  @media screen and (max-width: 620px) {
    width: 320px;
  }
`;

const BottomSection = styled.div`
  width: 900px;
  border-left: 3px solid #3f612d;
  margin-bottom: 54px;
  height: auto;
  @media screen and (max-width: 920px) {
    width: 560px;
    border: none;
    display: flex;
    align-items: center;
    flex-direction: column;
    width: auto;
  }
  @media screen and (max-width: 620px) {
  }
`;

const ModifyButtonDiv = styled.div`
  @media screen and (max-width: 920px) {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;
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
  cursor: pointer;
  background: #fefadc;
  border-radius: 6px;
  border: 1px solid #3f612d;
  :hover {
    background: #f3b391;
  }
`;

const Popup = styled.div<{ $active: boolean }>`
  display: ${(props) => (props.$active ? "flex" : "none")};
  align-items: center;
  justify-content: center;
  text-align: center;
  font-size: 24px;
  position: fixed;
  top: 50vh;
  left: 50vw;
  width: 300px;
  height: 140px;
  transform: translate(-50%, -50%);
  z-index: 9;
  background: #fefadc;
  border: 1px solid #fefadc;
  border-radius: 6px;
  color: #3f612d;
  border: 8px solid #f3b391;
`;

const BarrierBG = styled.div<{ barrierBGActive: boolean }>`
  width: 100vw;
  height: 100vh;
  position: fixed;
  top: 0px;
  left: 0px;
  z-index: 8;

  display: ${(props) => (props.barrierBGActive ? "block" : "none")};
`;

const PopupClose = styled.div`
  position: absolute;
  top: -18px;
  left: -18px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #f3b391;
  border: 1px solid #fefadc;
  :hover {
    background: #dc9d7b;
  }
  cursor: pointer;
`;
