import { useSelector, useDispatch } from "react-redux";
import { actionType } from "../../reducer/rootReducer";

import styled from "styled-components";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../utils/firebase";

import plus from "./plus.svg";
import plusGray from "./plus-gray.svg";

import TopSection from "../../components/TopSection/TopSection";

import { User } from "../../reducer/userReducer";
import { CurrentBook } from "../../reducer/currentBookReducer";
import {
  getUserInfo,
  updateCategory,
  addSearchBookToUserLibrary,
  updateWishList,
} from "../../utils/firestore";
import { useNavigate, useLocation } from "react-router-dom";
import { async } from "@firebase/util";

function Home() {
  const Location = useLocation();
  const dispatch = useDispatch();
  const navigator = useNavigate();
  const user = useSelector((state: { userReducer: User }) => state.userReducer);
  const library = useSelector(
    (state: { currentLibraryReducer: CurrentBook[] }) =>
      state.currentLibraryReducer
  );
  const [categorySelectActive, setCategorySelectActive] =
    useState<boolean>(false);
  const [categoryAllActive, setCategoryAllActive] = useState<boolean>(false);
  const [categoryReadActive, setCategoryReadActive] = useState<boolean>(false);
  const [categoryLendActive, setCategoryLendActive] = useState<boolean>(false);
  const [wishListActive, setWishListActive] = useState<boolean>(false);
  const [categoryInput, setCategoryInput] = useState<string>("");
  const [categoryCurrent, setCategoryCurrent] = useState<string | null>(null);
  const localPath = Location.pathname.split("/")[1];

  useEffect(() => {
    console.log(user);
    console.log(localPath);
    console.log(localPath === "");

    if (user?.library) {
      console.log(user.library);
      if (localPath === user.uid || localPath === "") {
        getUserInfo(user.uid).then((v) => {
          if (v?.library) {
            let newLibrary: CurrentBook[] = [];
            v?.library.forEach((i) => {
              if (i?.isPublic) {
                newLibrary.push(i);
              }
            });
            dispatch({
              type: actionType.LIBRARY.SETLIBRARY,
              value: newLibrary,
            });
          }
        });
      } else {
        getUserInfo(localPath).then((v) => {
          if (!v) {
            dispatch({
              type: actionType.LIBRARY.SETLIBRARY,
              value: [
                {
                  cover:
                    "https://firebasestorage.googleapis.com/v0/b/booklove-d393f.appspot.com/o/%E5%8A%9B%E9%87%8F%E4%BA%BA.png?alt=media&token=2a68c67d-2fd7-45d2-a9fc-93dea469b437",
                  isbn: "彩蛋",
                  bookname:
                    "恭喜你找到隱藏彩蛋，歡迎mail聯絡作者將予以口頭讚美",
                },
              ],
            });
          } else if (v) {
            dispatch({
              type: actionType.LIBRARY.SETLIBRARY,
              value: v.library,
            });
          }
        });
      }
    }
  }, [localPath, user]);
  // useEffect(() => {
  //   onAuthStateChanged(auth, async (u) => {
  //     console.log("監聽登入變化");
  //     if (u) {
  //       const uid = u.uid;
  //       const user = await getUserInfo(uid);
  //       dispatch({
  //         type: actionType.USER.SETUSER,
  //         value: user || null,
  //       });
  //     } else {
  //       navigator("../login");
  //     }
  //   });
  // }, []);
  console.log(user);

  return (
    <>
      <TopSection />
      {user ? (
        <WholeWrapper>
          <CenterWrapper>
            <Center>
              <PlusIconDivWrapper>
                <PlusIconDiv
                  $uid={user.uid}
                  localPath={localPath}
                  onClick={() => {
                    navigator("./search");
                  }}
                >
                  +
                </PlusIconDiv>
              </PlusIconDivWrapper>
            </Center>
            <Center>
              <Bookcase>
                <TopTagWrapper>
                  <TopTagLeftWrapper>
                    <CategoryAll
                      onClick={async () => {
                        setCategoryAllActive(true);
                        const a = await getUserInfo(user.uid);
                        dispatch({
                          type: actionType.LIBRARY.SETLIBRARY,
                          value: a?.library || [],
                        });
                        setCategoryCurrent(null);
                        setCategoryReadActive(false);
                        setCategoryLendActive(false);
                        setWishListActive(false);
                      }}
                    >
                      全部{categoryAllActive && `(${library.length})`}
                    </CategoryAll>

                    <FinishRead
                      onClick={async () => {
                        setCategoryReadActive(true);
                        let categoryResult: CurrentBook[] = [];

                        const a = await getUserInfo(user.uid);

                        a?.library?.forEach((j) => {
                          if (j?.isFinishRead) {
                            categoryResult = [...categoryResult, j];
                          }
                        });
                        dispatch({
                          type: actionType.LIBRARY.SETLIBRARY,
                          value: categoryResult,
                        });
                        setCategoryCurrent(null);
                        setCategoryAllActive(false);
                        setCategoryLendActive(false);
                        setWishListActive(false);
                      }}
                    >
                      完成閱讀{categoryReadActive && `(${library.length})`}
                    </FinishRead>

                    <LendToOther
                      onClick={async () => {
                        setCategoryLendActive(true);
                        let categoryResult: CurrentBook[] = [];

                        const a = await getUserInfo(user.uid);

                        a?.library?.forEach((j) => {
                          if (j?.isLendTo) {
                            categoryResult = [...categoryResult, j];
                          }
                        });
                        dispatch({
                          type: actionType.LIBRARY.SETLIBRARY,
                          value: categoryResult,
                        });
                        setCategoryCurrent(null);
                        setCategoryAllActive(false);
                        setCategoryReadActive(false);
                        setWishListActive(false);
                      }}
                    >
                      出借中{categoryLendActive && `(${library.length})`}
                    </LendToOther>
                    <CategoryWholeWrapper>
                      <CategoryButton
                        onClick={() => {
                          setCategorySelectActive(!categorySelectActive);
                          setCategoryAllActive(false);
                          setCategoryReadActive(false);
                          setCategoryLendActive(false);
                          setWishListActive(false);
                        }}
                      >
                        類別
                        {categoryCurrent &&
                          `:${categoryCurrent}(${library?.length})`}
                      </CategoryButton>
                      <CategoryWrapper
                        categorySelectActive={categorySelectActive}
                      >
                        <CategoryInputWrapper>
                          <CategoryInput
                            placeholder="新增類別"
                            onChange={(e) => {
                              setCategoryInput(e.target.value);
                            }}
                          />
                          <CategoryPlus
                            onClick={() => {
                              if (user?.category) {
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
                                  value: { ...user, category: [categoryInput] },
                                });
                              }
                            }}
                          >
                            +
                          </CategoryPlus>
                        </CategoryInputWrapper>
                        {user?.category?.map((i) => {
                          return (
                            <CategoryDiv
                              onClick={async () => {
                                let categoryResult: CurrentBook[] = [];

                                const a = await getUserInfo(user.uid);

                                a?.library?.forEach((j) => {
                                  console.log(j);
                                  j?.category?.forEach((k) => {
                                    if (k === i) {
                                      categoryResult = [...categoryResult, j];
                                    }
                                  });
                                });
                                dispatch({
                                  type: actionType.LIBRARY.SETLIBRARY,
                                  value: categoryResult,
                                });
                                setCategoryCurrent(i);
                                setCategorySelectActive(false);
                                setCategoryAllActive(false);
                                setCategoryReadActive(false);
                                setCategoryLendActive(false);
                                setWishListActive(false);
                              }}
                            >
                              {i}
                            </CategoryDiv>
                          );
                        })}
                      </CategoryWrapper>
                    </CategoryWholeWrapper>
                  </TopTagLeftWrapper>
                  <WishList
                    onClick={async () => {
                      setWishListActive(true);
                      const a = await getUserInfo(user.uid);
                      dispatch({
                        type: actionType.LIBRARY.SETLIBRARY,
                        value: a?.wishList || [],
                      });
                      setCategoryCurrent(null);
                      setCategoryAllActive(false);
                      setCategoryReadActive(false);
                      setCategoryLendActive(false);
                    }}
                  >
                    願望清單{categoryLendActive && `(${library.length})`}
                  </WishList>
                </TopTagWrapper>

                {library.map((i) => {
                  return (
                    <BookDiv>
                      <BookImg
                        src={i.cover}
                        onClick={() => {
                          if (!wishListActive) {
                            dispatch({
                              type: actionType.BOOK.SETBOOKDATA,
                              value: i,
                            });
                            navigator(`./book/${user.uid}${i.isbn}`);
                          }
                        }}
                      ></BookImg>
                      <BookName
                        onClick={() => {
                          if (!wishListActive) {
                            dispatch({
                              type: actionType.BOOK.SETBOOKDATA,
                              value: i,
                            });
                            navigator(`./book/${user.uid}${i.isbn}`);
                          }
                        }}
                      >
                        {i.bookname}
                      </BookName>
                      {wishListActive && (
                        <AddToLibrary
                          onClick={async () => {
                            addSearchBookToUserLibrary(
                              user.uid,
                              i.isbn,
                              i.bookname,
                              i.author,
                              i.publisher,
                              i.cover
                            );
                            const a = await getUserInfo(user.uid);
                            updateWishList(
                              user.uid,
                              a?.wishList?.filter((j) => j.isbn !== i.isbn) ||
                                []
                            );
                            dispatch({
                              type: actionType.LIBRARY.SETLIBRARY,
                              value:
                                a?.wishList?.filter((j) => j.isbn !== i.isbn) ||
                                [],
                            });
                          }}
                        >
                          加入書櫃
                        </AddToLibrary>
                      )}
                    </BookDiv>
                  );
                })}
              </Bookcase>
            </Center>
          </CenterWrapper>
        </WholeWrapper>
      ) : (
        <></>
      )}
    </>
  );
}

