import { useSelector, useDispatch } from "react-redux";
import { actionType } from "../../reducer/rootReducer";
import { User } from "../../reducer/userReducer";
import { CurrentBook } from "../../reducer/currentBookReducer";

import styled from "styled-components";

import { auth } from "../../utils/firebase";
import { signOut } from "firebase/auth";

import {
  getUserInfo,
  searchFriend,
  updateFollowList,
  updateUserLibrary,
  updateWishList,
  updatelendFromList,
  updateNotification,
  updateGiveBackAlert,
} from "../../utils/firestore";

import search from "./search.svg";
import alert from "./alert.svg";
import arrow from "./arrow.svg";
import logout from "./logout.svg";
import account from "./account.svg";
import friend from "./friend.svg";
import theme from "./theme.svg";
import rightarrow from "./rightarrow.svg";
import grayBack from "../TopSection/grayBack.png";

import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Friend from "../Friend/Friend";
import Account from "../Account/Account";
import Theme from "../Theme/Theme";

function Header() {
  const Location = useLocation();
  const dispatch = useDispatch();
  const user = useSelector((state: { userReducer: User }) => state.userReducer);
  const displayLibrary = useSelector(
    (state: { displayLibraryReducer: CurrentBook[] }) =>
      state.displayLibraryReducer
  );
  const notification = useSelector(
    (state: {
      notificationReducer: {
        type: string;
        avatar: string;
        uid: string;
        uname: string;
        isbn: string;
        bookname: string;
      }[];
    }) => state.notificationReducer
  );

  const [active, setActive] = useState<boolean>(false);
  const [alertActive, setAlertActive] = useState<boolean>(false);
  const [friendActive, setFriendActive] = useState<boolean>(false);
  const [friendLoading, setFriendLoading] = useState<boolean>(false);
  const [accountActive, setAccountActive] = useState<boolean>(false);
  const [themeActive, setThemeActive] = useState<boolean>(false);
  const [bGBlock, setBGBlock] = useState<boolean>(false);
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [isInputActive, setIsInputActive] = useState<boolean>(false);
  const [input, setInput] = useState<string>("");
  const [searchResult, setSearchResult] = useState<
    { uid: string; uname: string; avatar: string }[] | null
  >(null);
  const [searchResultActive, setSearchResultActive] = useState<boolean>(false);

  const [followActive, setFollowActive] = useState<boolean>(false);
  const navigator = useNavigate();
  const friendSearchRef = useRef<HTMLInputElement>(null);
  const localPath = Location.pathname.split("/")[1];
  console.log(localPath);

  //登出
  function logOut() {
    signOut(auth)
      .then(() => {
        dispatch({
          type: actionType.USER.SETUSER,
          value: null,
        });
        dispatch({
          type: actionType.DISPLAYLIBRARY.SETDISPLAYLIBRARY,
          value: [],
        });
        dispatch({
          type: actionType.TOPSDISPLAY.SETTOPSDISPLAY,
          value: {
            avatar: "",
            uname: "",
            background: "",
          },
        });
        setActive(false);
        setAccountActive(false);
        setFriendActive(false);
        setThemeActive(false);
        setAlertActive(false);
        setIsInputActive(false);
        setInput("");
        setBGBlock(false);

        navigator("./login");
      })
      .catch((error) => {
        console.log("登出失敗");
      });
  }
  useEffect(() => {
    if (input !== "") {
      setSearchResultActive(true);
      searchFriend(input).then((r) => {
        const a: { uid: string; uname: string; avatar: string }[] | undefined =
          r?.filter((i) => i.uid !== user.uid);
        if (a) {
          setSearchResult(a);
        } else {
          setSearchResult(null);
        }
      });
    } else {
      setSearchResultActive(false);
    }
  }, [input]);

  useEffect(() => {
    if (user) {
      console.log("拿通知");
      getUserInfo(user.uid).then((v) => {
        dispatch({
          type: actionType.NOTIFICATION.SETNOTIFICATION,
          value: v?.notification,
        });
        // dispatch({
        //   type: actionType.USER.SETUSER,
        //   value: v,
        // });
      });
    }
  }, [alertActive, user]);

  return (
    <>
      <HeaderDiv>
        <BGSearchBlock $active={isInputActive} />
        <LeftDiv>
          <Logo
            onClick={() => {
              if (localPath) {
                dispatch({
                  type: actionType.TOPSDISPLAY.SETTOPSDISPLAY,
                  value: {
                    avatar: "",
                    uname: "",
                    background: "",
                  },
                });
              }

              //這邊希望點擊後可以回到自己的主頁
              navigator("./");
            }}
          >
            BOOKLOVE
          </Logo>
          <SearchWrapper>
            <SearchIconDiv
              onClick={() => {
                setActive(false);
                setAlertActive(false);
                if (isInputActive) {
                  setIsInputActive(false);
                  setInput("");
                  setBGBlock(false);
                } else {
                  setIsInputActive(true);
                  friendSearchRef?.current?.focus();
                  setBGBlock(true);
                }
              }}
            >
              <SearchIcon src={search} />
            </SearchIconDiv>
            <SearchInput
              ref={friendSearchRef}
              placeholder="Search booklovers"
              isInputActive={isInputActive}
              onChange={(e) => {
                setInput(e.target.value);
              }}
              value={input}
            />
            <SearchResultWrapper searchResultActive={searchResultActive}>
              {searchResult?.map((i) => {
                return (
                  <SearchResultDiv key={i.uid}>
                    <SearchResultDivLeft
                      onClick={() => {
                        navigator(`./${i.uid}`);
                      }}
                    >
                      <SearchAvatar src={i.avatar} />
                      <SearchResultName>{i.uname}</SearchResultName>
                    </SearchResultDivLeft>

                    <SearchResultButton
                      onClick={() => {
                        const a:
                          | {
                              uid: string;
                              uname: string;
                              avatar: string;
                            }[]
                          | undefined = user?.followList;
                        if (a?.find((k) => k.uid === i.uid)) {
                          updateFollowList(
                            user.uid,
                            a.filter((j) => j.uid !== i.uid)
                          );
                          dispatch({
                            type: actionType.USER.SETUSER,
                            value: {
                              ...user,
                              followList: a.filter((j) => j.uid !== i.uid),
                            },
                          });
                        } else if (a && !a?.find((k) => k.uid === i.uid)) {
                          updateFollowList(user.uid, [...a, i]);
                          dispatch({
                            type: actionType.USER.SETUSER,
                            value: { ...user, followList: [...a, i] },
                          });
                        } else if (!a) {
                          updateFollowList(user.uid, [i]);
                          dispatch({
                            type: actionType.USER.SETUSER,
                            value: { ...user, followList: [i] },
                          });
                        }
                      }}
                    >
                      {user?.followList?.find((k) => k.uid === i.uid)
                        ? "取消追蹤"
                        : "追蹤用戶"}
                    </SearchResultButton>
                  </SearchResultDiv>
                );
              })}
              {!searchResult && (
                <SearchResultDiv>
                  <NoResult>暫無搜尋結果 ...</NoResult>
                </SearchResultDiv>
              )}
            </SearchResultWrapper>
          </SearchWrapper>
        </LeftDiv>
        <LogoMobile
          onClick={() => {
            if (localPath) {
              dispatch({
                type: actionType.TOPSDISPLAY.SETTOPSDISPLAY,
                value: {
                  avatar: "",
                  uname: "",
                  background: "",
                },
              });
            }

            //這邊希望點擊後可以回到自己的主頁
            navigator("./");
          }}
        >
          BOOKLOVE
        </LogoMobile>
        <RightDiv>
          <AlertIconDiv
            onClick={() => {
              setAlertActive(!alertActive);
              setBGBlock(!alertActive);
              setActive(false);
              setIsInputActive(false);
              setInput("");
            }}
          >
            <AlertIcon src={alert} />
            {notification?.length ? <AlertDot></AlertDot> : <></>}
          </AlertIconDiv>

          <AlertWrapper $alertActive={alertActive}>
            {notification?.length ? <></> : <p>沒有通知</p>}
            {notification?.map((i) => {
              let p;
              let confirm;
              let cancel;
              if (i.type === "borrow") {
                p = `想跟你借${i.bookname}`;
                confirm = "借出";
                cancel = "不借";
              }
              if (i.type === "lendFrom") {
                p = `想借你${i.bookname}`;
                confirm = "借入";
                cancel = "不借";
              }
              if (i.type === "giveBack") {
                p = `要歸還${i.bookname}`;
                confirm = "確認";
                cancel = "取消";
              }
              return (
                <div key={`${i.type}${i.uname}${i.bookname}`}>
                  <AlertDiv>
                    <AlertLeftWrapper>
                      <AlertAvatar src={i.avatar} />
                      <AlertP>
                        <AlertPB>{i.uname}</AlertPB>
                        {p}
                      </AlertP>
                    </AlertLeftWrapper>
                    <AlertRightWrapper>
                      <AlertConfirm
                        onClick={() => {
                          if (i.type === "borrow") {
                            //請求確認的話會在確認端把書的狀態改變為借出，借給誰改成那個人
                            let libraryExceptThisBook;
                            let bookPutInOtherLendFromList;
                            getUserInfo(user.uid).then((v) => {
                              libraryExceptThisBook = v!.library.filter(
                                (j) => j.isbn !== i.isbn
                              );

                              v!.library.forEach((j) => {
                                if (j.isbn === i.isbn) {
                                  const thisbook: CurrentBook = {
                                    ...j,
                                    lendTo: i.uname,
                                    isLendTo: true,
                                  };
                                  updateUserLibrary(user.uid, [
                                    ...libraryExceptThisBook,
                                    thisbook,
                                  ]);
                                }
                              });
                              //更新要放到對方lendFromList的書資訊
                              v?.library?.forEach((j) => {
                                if (j.isbn === i.isbn) {
                                  bookPutInOtherLendFromList = {
                                    ...j,
                                    lendFrom: user.uid,
                                    lendFromName: user.uname,
                                  };
                                }
                              });
                            });
                            //在請求借書端會把那本書放入自己的借入書籍區
                            getUserInfo(i.uid).then((v) => {
                              if (v?.lendFromList) {
                                updatelendFromList(i.uid, [
                                  ...v.lendFromList,
                                  bookPutInOtherLendFromList,
                                ]);
                              } else {
                                updatelendFromList(i.uid, [
                                  bookPutInOtherLendFromList,
                                ]);
                              }
                              //也會檢查對方的願望清單去把他清除掉
                              updateWishList(
                                i.uid,
                                v?.wishList?.filter((j) => j.isbn !== i.isbn) ||
                                  []
                              );
                            });
                          }
                          if (i.type === "lendFrom") {
                            //把他的書改成出借狀態
                            let libraryExceptThisBook;
                            getUserInfo(i.uid).then((v) => {
                              libraryExceptThisBook = v!.library.filter(
                                (j) => j.isbn !== i.isbn
                              );

                              v!.library.forEach((j) => {
                                if (j.isbn === i.isbn) {
                                  const thisbook: CurrentBook = {
                                    ...j,
                                    lendTo: user.uname,
                                    isLendTo: true,
                                  };
                                  updateUserLibrary(i.uid, [
                                    ...libraryExceptThisBook,
                                    thisbook,
                                  ]);
                                }
                              });
                            });
                            //並加到我的lendFromList，並把lendFrom改成對方id 把name改成對方姓名，方便取出
                            let b;
                            user.wishList?.forEach((j) => {
                              if (j.isbn === i.isbn) {
                                b = {
                                  ...j,
                                  lendFrom: i.uid,
                                  lendFromName: i.uname,
                                };
                              }
                            });
                            if (user.lendFromList) {
                              updatelendFromList(user.uid, [
                                ...user.lendFromList,
                                b,
                              ]);
                            } else {
                              updatelendFromList(user.uid, [b]);
                            }
                            //把我的書從願望清單移出
                            updateWishList(
                              user.uid,
                              user.wishList?.filter((j) => j.isbn !== i.isbn) ||
                                []
                            );
                            dispatch({
                              type: actionType.DISPLAYLIBRARY.SETDISPLAYLIBRARY,
                              value:
                                user.wishList?.filter(
                                  (j) => j.isbn !== i.isbn
                                ) || [],
                            });
                          }
                          if (i.type === "giveBack") {
                            //把我的那本書的出借狀態改成flase 出借人清空
                            let libraryExceptThisBook;
                            getUserInfo(user.uid).then((v) => {
                              libraryExceptThisBook = v!.library.filter(
                                (j) => j.isbn !== i.isbn
                              );

                              v!.library.forEach((j) => {
                                if (j.isbn === i.isbn) {
                                  const thisbook: CurrentBook = {
                                    ...j,
                                    lendTo: "",
                                    isLendTo: false,
                                  };
                                  updateUserLibrary(user.uid, [
                                    ...libraryExceptThisBook,
                                    thisbook,
                                  ]);
                                }
                              });
                            });
                            //把對方的lendFrom庫裡的那本書清掉
                            let lendFromListExceptThisBook;

                            getUserInfo(i.uid).then((v) => {
                              lendFromListExceptThisBook =
                                v!.lendFromList!.filter(
                                  (j) => j.isbn !== i.isbn
                                );
                              updatelendFromList(
                                i.uid,
                                lendFromListExceptThisBook
                              );
                              //把對方的歸還通知清掉

                              updateGiveBackAlert(
                                i.uid,
                                v?.giveBackAlert?.filter((j) => j !== i.isbn) ||
                                  []
                              );
                            });
                          }
                          //把這則通知清除
                          updateNotification(
                            user.uid,
                            notification?.filter((j) => j.isbn !== i.isbn) || []
                          );

                          dispatch({
                            type: actionType.NOTIFICATION.SETNOTIFICATION,
                            value:
                              notification?.filter((j) => j.isbn !== i.isbn) ||
                              [],
                          });
                          //這個目前是應該不用
                          // getUserInfo(user.uid).then((v) => {
                          //   dispatch({
                          //     type: actionType.USER.SETUSER,
                          //     value: {
                          //       ...v,
                          //       notification:
                          //         notification?.filter(
                          //           (j) => j.isbn !== i.isbn
                          //         ) || [],
                          //     },
                          //   });
                          // });
                        }}
                      >
                        {confirm}
                      </AlertConfirm>
                      <AlertCancel
                        onClick={() => {
                          //把這則通知清除
                          updateNotification(
                            user.uid,
                            notification?.filter((j) => j.isbn !== i.isbn) || []
                          );

                          dispatch({
                            type: actionType.NOTIFICATION.SETNOTIFICATION,
                            value:
                              notification?.filter((j) => j.isbn !== i.isbn) ||
                              [],
                          });
                          if (i.type === "giveBack") {
                            getUserInfo(i.uid).then((v) => {
                              //把對方的歸還通知清掉

                              updateGiveBackAlert(
                                i.uid,
                                v?.giveBackAlert?.filter((j) => j !== i.isbn) ||
                                  []
                              );
                            });
                          }
                        }}
                      >
                        {cancel}
                      </AlertCancel>
                    </AlertRightWrapper>
                  </AlertDiv>
                  <AlertSplit />
                </div>
              );
            })}
          </AlertWrapper>
          <BGBlock
            $active={bGBlock}
            onClick={() => {
              setActive(false);
              setAccountActive(false);
              setFriendActive(false);
              setThemeActive(false);
              setAlertActive(false);
              setIsInputActive(false);
              setInput("");
              setBGBlock(false);
            }}
          />
          <Avatar
            src={user?.avatar || grayBack}
            onClick={() => {
              setActive(!active);
              setBGBlock(!active);

              setAccountActive(false);
              setFriendActive(false);
              setThemeActive(false);
              setAlertActive(false);
              setIsInputActive(false);
              setInput("");
            }}
          ></Avatar>
          <AvatarArrowIconDiv
            onClick={() => {
              setActive(!active);
              setBGBlock(!active);

              setAccountActive(false);
              setFriendActive(false);
              setThemeActive(false);
              setAlertActive(false);
              setIsInputActive(false);
              setInput("");
            }}
          >
            <AvatarArrowIcon src={arrow} />
          </AvatarArrowIconDiv>
        </RightDiv>
      </HeaderDiv>

      <UserWrapper $active={active}>
        <UserDiv
          onClick={() => {
            setFriendActive(true);
            setFriendLoading(true);
          }}
        >
          <UserDivLeft>
            <FriendIconDiv>
              <FriendIcon src={friend} />
            </FriendIconDiv>
            <UserP>追蹤名單</UserP>
          </UserDivLeft>

          <RightArrow src={rightarrow}></RightArrow>
        </UserDiv>
        <Friend
          friendActive={friendActive}
          setFriendActive={setFriendActive}
          friendLoading={friendLoading}
          setFriendLoading={setFriendLoading}
          setActive={setActive}
        />

        <UserDiv
          onClick={() => {
            setAccountActive(true);
            setIsEdit(false);
          }}
        >
          <UserDivLeft>
            <AccountIconDiv>
              <AccountIcon src={account} />
            </AccountIconDiv>
            <UserP>帳戶資訊</UserP>
          </UserDivLeft>
          <RightArrow src={rightarrow}></RightArrow>
        </UserDiv>
        <Account
          isEdit={isEdit}
          setIsEdit={setIsEdit}
          accountActive={accountActive}
          setAccountActive={setAccountActive}
        />

        {/* <UserDiv
          onClick={() => {
            setThemeActive(true);
          }}
        >
          <UserDivLeft>
            <ThemeIconDiv>
              <ThemeIcon src={theme} />
            </ThemeIconDiv>
            <UserP>主題更換</UserP>
          </UserDivLeft>
          <RightArrow src={rightarrow}></RightArrow>
        </UserDiv>
        <Theme themeActive={themeActive} setThemeActive={setThemeActive} /> */}

        <UserDiv onClick={logOut}>
          <UserDivLeft>
            <LogoutIconDiv>
              <LogoutIcon src={logout} />
            </LogoutIconDiv>
            <UserP>登出</UserP>
          </UserDivLeft>
        </UserDiv>
      </UserWrapper>
    </>
  );
}

