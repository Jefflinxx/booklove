import { useSelector, useDispatch } from "react-redux";
import { actionType } from "../../reducer/rootReducer";
import ReactLoading from "react-loading";

import styled from "styled-components";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../utils/firebase";

import TopSection from "../../components/TopSection/TopSection";

import { User } from "../../reducer/userReducer";
import { CurrentBook } from "../../reducer/currentBookReducer";
import {
  getUserInfo,
  updateCategory,
  addSearchBookToUserLibrary,
  updateWishList,
  updatelendFromList,
  updateUserLibrary,
  updateNotification,
  updateGiveBackAlert,
} from "../../utils/firestore";
import { useNavigate, useLocation } from "react-router-dom";

function Home() {
  const Location = useLocation();
  const dispatch = useDispatch();
  const navigator = useNavigate();
  const user = useSelector((state: { userReducer: User }) => state.userReducer);
  const giveBackAlert = useSelector(
    (state: { giveBackAlertReducer: string[] }) => state.giveBackAlertReducer
  );
  const displayUser = useSelector(
    (state: { displayUserReducer: User }) => state.displayUserReducer
  );
  const library = useSelector(
    (state: { currentLibraryReducer: CurrentBook[] }) =>
      state.currentLibraryReducer
  );
  const displayLibrary = useSelector(
    (state: { displayLibraryReducer: CurrentBook[] }) =>
      state.displayLibraryReducer
  );
  const [categorySelectActive, setCategorySelectActive] =
    useState<boolean>(false);
  const [categoryAllActive, setCategoryAllActive] = useState<boolean>(false);
  const [categoryReadActive, setCategoryReadActive] = useState<boolean>(false);
  const [categoryLendActive, setCategoryLendActive] = useState<boolean>(false);
  const [wishListActive, setWishListActive] = useState<boolean>(false);
  const [lendFromActive, setLendFromActive] = useState<boolean>(false);

  const [barrierBGActive, setBarrierBGActive] = useState<boolean>(false);
  const [notificationAlertActive, setNotificationAlertActive] =
    useState<boolean>(false);
  const [notification, setNotification] = useState<{
    type: string;
    avatar: string;
    uid: string;
    uname: string;
    isbn: string;
    bookname: string;
  }>({ type: "", avatar: "", uid: "", uname: "", isbn: "", bookname: "" });
  const [nAlendFrom, setNAlendFrom] = useState<{
    id: string;
    name: string;
  }>({ id: "", name: "" });

  const [categoryInput, setCategoryInput] = useState<string>("");
  const [categoryCurrent, setCategoryCurrent] = useState<string | null>(null);
  const [render, setRender] = useState<boolean>(false);

  const [c, setC] = useState<string[]>([]);
  const [d, setD] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [wholePageloading, setWholePageLoading] = useState<boolean>(true);

  const localPath = Location.pathname.split("/")[1];

  useEffect(() => {
    //console.log(user);
    // console.log(localPath);
    // console.log(localPath === "");
    setWholePageLoading(true);
    setCategoryCurrent(null);
    setCategoryReadActive(false);
    setCategoryLendActive(false);
    setWishListActive(false);
    setCategorySelectActive(false);
    setLendFromActive(false);
    setCategoryAllActive(false);

    if (user) {
      getUserInfo(user.uid).then((v) => {
        dispatch({
          type: actionType.LIBRARY.SETLIBRARY,
          value: v!.library || [],
        });
      });
      if (localPath === user.uid || localPath === "") {
        getUserInfo(user.uid).then((v) => {
          dispatch({
            type: actionType.DISPLAYUSER.SETDISPLAYUSER,
            value: v,
          });
          dispatch({
            type: actionType.DISPLAYLIBRARY.SETDISPLAYLIBRARY,
            value: v!.library || [],
          });
          setWholePageLoading(false);
        });
      } else {
        getUserInfo(localPath).then((v) => {
          if (!v) {
            dispatch({
              type: actionType.DISPLAYLIBRARY.SETDISPLAYLIBRARY,
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
            setWholePageLoading(false);
          } else if (v) {
            dispatch({
              type: actionType.DISPLAYUSER.SETDISPLAYUSER,
              value: v,
            });
            if (v?.library) {
              let newLibrary: CurrentBook[] = [];
              v?.library.forEach((i) => {
                if (i?.isPublic) {
                  newLibrary.push(i);
                }
              });
              dispatch({
                type: actionType.DISPLAYLIBRARY.SETDISPLAYLIBRARY,
                value: newLibrary,
              });
            }
          }
          setWholePageLoading(false);
        });
      }
    }
  }, [localPath, user]);

  useEffect(() => {
    if (user) {
      getUserInfo(user.uid).then((v) => {
        dispatch({
          type: actionType.USER.SETUSER,
          value: v,
        });
        dispatch({
          type: actionType.GIVEBACK.SETGIVEBACK,
          value: v?.giveBackAlert,
        });
      });
    }
  }, []);

  useEffect(() => {
    console.log("執行");
    //比對 對方的 notification 有沒有這本書 有的話，按鈕改為 已送出請求
    let c: string[] = [];
    let d: string[] = [];

    displayLibrary?.forEach((i) => {
      displayUser.notification?.forEach((j) => {
        if (
          j.isbn === i.isbn &&
          (j.type === "borrow" || j.type === "lendFrom")
        ) {
          c.push(i.isbn);
        }
      });
      if (giveBackAlert) {
        giveBackAlert?.forEach((j) => {
          if (j === i.isbn) {
            d.push(j);
          }
        });
      }
    });
    setC(c);
    setD(d);
  }, [displayLibrary, giveBackAlert]);

  console.log(c, d);

  return (
    <>
      {wholePageloading && (
        <WholePageLoading>
          <ReactLoading type="cylon" color="black" width={100} />
        </WholePageLoading>
      )}
      <BarrierBG
        barrierBGActive={barrierBGActive}
        onClick={(e) => {
          // e.stopPropagation();
        }}
      ></BarrierBG>
      <NotificationAlert notificationAlertActive={notificationAlertActive}>
        <NAP>
          {notification.type === "borrow" &&
            `向${displayUser.uname}發送借閱請求？`}
          {notification.type === "lendFrom" &&
            `向${displayUser.uname}發送出借邀請？`}
          {notification.type === "giveBack" &&
            `向${nAlendFrom.name}發送歸還通知？`}
        </NAP>
        <NABtnWrapper>
          <NAConfirm
            onClick={() => {
              if (notification.type === "borrow") {
                if (displayUser.notification) {
                  updateNotification(localPath, [
                    ...displayUser.notification,
                    notification,
                  ]);
                } else {
                  updateNotification(localPath, [notification]);
                }
                setC([...c, notification.isbn]);
              }
              if (notification.type === "lendFrom") {
                if (displayUser.notification) {
                  updateNotification(localPath, [
                    ...displayUser.notification,
                    notification,
                  ]);
                } else {
                  updateNotification(localPath, [notification]);
                }
                setC([...c, notification.isbn]);
              }
              if (notification.type === "giveBack") {
                if (displayUser.notification) {
                  updateNotification(nAlendFrom.id, [
                    ...displayUser.notification,
                    notification,
                  ]);
                } else {
                  updateNotification(nAlendFrom.id, [notification]);
                }
              }
              //把歸還通知放入自己的資料庫
              //之後對方按取消或確認再幫對方刪掉
              if (user.giveBackAlert) {
                updateGiveBackAlert(user.uid, [
                  ...giveBackAlert,
                  notification.isbn,
                ]);
                dispatch({
                  type: actionType.GIVEBACK.SETGIVEBACK,
                  value: [...giveBackAlert, notification.isbn],
                });
              } else {
                updateGiveBackAlert(user.uid, [notification.isbn]);
              }
              dispatch({
                type: actionType.GIVEBACK.SETGIVEBACK,
                value: [notification.isbn],
              });

              setBarrierBGActive(false);
              setNotificationAlertActive(false);
            }}
          >
            確定
          </NAConfirm>
          <NACancel
            onClick={() => {
              setBarrierBGActive(false);
              setNotificationAlertActive(false);
            }}
          >
            取消
          </NACancel>
        </NABtnWrapper>
      </NotificationAlert>

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
                {library.length || user?.wishList?.length ? (
                  <TopTagWrapper>
                    <TopTagLeftWrapper>
                      <CategoryAll
                        onClick={async () => {
                          setLoading(true);

                          setCategoryCurrent(null);
                          setCategoryReadActive(false);
                          setCategoryLendActive(false);
                          setWishListActive(false);
                          setCategorySelectActive(false);
                          setLendFromActive(false);

                          let a;
                          if (localPath === user.uid || localPath === "") {
                            a = await getUserInfo(user.uid);
                          } else {
                            a = await getUserInfo(localPath);
                            if (!a) return;
                            if (a?.library) {
                              let newLibrary: CurrentBook[] = [];
                              a?.library.forEach((i) => {
                                if (i?.isPublic) {
                                  newLibrary.push(i);
                                }
                              });
                              a = { ...a, library: newLibrary };
                            }
                          }

                          dispatch({
                            type: actionType.DISPLAYLIBRARY.SETDISPLAYLIBRARY,
                            value: a?.library || [],
                          });

                          setLoading(false);
                          setCategoryAllActive(true);
                        }}
                      >
                        全部{categoryAllActive && `(${displayLibrary.length})`}
                      </CategoryAll>

                      <FinishRead
                        onClick={async () => {
                          setLoading(true);

                          setCategoryCurrent(null);
                          setCategoryAllActive(false);
                          setCategoryLendActive(false);
                          setWishListActive(false);
                          setCategorySelectActive(false);
                          setLendFromActive(false);
                          let categoryResult: CurrentBook[] = [];

                          let a;
                          if (localPath === user.uid || localPath === "") {
                            a = await getUserInfo(user.uid);
                          } else {
                            a = await getUserInfo(localPath);
                            if (!a) return;
                            if (a?.library) {
                              let newLibrary: CurrentBook[] = [];
                              a?.library.forEach((i) => {
                                if (i?.isPublic) {
                                  newLibrary.push(i);
                                }
                              });
                              a = { ...a, library: newLibrary };
                            }
                          }

                          a?.library?.forEach((j) => {
                            if (j?.isFinishRead) {
                              categoryResult = [...categoryResult, j];
                            }
                          });
                          dispatch({
                            type: actionType.DISPLAYLIBRARY.SETDISPLAYLIBRARY,
                            value: categoryResult,
                          });

                          setLoading(false);
                          setCategoryReadActive(true);
                        }}
                      >
                        完成閱讀
                        {categoryReadActive && `(${displayLibrary.length})`}
                      </FinishRead>

                      <LendToOther
                        onClick={async () => {
                          setLoading(true);

                          setCategoryCurrent(null);
                          setCategoryAllActive(false);
                          setCategoryReadActive(false);
                          setWishListActive(false);
                          setCategorySelectActive(false);
                          setLendFromActive(false);
                          let categoryResult: CurrentBook[] = [];

                          let a;
                          if (localPath === user.uid || localPath === "") {
                            a = await getUserInfo(user.uid);
                          } else {
                            a = await getUserInfo(localPath);
                            if (!a) return;
                            if (a?.library) {
                              let newLibrary: CurrentBook[] = [];
                              a?.library.forEach((i) => {
                                if (i?.isPublic) {
                                  newLibrary.push(i);
                                }
                              });
                              a = { ...a, library: newLibrary };
                            }
                          }

                          a?.library?.forEach((j) => {
                            if (j?.isLendTo) {
                              categoryResult = [...categoryResult, j];
                            }
                          });
                          dispatch({
                            type: actionType.DISPLAYLIBRARY.SETDISPLAYLIBRARY,
                            value: categoryResult,
                          });

                          setLoading(false);
                          setCategoryLendActive(true);
                        }}
                      >
                        出借中
                        {categoryLendActive && `(${displayLibrary.length})`}
                      </LendToOther>
                      <CategoryWholeWrapper>
                        <CategoryButton
                          onClick={() => {
                            setCategorySelectActive(!categorySelectActive);
                            setCategoryAllActive(false);
                            setCategoryReadActive(false);
                            setCategoryLendActive(false);
                            setWishListActive(false);
                            setLendFromActive(false);
                          }}
                        >
                          類別
                          {categoryCurrent &&
                            `:${categoryCurrent}(${displayLibrary?.length})`}
                        </CategoryButton>
                        <CategoryWrapper
                          categorySelectActive={categorySelectActive}
                        >
                          {!localPath && (
                            <CategoryInputWrapper>
                              <CategoryInput
                                placeholder="新增類別"
                                onChange={(e) => {
                                  setCategoryInput(e.target.value);
                                }}
                              />
                              <CategoryPlus
                                onClick={() => {
                                  if (
                                    displayUser?.category &&
                                    displayUser?.category.find(
                                      (j) => j === categoryInput
                                    )
                                  ) {
                                    return;
                                  } else if (displayUser?.category) {
                                    updateCategory(user.uid, [
                                      ...displayUser.category,
                                      categoryInput,
                                    ]);
                                    dispatch({
                                      type: actionType.DISPLAYUSER
                                        .SETDISPLAYUSER,
                                      value: {
                                        ...displayUser,
                                        category: [
                                          ...displayUser.category,
                                          categoryInput,
                                        ],
                                      },
                                    });
                                  } else {
                                    updateCategory(user.uid, [categoryInput]);
                                    dispatch({
                                      type: actionType.DISPLAYUSER
                                        .SETDISPLAYUSER,
                                      value: {
                                        ...displayUser,
                                        category: [categoryInput],
                                      },
                                    });
                                  }
                                }}
                              >
                                +
                              </CategoryPlus>
                            </CategoryInputWrapper>
                          )}
                          {displayUser?.category?.length || !localPath ? (
                            <></>
                          ) : (
                            <NoCategoryWrapper>
                              <NoCategoryP>沒有類別</NoCategoryP>
                            </NoCategoryWrapper>
                          )}

                          {displayUser?.category?.map((i) => {
                            return (
                              <CategoryDiv
                                key={i}
                                onClick={async () => {
                                  setLoading(true);
                                  setCategorySelectActive(false);
                                  setCategoryAllActive(false);
                                  setCategoryReadActive(false);
                                  setCategoryLendActive(false);
                                  setWishListActive(false);
                                  setLendFromActive(false);

                                  let categoryResult: CurrentBook[] = [];

                                  let a;
                                  if (
                                    localPath === user.uid ||
                                    localPath === ""
                                  ) {
                                    a = await getUserInfo(user.uid);
                                  } else {
                                    a = await getUserInfo(localPath);
                                    if (!a) return;
                                    if (a?.library) {
                                      let newLibrary: CurrentBook[] = [];
                                      a?.library.forEach((i) => {
                                        if (i?.isPublic) {
                                          newLibrary.push(i);
                                        }
                                      });
                                      a = { ...a, library: newLibrary };
                                    }
                                  }

                                  a?.library?.forEach((j) => {
                                    j?.category?.forEach((k) => {
                                      if (k === i) {
                                        categoryResult = [...categoryResult, j];
                                      }
                                    });
                                  });
                                  dispatch({
                                    type: actionType.DISPLAYLIBRARY
                                      .SETDISPLAYLIBRARY,
                                    value: categoryResult,
                                  });

                                  setLoading(false);
                                  setCategoryCurrent(i);
                                }}
                              >
                                {i}
                                <DeleteCategory
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (displayUser?.category) {
                                      //遍歷每本書去把這項類別清除
                                      let libraryBook: CurrentBook[] = [];
                                      getUserInfo(user.uid).then((v) => {
                                        v?.library.forEach((k) => {
                                          libraryBook.push({
                                            ...k,
                                            category:
                                              k.category?.filter(
                                                (l) => l !== i
                                              ) || [],
                                          });
                                        });

                                        updateUserLibrary(
                                          user.uid,
                                          libraryBook
                                        );
                                        dispatch({
                                          type: actionType.DISPLAYLIBRARY
                                            .SETDISPLAYLIBRARY,
                                          value: libraryBook,
                                        });
                                      });

                                      //刪除類別
                                      updateCategory(
                                        user.uid,
                                        displayUser?.category.filter(
                                          (j) => j !== i
                                        )
                                      );
                                      dispatch({
                                        type: actionType.DISPLAYUSER
                                          .SETDISPLAYUSER,
                                        value: {
                                          ...displayUser,
                                          category:
                                            displayUser?.category.filter(
                                              (j) => j !== i
                                            ),
                                        },
                                      });
                                    }
                                  }}
                                >
                                  ✗
                                </DeleteCategory>
                              </CategoryDiv>
                            );
                          })}
                        </CategoryWrapper>
                      </CategoryWholeWrapper>
                    </TopTagLeftWrapper>
                    <TopTagRightWrapper>
                      <LendFromFriend
                        onClick={async () => {
                          setLoading(true);

                          setCategoryCurrent(null);
                          setCategoryAllActive(false);
                          setCategoryReadActive(false);
                          setCategoryLendActive(false);
                          setCategorySelectActive(false);
                          setWishListActive(false);

                          let a;
                          if (localPath === user.uid || localPath === "") {
                            a = await getUserInfo(user.uid);
                          } else {
                            a = await getUserInfo(localPath);
                            if (!a) return;
                          }

                          dispatch({
                            type: actionType.DISPLAYLIBRARY.SETDISPLAYLIBRARY,
                            value: a?.lendFromList || [],
                          });

                          setLoading(false);
                          setLendFromActive(true);
                        }}
                      >
                        借入書籍{lendFromActive && `(${displayLibrary.length})`}
                      </LendFromFriend>
                      <WishList
                        onClick={async () => {
                          setLoading(true);

                          setCategoryCurrent(null);
                          setCategoryAllActive(false);
                          setCategoryReadActive(false);
                          setCategoryLendActive(false);
                          setCategorySelectActive(false);
                          setLendFromActive(false);

                          let a;
                          if (localPath === user.uid || localPath === "") {
                            a = await getUserInfo(user.uid);
                          } else {
                            a = await getUserInfo(localPath);
                            if (!a) return;
                          }

                          dispatch({
                            type: actionType.DISPLAYLIBRARY.SETDISPLAYLIBRARY,
                            value: a?.wishList || [],
                          });

                          setLoading(false);
                          setWishListActive(true);
                        }}
                      >
                        願望清單{wishListActive && `(${displayLibrary.length})`}
                      </WishList>
                    </TopTagRightWrapper>
                  </TopTagWrapper>
                ) : (
                  <NoLibraryDiv>
                    <NoLibrary>歡迎點擊</NoLibrary>
                    <NoLibraryPlusIconDiv
                      onClick={() => {
                        navigator("./search");
                      }}
                    >
                      +
                    </NoLibraryPlusIconDiv>
                    <NoLibrary>加入圖書</NoLibrary>
                  </NoLibraryDiv>
                )}
                {loading && (
                  <BookcaseLoading>
                    <ReactLoading type="cylon" color="black" width={100} />
                  </BookcaseLoading>
                )}
                {displayLibrary?.map((i) => {
                  //去別人的願望清單借給別人書
                  let a = false;
                  //借出朋友用的，這邊是user沒錯
                  user?.library?.forEach((j) => {
                    if (j.isbn === i.isbn) {
                      a = true;
                    }
                  });
                  //去別人的書櫃跟別人借書 確認自己沒有這本書 且也沒有正在借同本書中
                  let b = false;
                  user?.library?.forEach((j) => {
                    if (j.isbn === i.isbn) {
                      b = true;
                    }
                  });
                  user?.lendFromList?.forEach((j) => {
                    if (j.isbn === i.isbn) {
                      b = true;
                    }
                  });

                  return (
                    <BookDiv
                      key={i.isbn}
                      onClick={() => {
                        if (!wishListActive && !lendFromActive) {
                          dispatch({
                            type: actionType.BOOK.SETBOOKDATA,
                            value: i,
                          });
                          if (localPath) {
                            navigator(`../book/${localPath}${i.isbn}`);
                          } else {
                            navigator(`./book/${user.uid}${i.isbn}`);
                          }
                        }
                      }}
                    >
                      <BookImg src={i.cover}></BookImg>
                      <BookName>{i.bookname}</BookName>
                      {localPath &&
                        !wishListActive &&
                        !lendFromActive &&
                        !b &&
                        !c.find((j) => i.isbn === j) && (
                          <>
                            <BorrowFrom
                              $b={b}
                              $c={c.find((j) => i.isbn === j)}
                              onClick={(e) => {
                                e.stopPropagation();
                                setBarrierBGActive(true);
                                setNotificationAlertActive(true);
                                setNotification({
                                  type: "borrow",
                                  avatar: user.avatar,
                                  uid: user.uid,
                                  uname: user.uname,
                                  isbn: i.isbn,
                                  bookname: i.bookname,
                                });
                              }}
                            >
                              借書
                            </BorrowFrom>
                          </>
                        )}
                      {localPath &&
                        !wishListActive &&
                        !lendFromActive &&
                        !b &&
                        c.find((j) => i.isbn === j) && (
                          <BorrowFrom
                            $b={b}
                            $c={c.find((j) => i.isbn === j)}
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                          >
                            已送出請求
                          </BorrowFrom>
                        )}
                      {localPath && !wishListActive && !lendFromActive && b && (
                        <BorrowFrom
                          $b={b}
                          $c={c.find((j) => i.isbn === j)}
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          已有此書
                        </BorrowFrom>
                      )}
                      {wishListActive && !localPath && (
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
                              type: actionType.DISPLAYLIBRARY.SETDISPLAYLIBRARY,
                              value:
                                a?.wishList?.filter((j) => j.isbn !== i.isbn) ||
                                [],
                            });
                          }}
                        >
                          加入書櫃
                        </AddToLibrary>
                      )}
                      {wishListActive &&
                        localPath &&
                        a &&
                        !c.find((j) => i.isbn === j) && (
                          <LendToFriend
                            $a={a}
                            $c={c.find((j) => i.isbn === j)}
                            onClick={() => {
                              setBarrierBGActive(true);
                              setNotificationAlertActive(true);
                              setNotification({
                                type: "lendFrom",
                                avatar: user.avatar,
                                uid: user.uid,
                                uname: user.uname,
                                isbn: i.isbn,
                                bookname: i.bookname,
                              });
                            }}
                          >
                            出借好友
                          </LendToFriend>
                        )}
                      {wishListActive &&
                        localPath &&
                        a &&
                        c.find((j) => i.isbn === j) && (
                          <LendToFriend $a={a} $c={c.find((j) => i.isbn === j)}>
                            已送出請求
                          </LendToFriend>
                        )}
                      {lendFromActive &&
                        !localPath &&
                        !d.find((j) => i.isbn === j) && (
                          <GiveBackBtn
                            $d={d.find((j) => i.isbn === j)}
                            onClick={() => {
                              setBarrierBGActive(true);
                              setNotificationAlertActive(true);
                              setNotification({
                                type: "giveBack",
                                avatar: user.avatar,
                                uid: user.uid,
                                uname: user.uname,
                                isbn: i.isbn,
                                bookname: i.bookname,
                              });
                              setNAlendFrom({
                                id: i.lendFrom,
                                name: i.lendFromName,
                              });
                            }}
                          >
                            歸還
                          </GiveBackBtn>
                        )}
                      {lendFromActive &&
                        !localPath &&
                        d.find((j) => i.isbn === j) && (
                          <GiveBackBtn $d={d.find((j) => i.isbn === j)}>
                            已送出請求
                          </GiveBackBtn>
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

const WholePageLoading = styled.div`
  position: fixed;
  top: 0px;
  left: 0px;
  width: 100vw;
  height: 100vh;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 5;
`;

const BarrierBG = styled.div<{ barrierBGActive: boolean }>`
  width: 100vw;
  height: 100vh;
  position: fixed;
  top: 0px;
  left: 0px;
  z-index: 2;

  display: ${(props) => (props.barrierBGActive ? "block" : "none")};
`;

const NotificationAlert = styled.div<{ notificationAlertActive: boolean }>`
  width: 420px;
  height: 360px;
  border: 1px solid black;
  background: white;
  display: ${(props) => (props.notificationAlertActive ? "block" : "none")};

  position: fixed;
  top: 50vh;
  left: 50vw;
  transform: translate(-50%, -50%);
  z-index: 3;
`;

const NAP = styled.div``;
const NABtnWrapper = styled.div`
  display: flex;
`;
const NAConfirm = styled.div`
  width: 100px;
  border: 1px solid black;
`;
const NACancel = styled.div`
  width: 100px;
  border: 1px solid black;
`;

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
  width: 1186px;
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
    if (props.localPath === props.$uid || props.localPath === "") {
      return "flex";
    } else return "none";
  }};
`;

//上面的標籤
const TopTagWrapper = styled.div`
  width: 1172px;
  position: absolute;
  top: -36px;
  left: 0px;
  display: flex;
  justify-content: space-between;
`;

const TopTagLeftWrapper = styled.div`
  display: flex;
  padding-left: 2px;
`;

const TopTagRightWrapper = styled.div`
  display: flex;
  padding-right: 2px;
`;

const LendFromFriend = styled.div`
  border: 1px solid #e4e6eb;
  cursor: pointer;
  user-select: none;
  width: 168px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 6px 6px 0px 0px;
  :hover {
    background: rgba(200, 200, 200, 0.4);
  }
`;

const WishList = styled.div`
  border: 1px solid #e4e6eb;
  cursor: pointer;
  user-select: none;
  width: 168px;
  height: 36px;
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
  height: 36px;
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
  height: 36px;
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
  height: 36px;
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
  height: 36px;
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
  top: 36px;
  left: 0px;
  z-index: 1;
  background: white;
  display: ${(props) => (props.categorySelectActive ? "block" : "none")};

  padding: 8px;
  border-radius: 6px;
  box-shadow: 0 12px 28px 0 rgba(0, 0, 0, 0.2), 0 2px 4px 0 rgba(0, 0, 0, 0.1);
`;

const NoCategoryWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;
const NoCategoryP = styled.p``;

const CategoryDiv = styled.div`
  position: relative;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  cursor: pointer;
  user-select: none;
  margin: 0px 24px;
  :hover {
    background: rgba(200, 200, 200, 0.4);
  }
`;

const DeleteCategory = styled.div`
  position: absolute;
  right: -24px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid black;
  background: white;
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
  width: 1172px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  border-radius: 6px;
  background: white;
`;

const BookcaseLoading = styled.div`
  position: absolute;
  top: 0px;
  left: 0px;
  width: 100%;
  height: 100%;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const BookDiv = styled.div`
  width: 390px;

  height: 400px;
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

const BorrowFrom = styled.div<{ $b: boolean; $c: string | undefined }>`
  margin-top: 16px;
  width: 120px;
  height: 36px;

  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${(props) =>
    props.$b || props.$c ? "rgba(200, 200, 200, 0.4)" : "#eff2f5"};
  cursor: ${(props) => (props.$b || props.$c ? "not-allowed" : "point")};
  :hover {
    background: ${(props) =>
      props.$b || props.$c ? "" : "rgba(200, 200, 200, 0.4)"};
  }
`;

const AddToLibrary = styled.div`
margin-top:16px;
  width: 120px;
  height: 36px;

  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #eff2f5;
}
:hover {
  background: rgba(200, 200, 200, 0.4);
}
`;

const LendToFriend = styled.div<{ $a: boolean; $c: string | undefined }>`
  margin-top: 16px;
  width: 120px;
  height: 36px;

  border-radius: 6px;
  background: ${(props) => (props.$c ? "rgba(200, 200, 200, 0.4)" : "#eff2f5")};
  cursor: ${(props) => (props.$c ? "not-allowed" : "point")};
  :hover {
    background: ${(props) => (props.$c ? "" : "rgba(200, 200, 200, 0.4)")};
  }

  display: flex;
  align-items: center;
  justify-content: center;
`;

const GiveBackBtn = styled.div<{ $d: string | undefined }>`
  margin-top: 16px;
  width: 120px;
  height: 36px;

  border-radius: 6px;
  background: ${(props) => (props.$d ? "rgba(200, 200, 200, 0.4)" : "#eff2f5")};
  cursor: ${(props) => (props.$d ? "not-allowed" : "point")};
  :hover {
    background: ${(props) => (props.$d ? "" : "rgba(200, 200, 200, 0.4)")};
  }

  display: flex;
  align-items: center;
  justify-content: center;
`;

const NoLibraryDiv = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const NoLibrary = styled.div``;

const NoLibraryPlusIconDiv = styled.div`
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
  margin: 16px 16px;
  display: flex;
`;