export default Home;

const WholeWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  background: #eff2f5;
  border: 1px solid #e4e6eb;
`;

const CenterWrapper = styled.div`
  width: 1280px;
`;

const Center = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const PlusIconDivWrapper = styled.div`
  width: 1218px;
  height: 36px;
  position: relative;
`;

const PlusIconDiv = styled.div<{ localPath: string; $uid: string }>`
  position: absolute;
  top: -48px;
  right: 0px;
  width: 48px;
  height: 36px;
  border-radius: 6px;
  background: #eff2f5;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  :hover {
    background: rgba(200, 200, 200, 0.4);
  }

  display: ${(props) => {
    console.log(props.localPath === "");
    if (props.localPath === props.$uid || props.localPath === "") {
      return "flex";
    } else return "none";
  }};
`;

//上面的標籤
const TopTagWrapper = styled.div`
  width: 902px;
  position: absolute;
  top: -32px;
  left: 0px;
  display: flex;
  justify-content: space-between;
`;

const TopTagLeftWrapper = styled.div`
  display: flex;
  padding-left: 2px;
`;

const WishList = styled.div`
  margin-right: 2px;
  border: 1px solid #e4e6eb;
  cursor: pointer;
  user-select: none;
  width: 168px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 6px 6px 0px 0px;
  :hover {
    background: rgba(200, 200, 200, 0.4);
  }