export default Header;

const HeaderDiv = styled.div`
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: fixed;
  width: 100vw;
  background: #f3b391;
  z-index: 10;

  @media screen and (max-width: 685px) {
    justify-content: center;
  }
`;

const LeftDiv = styled.div`
  display: flex;
  align-items: center;
  padding-left: 20px;
  @media screen and (max-width: 685px) {
    position: absolute;
    left: 0px;
    padding-left: 0px;
  }
`;

const Logo = styled.p`
  font-size: 28px;
  font-family: "Inknut Antiqua", serif;
  font-weight: 600;
  color: #3f612d;
  cursor: pointer;
  z-index: 10;
  @media screen and (max-width: 685px) {
    display: none;
  }
`;

const LogoMobile = styled.p`
  display: none;
  @media screen and (max-width: 685px) {
    display: block;
    font-size: 28px;
    font-family: "Inknut Antiqua", serif;
    font-weight: 600;
    color: #3f612d;
    cursor: pointer;
    z-index: 10;
  }
  @media screen and (max-width: 530px) {
    font-size: 24px;
  }
  @media screen and (max-width: 450px) {
    font-size: 20px;
    position: relative;
    right: 16px;
  }
  @media screen and (max-width: 420px) {
    font-size: 16px;
  }
`;

const BGSearchBlock = styled.div<{ $active: boolean }>`
  display: none;
  @media screen and (max-width: 685px) {
    display: block;
    position: absolute;
    top: 0px;
    left: 0px;
    width: 100%;
    height: 100%;

    z-index: ${(props) => (props.$active ? "13" : "-1")};
    opacity: ${(props) => (props.$active ? "1" : "0")};
    transition: opacity 0.7s;
    background: #f3b391;
  }
`;

