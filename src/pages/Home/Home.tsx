import { useSelector, useDispatch } from "react-redux";
import { actionType } from "../../reducer/rootReducer";
import ReactLoading from "react-loading";
import styled from "styled-components";
import { useEffect, useState } from "react";
import TopSection from "../../components/TopSection/TopSection";
import { User } from "../../reducer/userReducer";
import { CurrentBook } from "../../reducer/currentBookReducer";
import {
  getUserInfo,
  updateCategory,
  addSearchBookToUserLibrary,
  updateWishList,
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
  const [
    bookforLendOrBorrowInOthersNotification,
    setBookforLendOrBorrowInOthersNotification,
  ] = useState<string[]>([]);
  const [
    bookforGivebackInOthersNotification,
    setBookforGivebackInOthersNotification,
  ] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [wholePageloading, setWholePageLoading] = useState<boolean>(true);

  const localPath = Location.pathname.split("/")[1];

  useEffect(() => {
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

        dispatch({
          type: actionType.GIVEBACK.SETGIVEBACK,
          value: v?.giveBackAlert || [],
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
            } else {
              dispatch({
                type: actionType.DISPLAYLIBRARY.SETDISPLAYLIBRARY,
                value: [],
              });
            }
          }
          setWholePageLoading(false);
        });
      }
    }
  }, [localPath, user]);

  useEffect(() => {
    let bookforLendOrBorrowInOthersNotification: string[] = [];
    let bookforGivebackInOthersNotification: string[] = [];

    displayLibrary?.forEach((i) => {
      displayUser?.notification?.forEach((j) => {
        if (
          j.isbn === i.isbn &&
          (j.type === "borrow" || j.type === "lendFrom")
        ) {
          bookforLendOrBorrowInOthersNotification.push(i.isbn);
        }
      });
      if (giveBackAlert) {
        giveBackAlert?.forEach((j) => {
          if (j === i.isbn) {
            bookforGivebackInOthersNotification.push(j);
          }
        });
      }
    });
    setBookforLendOrBorrowInOthersNotification(
      bookforLendOrBorrowInOthersNotification
    );
    setBookforGivebackInOthersNotification(bookforGivebackInOthersNotification);
  }, [displayLibrary, giveBackAlert]);

  return (
    <>
      {wholePageloading && (
        <WholePageLoading>
          <ReactLoading type="cylon" color="black" width={100} />
        </WholePageLoading>
      )}
      <BarrierBG barrierBGActive={barrierBGActive}></BarrierBG>
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
                getUserInfo(displayUser.uid).then((v) => {
                  if (v?.notification) {
                    updateNotification(localPath, [
                      ...v?.notification,
                      notification,
                    ]);
                  } else {
                    updateNotification(localPath, [notification]);
                  }
                  setBookforLendOrBorrowInOthersNotification([
                    ...bookforLendOrBorrowInOthersNotification,
                    notification.isbn,
                  ]);
                });
              }
              if (notification.type === "lendFrom") {
                getUserInfo(displayUser.uid).then((v) => {
                  if (v?.notification) {
                    updateNotification(localPath, [
                      ...v?.notification,
                      notification,
                    ]);
                  } else {
                    updateNotification(localPath, [notification]);
                  }
                  setBookforLendOrBorrowInOthersNotification([
                    ...bookforLendOrBorrowInOthersNotification,
                    notification.isbn,
                  ]);
                });
              }

              if (notification.type === "giveBack") {
                getUserInfo(nAlendFrom.id).then((v) => {
                  if (v?.notification) {
                    updateNotification(nAlendFrom.id, [
                      ...v?.notification,
                      notification,
                    ]);
                  } else {
                    updateNotification(nAlendFrom.id, [notification]);
                  }
                });

                if (giveBackAlert) {
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
                  dispatch({
                    type: actionType.GIVEBACK.SETGIVEBACK,
                    value: [notification.isbn],
                  });
                }
              }

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
              {library.length || user?.wishList?.length || localPath ? (
                <TopTagWrapper>
                  <CategoryAll
                    $active={categoryAllActive}
                    onClick={async () => {
                      setLoading(true);

                      setCategoryCurrent(null);
                      setCategoryReadActive(false);
                      setCategoryLendActive(false);
                      setWishListActive(false);
                      setCategorySelectActive(false);
                      setLendFromActive(false);

                      let userData;
                      if (localPath === user.uid || localPath === "") {
                        userData = await getUserInfo(user.uid);
                      } else {
                        userData = await getUserInfo(localPath);
                        if (!userData) return;
                        if (userData?.library) {
                          let newLibrary: CurrentBook[] = [];
                          userData?.library.forEach((i) => {
                            if (i?.isPublic) {
                              newLibrary.push(i);
                            }
                          });
                          userData = { ...userData, library: newLibrary };
                        }
                      }

                      dispatch({
                        type: actionType.DISPLAYLIBRARY.SETDISPLAYLIBRARY,
                        value: userData?.library || [],
                      });

                      setLoading(false);
                      setCategoryAllActive(true);
                    }}
                  >
                    全部{categoryAllActive && `(${displayLibrary.length})`}
                  </CategoryAll>
                  <Split />
                  <FinishRead
                    $active={categoryReadActive}
                    onClick={async () => {
                      setLoading(true);
                      setCategoryCurrent(null);
                      setCategoryAllActive(false);
                      setCategoryLendActive(false);
                      setWishListActive(false);
                      setCategorySelectActive(false);
                      setLendFromActive(false);
                      let categoryResult: CurrentBook[] = [];
                      let userData;
                      if (localPath === user.uid || localPath === "") {
                        userData = await getUserInfo(user.uid);
                      } else {
                        userData = await getUserInfo(localPath);
                        if (!userData) return;
                        if (userData?.library) {
                          let newLibrary: CurrentBook[] = [];
                          userData?.library.forEach((i) => {
                            if (i?.isPublic) {
                              newLibrary.push(i);
                            }
                          });
                          userData = { ...userData, library: newLibrary };
                        }
                      }

                      userData?.library?.forEach((j) => {
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
                  <Split />
                  <LendToOther
                    $active={categoryLendActive}
                    onClick={async () => {
                      setLoading(true);

                      setCategoryCurrent(null);
                      setCategoryAllActive(false);
                      setCategoryReadActive(false);
                      setWishListActive(false);
                      setCategorySelectActive(false);
                      setLendFromActive(false);
                      let categoryResult: CurrentBook[] = [];

                      let userData;
                      if (localPath === user.uid || localPath === "") {
                        userData = await getUserInfo(user.uid);
                      } else {
                        userData = await getUserInfo(localPath);
                        if (!userData) return;
                        if (userData?.library) {
                          let newLibrary: CurrentBook[] = [];
                          userData?.library.forEach((i) => {
                            if (i?.isPublic) {
                              newLibrary.push(i);
                            }
                          });
                          userData = { ...userData, library: newLibrary };
                        }
                      }

                      userData?.library?.forEach((j) => {
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
                  <Split />
                  <CategoryWholeWrapper>
                    <CategoryButton
                      $active={categoryCurrent}
                      onClick={() => {
                        setCategorySelectActive(!categorySelectActive);
                        setCategoryAllActive(false);
                        setCategoryReadActive(false);
                        setCategoryLendActive(false);
                        setWishListActive(false);
                        setLendFromActive(false);
                      }}
                    >
                      {!categoryCurrent && "類別"}
                      {categoryCurrent &&
                        `${categoryCurrent}(${displayLibrary?.length})`}
                    </CategoryButton>
                    <CategoryWrapper
                      categorySelectActive={categorySelectActive}
                    >
                      {!localPath && (
                        <CategoryInputWrapper>
                          <CategoryInput
                            placeholder="新增類別"
                            value={categoryInput}
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
                              } else if (categoryInput.trim() === "") {
                                return;
                              } else if (displayUser?.category) {
                                updateCategory(user.uid, [
                                  ...displayUser.category,
                                  categoryInput,
                                ]);
                                dispatch({
                                  type: actionType.DISPLAYUSER.SETDISPLAYUSER,
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
                                  type: actionType.DISPLAYUSER.SETDISPLAYUSER,
                                  value: {
                                    ...displayUser,
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

                              let userData;
                              if (localPath === user.uid || localPath === "") {
                                userData = await getUserInfo(user.uid);
                              } else {
                                userData = await getUserInfo(localPath);
                                if (!userData) return;
                                if (userData?.library) {
                                  let newLibrary: CurrentBook[] = [];
                                  userData?.library.forEach((i) => {
                                    if (i?.isPublic) {
                                      newLibrary.push(i);
                                    }
                                  });
                                  userData = {
                                    ...userData,
                                    library: newLibrary,
                                  };
                                }
                              }

                              userData?.library?.forEach((j) => {
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
                            <CategoryDivP>{i}</CategoryDivP>

                            <DeleteCategory
                              onClick={(e) => {
                                e.stopPropagation();
                                if (displayUser?.category) {
                                  let libraryBook: CurrentBook[] = [];
                                  getUserInfo(user.uid).then((v) => {
                                    v?.library.forEach((k) => {
                                      libraryBook.push({
                                        ...k,
                                        category:
                                          k.category?.filter((l) => l !== i) ||
                                          [],
                                      });
                                    });

                                    updateUserLibrary(user.uid, libraryBook);
                                    dispatch({
                                      type: actionType.DISPLAYLIBRARY
                                        .SETDISPLAYLIBRARY,
                                      value: libraryBook,
                                    });
                                  });
                                  updateCategory(
                                    user.uid,
                                    displayUser?.category.filter((j) => j !== i)
                                  );
                                  dispatch({
                                    type: actionType.DISPLAYUSER.SETDISPLAYUSER,
                                    value: {
                                      ...displayUser,
                                      category: displayUser?.category.filter(
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
                  <Split />
                  <LendFromFriend
                    $active={lendFromActive}
                    onClick={async () => {
                      setLoading(true);

                      setCategoryCurrent(null);
                      setCategoryAllActive(false);
                      setCategoryReadActive(false);
                      setCategoryLendActive(false);
                      setCategorySelectActive(false);
                      setWishListActive(false);

                      let userData;
                      if (localPath === user.uid || localPath === "") {
                        userData = await getUserInfo(user.uid);
                      } else {
                        userData = await getUserInfo(localPath);
                        if (!userData) return;
                      }

                      dispatch({
                        type: actionType.DISPLAYLIBRARY.SETDISPLAYLIBRARY,
                        value: userData?.lendFromList || [],
                      });
                      if (localPath === user.uid || localPath === "") {
                        dispatch({
                          type: actionType.GIVEBACK.SETGIVEBACK,
                          value: userData?.giveBackAlert || [],
                        });
                      }

                      setLoading(false);
                      setLendFromActive(true);
                    }}
                  >
                    借入書籍{lendFromActive && `(${displayLibrary.length})`}
                  </LendFromFriend>
                  <Split />
                  <WishList
                    $active={wishListActive}
                    onClick={async () => {
                      setLoading(true);

                      setCategoryCurrent(null);
                      setCategoryAllActive(false);
                      setCategoryReadActive(false);
                      setCategoryLendActive(false);
                      setCategorySelectActive(false);
                      setLendFromActive(false);

                      let userData;
                      if (localPath === user.uid || localPath === "") {
                        userData = await getUserInfo(user.uid);
                      } else {
                        userData = await getUserInfo(localPath);
                        if (!userData) return;
                      }

                      dispatch({
                        type: actionType.DISPLAYLIBRARY.SETDISPLAYLIBRARY,
                        value: userData?.wishList || [],
                      });

                      setLoading(false);
                      setWishListActive(true);
                    }}
                  >
                    願望清單{wishListActive && `(${displayLibrary.length})`}
                  </WishList>
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
            </Center>
            <Center>
              <Bookcase>
                {loading && (
                  <BookcaseLoading>
                    <ReactLoading type="cylon" color="black" width={100} />
                  </BookcaseLoading>
                )}
                {displayLibrary?.map((i) => {
                  const hasBookinWishList = !!user?.library?.find(
                    (j) => j.isbn === i.isbn
                  );

                  const libraryHasThisBook = user?.library?.find(
                    (j) => j.isbn === i.isbn
                  );
                  const lendFromListHasThisBook = user?.lendFromList?.find(
                    (j) => j.isbn === i.isbn
                  );
                  const hasBookinLibrary = !!(
                    libraryHasThisBook || lendFromListHasThisBook
                  );

                  return (
                    <BookDiv
                      $w={wishListActive}
                      $l={lendFromActive}
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
                        !hasBookinLibrary &&
                        !bookforLendOrBorrowInOthersNotification.find(
                          (j) => i.isbn === j
                        ) && (
                          <>
                            <BorrowFrom
                              $hasBookinLibrary={hasBookinLibrary}
                              $bookforLendOrBorrowInOthersNotification={bookforLendOrBorrowInOthersNotification.find(
                                (j) => i.isbn === j
                              )}
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
                        !hasBookinLibrary &&
                        bookforLendOrBorrowInOthersNotification.find(
                          (j) => i.isbn === j
                        ) && (
                          <BorrowFrom
                            $hasBookinLibrary={hasBookinLibrary}
                            $bookforLendOrBorrowInOthersNotification={bookforLendOrBorrowInOthersNotification.find(
                              (j) => i.isbn === j
                            )}
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                          >
                            已送出請求
                          </BorrowFrom>
                        )}
                      {localPath &&
                        !wishListActive &&
                        !lendFromActive &&
                        hasBookinLibrary && (
                          <BorrowFrom
                            $hasBookinLibrary={hasBookinLibrary}
                            $bookforLendOrBorrowInOthersNotification={bookforLendOrBorrowInOthersNotification.find(
                              (j) => i.isbn === j
                            )}
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
                            const userData = await getUserInfo(user.uid);
                            updateWishList(
                              user.uid,
                              userData?.wishList?.filter(
                                (j) => j.isbn !== i.isbn
                              ) || []
                            );
                            dispatch({
                              type: actionType.DISPLAYLIBRARY.SETDISPLAYLIBRARY,
                              value:
                                userData?.wishList?.filter(
                                  (j) => j.isbn !== i.isbn
                                ) || [],
                            });
                            dispatch({
                              type: actionType.USER.SETUSER,
                              value: {
                                ...userData,
                                wishList:
                                  userData?.wishList?.filter(
                                    (j) => j.isbn !== i.isbn
                                  ) || [],
                              },
                            });
                          }}
                        >
                          加入書櫃
                        </AddToLibrary>
                      )}
                      {wishListActive &&
                        localPath &&
                        hasBookinWishList &&
                        !bookforLendOrBorrowInOthersNotification.find(
                          (j) => i.isbn === j
                        ) && (
                          <LendToFriend
                            $hasBookinWishList={hasBookinWishList}
                            $bookforLendOrBorrowInOthersNotification={bookforLendOrBorrowInOthersNotification.find(
                              (j) => i.isbn === j
                            )}
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
                      {wishListActive && localPath && !hasBookinWishList && (
                        <Space />
                      )}
                      {wishListActive &&
                        localPath &&
                        hasBookinWishList &&
                        bookforLendOrBorrowInOthersNotification.find(
                          (j) => i.isbn === j
                        ) && (
                          <LendToFriend
                            $hasBookinWishList={hasBookinWishList}
                            $bookforLendOrBorrowInOthersNotification={bookforLendOrBorrowInOthersNotification.find(
                              (j) => i.isbn === j
                            )}
                          >
                            已送出請求
                          </LendToFriend>
                        )}
                      {lendFromActive && !localPath && (
                        <LendFromNameP>{`來自:${i.lendFromName}`}</LendFromNameP>
                      )}
                      {lendFromActive &&
                        !localPath &&
                        !bookforGivebackInOthersNotification.find(
                          (j) => i.isbn === j
                        ) && (
                          <>
                            <GiveBackBtn
                              $bookforGivebackInOthersNotification={bookforGivebackInOthersNotification.find(
                                (j) => i.isbn === j
                              )}
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
                                if (i.lendFrom && i.lendFromName)
                                  setNAlendFrom({
                                    id: i.lendFrom,
                                    name: i.lendFromName,
                                  });
                              }}
                            >
                              歸還
                            </GiveBackBtn>
                          </>
                        )}
                      {lendFromActive &&
                        !localPath &&
                        bookforGivebackInOthersNotification.find(
                          (j) => i.isbn === j
                        ) && (
                          <GiveBackBtn
                            $bookforGivebackInOthersNotification={bookforGivebackInOthersNotification.find(
                              (j) => i.isbn === j
                            )}
                          >
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
  background: #f6d4ba;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 20;
`;

const BarrierBG = styled.div<{ barrierBGActive: boolean }>`
  width: 100vw;
  height: 100vh;
  position: fixed;
  top: 0px;
  left: 0px;
  z-index: 21;

  display: ${(props) => (props.barrierBGActive ? "block" : "none")};
`;

const NotificationAlert = styled.div<{ notificationAlertActive: boolean }>`
  width: 420px;
  height: 160px;
  border: 1px solid #fefadc;
  background: #fefadc;
  border: 8px solid #f3b391;
  border-radius: 6px;
  display: ${(props) => (props.notificationAlertActive ? "block" : "none")};
  font-size: 24px;
  position: fixed;
  top: 50vh;
  left: 50vw;
  transform: translate(-50%, -50%);
  z-index: 22;
  color: #3f612d;

  @media screen and (max-width: 470px) {
    left: 0;
    width: calc(100vw - 15px);
    transform: translate(0, 0);
  }
`;

const NAP = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 70px;
`;

const NABtnWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 70px;
`;

const NAConfirm = styled.div`
  width: 100px;
  border: 2px solid #f3b391;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 32px;
  border-radius: 6px;
`;

const NACancel = styled.div`
  width: 100px;
  border: 2px solid #f3b391;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
`;

const WholeWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  background: #f6d4ba;
  padding-top: 616px;
  min-height: 100vh;
`;

const CenterWrapper = styled.div`
  width: 1080px;

  @media screen and (max-width: 1100px) {
    width: 100%;
  }
`;

const Center = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const PlusIconDivWrapper = styled.div`
  width: 1186px;
  height: 24px;
  position: relative;

  @media screen and (max-width: 1100px) {
    width: 100%;
  }
  @media screen and (max-width: 830px) {
  }
  @media screen and (max-width: 560px) {
  }
`;

const PlusIconDiv = styled.div<{ localPath: string; $uid: string }>`
  position: absolute;
  top: -100px;
  right: 36px;
  width: 48px;
  height: 36px;
  border-radius: 6px;
  background: #f6d4ba;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  font-weight: 500;
  color: #3f612d;
  :hover {
    background: #e9c5a9;
  }
  cursor: pointer;
  display: ${(props) => {
    if (props.localPath === props.$uid || props.localPath === "") {
      return "flex";
    } else return "none";
  }};
  @media screen and (max-width: 830px) {
    border-radius: 0px;
    top: -22px;
    right: 0px;
    width: 100%;
    height: 46px;
    background: none;
    :hover {
      background: #f3eec8;
      color: #1f2e16;
    }
  }
`;

const TopTagWrapper = styled.div`
  max-width: 1080px;

  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 24px;

  @media screen and (max-width: 1100px) {
    width: 100%;
  }
  @media screen and (max-width: 830px) {
    flex-direction: column;
  }
  @media screen and (max-width: 560px) {
  }
`;

const Split = styled.div`
  border-left: 2px solid #3f612d;
  height: 28px;
  @media screen and (max-width: 830px) {
    display: none;
  }
`;

const LendFromFriend = styled.div<{ $active: boolean }>`
  cursor: pointer;
  user-select: none;
  width: 180px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #3f612d;
  border-radius: 6px;
  :hover {
    background: #fefadc;
  }
  color: ${(props) => (props.$active ? "#1f2e16" : "#3f612d")};
  background: ${(props) => (props.$active ? "#fefadc" : "")};
  @media screen and (max-width: 1100px) {
    width: 135px;
    overflow-x: overlay;
    white-space: nowrap;
  }
  @media screen and (max-width: 830px) {
    width: 100%;
    border-radius: 0px;
    :hover {
      background: #e9c5a9;
      color: #1f2e16;
    }
  }
  @media screen and (max-width: 560px) {
  }
`;

const WishList = styled.div<{ $active: boolean }>`
  cursor: pointer;
  user-select: none;
  width: 180px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #3f612d;
  border-radius: 6px;
  :hover {
    background: #fefadc;
  }
  color: ${(props) => (props.$active ? "#1f2e16" : "#3f612d")};
  background: ${(props) => (props.$active ? "#fefadc" : "")};
  @media screen and (max-width: 1100px) {
    width: 135px;
    overflow-x: overlay;
    white-space: nowrap;
  }
  @media screen and (max-width: 830px) {
    width: 100%;
    border-radius: 0px;
    :hover {
      background: #e9c5a9;
      color: #1f2e16;
    }
  }
  @media screen and (max-width: 560px) {
  }
`;

const LendToOther = styled.div<{ $active: boolean }>`
  cursor: pointer;
  user-select: none;
  width: 180px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #3f612d;
  border-radius: 6px;
  :hover {
    background: #fefadc;
  }
  color: ${(props) => (props.$active ? "#1f2e16" : "#3f612d")};
  background: ${(props) => (props.$active ? "#fefadc" : "")};
  @media screen and (max-width: 1100px) {
    width: 135px;
  }
  @media screen and (max-width: 830px) {
    width: 100%;
    border-radius: 0px;
    :hover {
      background: #e9c5a9;
      color: #1f2e16;
    }
  }
  @media screen and (max-width: 560px) {
  }
`;

const FinishRead = styled.div<{ $active: boolean }>`
  cursor: pointer;
  user-select: none;
  width: 180px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;

  border-radius: 6px;
  :hover {
    background: #fefadc;
  }
  color: ${(props) => (props.$active ? "#1f2e16" : "#3f612d")};
  background: ${(props) => (props.$active ? "#fefadc" : "")};
  @media screen and (max-width: 1100px) {
    width: 135px;
    overflow-x: overlay;
    white-space: nowrap;
  }
  @media screen and (max-width: 830px) {
    width: 100%;
    border-radius: 0px;
    :hover {
      background: #e9c5a9;
      color: #1f2e16;
    }
  }
  @media screen and (max-width: 560px) {
  }
`;

const CategoryAll = styled.div<{ $active: boolean }>`
  width: 180px;
  height: 48px;
  cursor: pointer;
  user-select: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;

  color: ${(props) => (props.$active ? "#1f2e16" : "#3f612d")};
  border-radius: 6px;
  :hover {
    background: #fefadc;
  }
  background: ${(props) => (props.$active ? "#fefadc" : "")};
  @media screen and (max-width: 1100px) {
    width: 135px;
  }
  @media screen and (max-width: 830px) {
    width: 100%;
    border-radius: 0px;
    :hover {
      background: #e9c5a9;
      color: #1f2e16;
    }
  }
  @media screen and (max-width: 560px) {
  }
`;

const CategoryWholeWrapper = styled.div`
  position: relative;
  @media screen and (max-width: 830px) {
    width: 100%;
  }
`;

const CategoryButton = styled.div<{ $active: string | null }>`
  cursor: pointer;
  user-select: none;
  width: 180px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #3f612d;
  border-radius: 6px;
  overflow: overlay;

  :hover {
    background: #fefadc;
  }
  color: ${(props) => (props.$active ? "#1f2e16" : "#3f612d")};
  background: ${(props) => (props.$active ? "#fefadc" : "")};
  @media screen and (max-width: 1100px) {
    width: 135px;
  }
  @media screen and (max-width: 830px) {
    width: 100%;
    border-radius: 0px;
    :hover {
      background: #e9c5a9;
      color: #1f2e16;
    }
  }
  @media screen and (max-width: 560px) {
  }
`;

const CategoryWrapper = styled.div<{ categorySelectActive: boolean }>`
  width: 240px;
  height: auto;
  max-height: 300px;
  overflow-y: overlay;

  position: absolute;
  top: 48px;
  left: 0px;
  z-index: 1;
  background: #f6d4ba;
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
  height: 48px;
  width: 170px;
  font-size: 24px;
  display: flex;
  color: #3f612d;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  cursor: pointer;
  user-select: none;
  margin: 0px 24px;
  :hover {
    background: #f3b391;
  }
`;
const CategoryDivP = styled.p`
  overflow-x: overlay;
`;

const DeleteCategory = styled.div`
  cursor: pointer;
  position: absolute;
  right: -30px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 6px;
  :hover {
    background: #fefadc;
  }
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

const Bookcase = styled.div`
  position: relative;
  margin: 0px 0px 100px 0px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  border-radius: 6px;

  @media screen and (max-width: 1100px) {
    width: 810px;
  }
  @media screen and (max-width: 830px) {
    width: 540px;
  }
  @media screen and (max-width: 560px) {
    width: 270px;
  }
`;

const BookcaseLoading = styled.div`
  position: absolute;
  top: 0px;
  left: 0px;
  width: 100%;
  height: 100%;
  background: #f6d4ba;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const BookDiv = styled.div<{ $w: boolean; $l: boolean }>`
  width: 270px;

  height: auto;
  padding: 24px 0px;

  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  border-radius: 6px;
  font-size: 24px;

  :last-child {
    margin-right: auto;
  }

  cursor: ${(props) => (props.$w || props.$l ? "" : "pointer")};
  :hover {
    background: ${(props) => (props.$w || props.$l ? "" : " #f3b391")};
  }
`;

const BookImg = styled.img`
  width: 200px;
  height: 280px;
  box-shadow: 0 12px 28px 0 rgba(0, 0, 0, 0.2), 0 2px 4px 0 rgba(0, 0, 0, 0.1);
`;

const BookName = styled.p`
  margin-top: 24px;
  width: 200px;
  height: 48px;
  font-size: 22px;
  font-weight: 500;
  color: #1f2e16;
  border-bottom: 1px solid #1f2e16;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
`;

const BorrowFrom = styled.div<{
  $hasBookinLibrary: boolean;
  $bookforLendOrBorrowInOthersNotification: string | undefined;
}>`
  margin-top: 16px;
  width: 120px;
  height: 36px;

  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${(props) =>
    props.$hasBookinLibrary || props.$bookforLendOrBorrowInOthersNotification
      ? "gray"
      : "#3f612d "};
  background: ${(props) =>
    props.$hasBookinLibrary || props.$bookforLendOrBorrowInOthersNotification
      ? ""
      : ""};
  cursor: ${(props) =>
    props.$hasBookinLibrary || props.$bookforLendOrBorrowInOthersNotification
      ? "not-allowed"
      : "pointer"};
  :hover {
    background: ${(props) =>
      props.$hasBookinLibrary || props.$bookforLendOrBorrowInOthersNotification
        ? ""
        : "#fefadc"};
  }
`;

const AddToLibrary = styled.div`
  margin-top: 16px;
  width: 120px;
  height: 36px;

  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #3f612d;
  :hover {
    background: #fefadc;
  }
`;

const LendToFriend = styled.div<{
  $hasBookinWishList: boolean;
  $bookforLendOrBorrowInOthersNotification: string | undefined;
}>`
  margin-top: 16px;
  width: 120px;
  height: 36px;

  border-radius: 6px;
  color: ${(props) =>
    props.$bookforLendOrBorrowInOthersNotification ? "gray" : "#3f612d"};
  background: ${(props) =>
    props.$bookforLendOrBorrowInOthersNotification ? "" : ""};
  cursor: ${(props) =>
    props.$bookforLendOrBorrowInOthersNotification ? "not-allowed" : "pointer"};
  :hover {
    background: ${(props) =>
      props.$bookforLendOrBorrowInOthersNotification ? "" : "#fefadc"};
  }

  display: flex;
  align-items: center;
  justify-content: center;
`;

const Space = styled.div`
  height: 52px;
`;

const LendFromNameP = styled.div`
  color: #1f2e16;
  margin-top: 8px;
  font-weight: 500;
`;

const GiveBackBtn = styled.div<{
  $bookforGivebackInOthersNotification: string | undefined;
}>`
  width: 180px;
  height: 48px;
  margin-top: 4px;
  color: #3f612d;

  border-radius: 6px;
  color: ${(props) =>
    props.$bookforGivebackInOthersNotification ? "gray" : "#3f612d "};
  background: ${(props) =>
    props.$bookforGivebackInOthersNotification ? "" : ""};
  cursor: ${(props) =>
    props.$bookforGivebackInOthersNotification ? "not-allowed" : "pointer"};
  :hover {
    background: ${(props) =>
      props.$bookforGivebackInOthersNotification ? "" : "#fefadc"};
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

const NoLibrary = styled.div`
  font-size: 24px;
  color: #3f612d;
`;

const NoLibraryPlusIconDiv = styled.div`
  width: 48px;
  height: 36px;
  border-radius: 6px;
  background: #fefadc;
  align-items: center;
  justify-content: center;

  font-size: 32px;
  font-weight: 500;
  color: #3f612d;
  cursor: pointer;
  :hover {
    background: #f3eec8;
  }
  margin: 16px 16px;
  display: flex;
`;