`;

const LendToOther = styled.div`
  border: 1px solid #e4e6eb;
  cursor: pointer;
  user-select: none;
  width: 168px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 6px 6px 0px 0px;
  :hover {
    background: rgba(200, 200, 200, 0.4);
  }
`;

const FinishRead = styled.div`
  border: 1px solid #e4e6eb;
  cursor: pointer;
  user-select: none;
  width: 168px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 6px 6px 0px 0px;
  :hover {
    background: rgba(200, 200, 200, 0.4);
  }
`;

const CategoryAll = styled.div`
  border: 1px solid #e4e6eb;

  width: 168px;
  height: 32px;
  cursor: pointer;
  user-select: none;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 6px 6px 0px 0px;
  :hover {
    background: rgba(200, 200, 200, 0.4);
  }
`;

const CategoryWholeWrapper = styled.div`
  position: relative;
`;

const CategoryButton = styled.div`
  border: 1px solid #e4e6eb;
  cursor: pointer;
  user-select: none;
  width: 168px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 6px 6px 0px 0px;
  :hover {
    background: rgba(200, 200, 200, 0.4);
  }
`;

const CategoryWrapper = styled.div<{ categorySelectActive: boolean }>`
  width: 200px;
  height: auto;

  position: absolute;
  top: 32px;
  left: 0px;
  z-index: 1;
  background: white;
  display: ${(props) => (props.categorySelectActive ? "block" : "none")};

  padding: 8px;
  border-radius: 6px;
  box-shadow: 0 12px 28px 0 rgba(0, 0, 0, 0.2), 0 2px 4px 0 rgba(0, 0, 0, 0.1);
`;

const CategoryDiv = styled.div`
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  cursor: pointer;
  user-select: none;
  :hover {
    background: rgba(200, 200, 200, 0.4);
  }
`;

const CategoryInputWrapper = styled.div`
  position: relative;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
`;

const CategoryInput = styled.input`
  border-bottom: 1px solid rgb(206, 208, 212);
  text-align: center;
  font-size: 16px;
  ::placeholder {
    color: #b4b7bc;
  }
`;
const CategoryPlus = styled.div`
  position: absolute;
  bottom: 2px;
  right: 4px;
  width: 28px;
  height: 28px;
  font-size: 28px;
  border-radius: 6px;
  cursor: pointer;
  user-select: none;

  color: rgb(206, 208, 212);
  display: flex;
  align-items: center;
  justify-content: center;
  :hover {
    background: rgba(200, 200, 200, 0.4);
    color: black;
  }
`;

const Bookcase = styled.div`
  border: 1px solid #e4e6eb;
  position: relative;
  margin: 100px 0px;
  width: 902px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  border-radius: 6px;
  background: white;
`;

const BookDiv = styled.div`
  width: 300px;
  height: 340px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  border-radius: 6px;
  :last-child {
    margin-right: auto;
  }
  :hover {
    background: rgba(200, 200, 200, 0.4);
  }
`;

const BookImg = styled.img`
  width: 160px;
  height: 200px;
`;

const BookName = styled.p`
  margin-top: 20px;
  width: 220px;

  border-bottom: 1px solid rgb(206, 208, 212);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const AddToLibrary = styled.div`
  width: 100px;
  height: 30px;
  border: 1px solid black;

  display: flex;
  align-items: center;
  justify-content: center;
`;