const SearchWrapper = styled.div`
  position: relative;
`;

const SearchIconDiv = styled.div`
  position: relative;
  width: 40px;
  height: 40px;
  margin-left: 16px;
  background: #fefadc;
  border-radius: 50%;
  cursor: pointer;
  :hover {
    background: #f3eec8;
  }
  z-index: 15;
`;

const SearchIcon = styled.img`
  position: absolute;
  width: 18px;
  left: 10px;
  top: 10px;
`;

const SearchInput = styled.input<{ isInputActive: boolean }>`
  border: none;
  position: absolute;
  font-size: 16px;
  left: 16px;
  top: 0px;
  height: 20px;
  border-radius: 50px;
  text-indent: 48px;
  background: #fefadc;
  color: #3f612d;
  width: ${(props) => (props.isInputActive ? "320px" : "0px")};
  height: ${(props) => (props.isInputActive ? "40px" : "40px")};
  opacity: ${(props) => (props.isInputActive ? "1" : "0")};
  transition: all 1s;
  ::placeholder {
    font-family: "Inknut Antiqua", serif;
    color: #3f612d88;
  }
  z-index: 12;
  @media screen and (max-width: 685px) {
    width: ${(props) => (props.isInputActive ? "93vw" : "0px")};
    z-index: 14;
  }
  @media screen and (max-width: 560px) {
    width: ${(props) => (props.isInputActive ? "90vw" : "0px")};
  }
`;

const SearchResultWrapper = styled.div<{ searchResultActive: boolean }>`
  position: absolute;
  left: 16px;
  top: 47px;
  width: 320px;
  max-height: 400px;
  padding-bottom: 8px;
  border-radius: 6px;
  box-shadow: 0 12px 28px 0 rgba(0, 0, 0, 0.2), 0 2px 4px 0 rgba(0, 0, 0, 0.1);
  background: #f6d4ba;
  z-index: 12;
  color: #3f612d;
  display: ${(props) => (props.searchResultActive ? "block" : "none")};
  @media screen and (max-width: 685px) {
    width: ${() => `calc(100vw - 15px)`};
    left: 0px;
    border-radius: 0px;
  }
`;

const SearchResultDiv = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  width: 100%;
  height: 52px;
  padding: 0px 8px;
  border-radius: 6px;
`;
const SearchResultDivLeft = styled.div`
  display: flex;
  align-items: center;
`;
const SearchAvatar = styled.img`
  width: 38px;
  height: 38px;
  margin-right: 16px;
  cursor: pointer;
  border: 2px solid #fefadc;
  border-radius: 50%;
`;
const SearchResultName = styled.p`
  cursor: pointer;
`;
const SearchResultButton = styled.div`
  width: 80px;
  height: 30px;
  cursor: pointer;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fefadc;
  :hover {
    background: #f3eec8;
  }
`;

const RightDiv = styled.div`
  display: flex;
  align-items: center;
  padding-right: 32px;
  @media screen and (max-width: 685px) {
    position: absolute;
    right: 0px;
  }
`;

const AlertIconDiv = styled.div`
  position: relative;
  width: 38px;
  height: 38px;
  margin-right: 8px;

  border-radius: 50%;

  background: #fefadc;
  cursor: pointer;
  user-select: none;
  :hover {
    background: #f3eec8;
  }
  z-index: 12;
`;

const AlertIcon = styled.img`
  position: absolute;
  width: 20px;
  left: 9px;
  top: 8px;
`;

const AlertDot = styled.div`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  position: absolute;

  right: -2px;
  top: -2px;
  background: #feea00;
`;

const AlertWrapper = styled.div<{ $alertActive: boolean }>`
  display: ${(props) => (props.$alertActive ? "flex" : "none")};
  position: absolute;
  top: 50px;
  right: 32px;
  z-index: 12;
  width: 360px;
  flex-direction: column;
  align-items: center;

  background: #f6d4ba;
  color: #3f612d;
  padding: 8px 0px;
  border-radius: 6px;
  box-shadow: 0 12px 28px 0 rgba(0, 0, 0, 0.2), 0 2px 4px 0 rgba(0, 0, 0, 0.1);
  @media screen and (max-width: 830px) {
    width: ${() => `calc(100vw - 15px)`};
    right: 15px;
    top: 47px;
    border-radius: 0px;
  }
`;

const AlertDiv = styled.div`
  width: 344px;
  height: auto;
  user-select: none;

  align-items: center;
  padding: 0px 8px;
  border-radius: 6px;
  justify-content: space-between;
`;

const AlertSplit = styled.div`
  width: 344px;
  border-bottom: 2px solid #f3b391;
  :last-child {
    display: none;
  }
`;

const AlertAvatar = styled.img`
  width: 38px;
  height: 38px;
  margin-right: 8px;

  border: 2px solid #fefadc;
  border-radius: 50%;
`;

const AlertP = styled.p`
  width: 280px;
`;

const AlertPB = styled.span`
  font-weight: 500;
`;

const AlertLeftWrapper = styled.div`
  display: flex;
  margin: 8px 0px;
`;
const AlertRightWrapper = styled.div`
  display: flex;
  margin: 8px 0px;
`;

const AlertConfirm = styled.div`
  width: 80px;
  height: 30px;
  margin-left: 8px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fefadc;
  cursor: pointer;
  :hover {
    background: #f3eec8;
  }
`;
const AlertCancel = styled.div`
  width: 80px;
  height: 30px;
  margin-left: 8px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fefadc;
  cursor: pointer;
  :hover {
    background: #f3eec8;
  }
`;

const BGBlock = styled.div<{ $active: boolean }>`
  position: fixed;
  top: 0px;
  left: 0px;
  width: 100vw;
  height: 100vh;

  z-index: 9;
  display: ${(props) => (props.$active ? "block" : "none")};
  // background: #00000035;
`;

const Avatar = styled.img`
  width: 38px;
  height: 38px;

  background: #fefadc;
  border-radius: 50%;
  user-select: none;
  cursor: pointer;
  z-index: 12;
`;

const AvatarArrowIconDiv = styled.div`
  position: absolute;
  right: 28px;
  top: 30px;
  width: 16px;
  height: 16px;
  background: #fefadc;
  border: 1px solid #f3eec8;
  border-radius: 50%;
  cursor: pointer;
  user-select: none;
  :hover {
    background: #f3eec8;
  }
  z-index: 12;
`;

const AvatarArrowIcon = styled.img`
  position: absolute;
  width: 10px;
  left: 2px;
  top: 4px;
`;

const UserWrapper = styled.div<{ $active: boolean }>`
  display: ${(props) => (props.$active ? "flex" : "none")};
  position: fixed;
  top: 50px;
  right: 16px;
  z-index: 12;
  width: 360px;
  flex-direction: column;
  align-items: center;

  background: #f6d4ba;
  color: #3f612d;
  padding: 8px 0px;
  border-radius: 6px;
  box-shadow: 0 12px 28px 0 rgba(0, 0, 0, 0.2), 0 2px 4px 0 rgba(0, 0, 0, 0.1);
  @media screen and (max-width: 830px) {
    width: ${() => `calc(100vw - 15px)`};
    right: 0px;
    top: 56px;
    border-radius: 0px;
    padding: 0px 0px;
  }
`;

const RightArrow = styled.img`
  width: 40px;
  height: 40px;
  object-position: 12px;
`;

const UserDiv = styled.div`
  width: 344px;
  height: 52px;

  display: flex;
  align-items: center;
  padding: 0px 8px;
  border-radius: 6px;
  justify-content: space-between;
  cursor: pointer;
  :hover {
    background: #f3b391;
  }
  @media screen and (max-width: 830px) {
    width: 100%;
    border-radius: 0px;
  }
`;

const UserDivLeft = styled.div`
  display: flex;
  align-items: center;
`;

const FriendIconDiv = styled.div`
  position: relative;
  width: 38px;
  height: 38px;
  margin-right: 16px;
  background: #f3b391;

  border-radius: 50%;
`;

const FriendIcon = styled.img`
  position: absolute;
  width: 20px;
  left: 9px;
  top: 10px;
`;

const AccountIconDiv = styled.div`
  position: relative;
  width: 38px;
  height: 38px;
  margin-right: 16px;
  background: #f3b391;

  border-radius: 50%;
`;

const AccountIcon = styled.img`
  position: absolute;
  width: 20px;
  left: 10px;
  top: 8px;
`;

const ThemeIconDiv = styled.div`
  position: relative;
  width: 38px;
  height: 38px;
  margin-right: 8px;
  background: #f3b391;

  border-radius: 50%;
`;

const ThemeIcon = styled.img`
  position: absolute;
  width: 20px;
  left: 9px;
  top: 9px;
`;

const LogoutIconDiv = styled.div`
  position: relative;
  width: 38px;
  height: 38px;
  margin-right: 16px;
  background: #f3b391;

  border-radius: 50%;
`;

const LogoutIcon = styled.img`
  position: absolute;
  width: 20px;
  left: 8px;
  top: 9px;
`;

const UserP = styled.p`
  user-select: none;
`;

const NoResult = styled.p`
  padding-left: 8px;
  font-size: 16px;
`;
