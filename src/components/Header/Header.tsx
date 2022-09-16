import { useSelector, useDispatch } from "react-redux";
import { actionType } from "../../reducer/rootReducer";
import { User } from "../../reducer/userReducer";

import styled from "styled-components";

import { auth } from "../../utils/firebase";
import { signOut } from "firebase/auth";

import {
  getUserInfo,
  searchFriend,
  updateFollowList,
} from "../../utils/firestore";

import search from "./search.svg";
import alert from "./alert.svg";
import arrow from "./arrow.svg";
import logout from "./logout.svg";
import account from "./account.svg";
import friend from "./friend.svg";
import theme from "./theme.svg";
import rightarrow from "./rightarrow.svg";

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Friend from "../Friend/Friend";
import Account from "../Account/Account";
import Theme from "../Theme/Theme";

function Header() {
  const dispatch = useDispatch();
  const user = useSelector((state: { userReducer: User }) => state.userReducer);

  //console.log(user);
  const [active, setActive] = useState<boolean>(false);
  const [friendActive, setFriendActive] = useState<boolean>(false);
  const [accountActive, setAccountActive] = useState<boolean>(false);
  const [themeActive, setThemeActive] = useState<boolean>(false);
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

  //登出
  function logOut() {
    signOut(auth)
      .then(() => {
        dispatch({
          type: actionType.USER.SETUSER,
          value: null,
        });
        setActive(false);
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
        console.log(r);
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

  // useEffect(() => {
  //   const f = async () => {
  //     const a: User | null = await getUserInfo(user.uid);
  //     console.log(a);
  //     if (a?.followList) {

  //     }
  //   };
  //   f();
  // }, [searchResult]);

  console.log(active);

  return (
    <>
      <HeaderDiv>
        <LeftDiv>
          <Logo
            onClick={() => {
              //這邊希望點擊後可以回到自己的主頁
              navigator("./");
              // getUserInfo(user.uid).then((v) => {
              //   if (v?.library) {
              //     dispatch({
              //       type: actionType.LIBRARY.SETLIBRARY,
              //       value: v?.library,
              //     });

              //   }
              // });
            }}
          >
            booklove
          </Logo>
          <SearchWrapper>
            <SearchIconDiv
              onClick={() => {
                if (isInputActive) {
                  setIsInputActive(false);
                  setInput("");
                } else {
                  setIsInputActive(true);
                  friendSearchRef?.current?.focus();
                }
              }}
            >
              <SearchIcon src={search} />
            </SearchIconDiv>
            <SearchInput
              ref={friendSearchRef}
              placeholder="搜尋 Booklover"
              isInputActive={isInputActive}
              onChange={(e) => {
                setInput(e.target.value);
              }}
              value={input}
            />
            <SearchResultWrapper searchResultActive={searchResultActive}>
              {searchResult?.map((i) => {
                return (
                  <SearchResultDiv>
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
        <RightDiv>
          <AlertIconDiv>
            <AlertIcon src={alert} />
          </AlertIconDiv>
          <Avatar
            src={user?.avatar}
            onClick={() => {
              setActive(!active);
              setAccountActive(false);
              setFriendActive(false);
              setThemeActive(false);
            }}
          ></Avatar>
          <AvatarArrowIconDiv
            onClick={() => {
              setActive(!active);
              setAccountActive(false);
              setFriendActive(false);
              setThemeActive(false);
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
        <Friend friendActive={friendActive} setFriendActive={setFriendActive} />

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

        <UserDiv
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
        <Theme themeActive={themeActive} setThemeActive={setThemeActive} />

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
  border: 1px solid #e4e6eb;
`;

const LeftDiv = styled.div`
  display: flex;
  align-items: center;
`;

const Logo = styled.p`
  margin-left: 16px;
  font-size: 26px;
  font-weight: 700;
  color: #1a77f2;
  cursor: pointer;
`;

const SearchWrapper = styled.div`
  position: relative;
`;

const SearchIconDiv = styled.div`
  position: relative;
  width: 40px;
  height: 40px;
  margin-left: 16px;
  background: #eff2f5;
  border-radius: 50%;
  cursor: pointer;
  :hover {
    background: rgba(200, 200, 200, 0.4);
  }
`;

const SearchIcon = styled.img`
  position: absolute;
  width: 18px;
  left: 10px;
  top: 10px;
  z-index: 1;
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
  background: #eff2f5;
  width: ${(props) => (props.isInputActive ? "320px" : "0px")};
  height: ${(props) => (props.isInputActive ? "40px" : "0px")};
  border-bottom: ${(props) =>
    props.isInputActive ? "0px solid black" : "0px solid black"};
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
  background: white;
  z-index: 1;
  display: ${(props) => (props.searchResultActive ? "block" : "none")};
`;

const SearchResultDiv = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  width: 100%;
  height: 52px;
  padding: 0px 8px;
  border-radius: 6px;
  :hover {
    background: #eff2f5;
  }
`;
const SearchResultDivLeft = styled.div`
  display: flex;
  align-items: center;
`;
const SearchAvatar = styled.img`
  width: 38px;
  height: 38px;
  margin-right: 16px;

  border: 2px solid white;
  border-radius: 50%;
`;
const SearchResultName = styled.p``;
const SearchResultButton = styled.div`
  width: 80px;
  height: 30px;

  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  :hover {
    background: rgba(200, 200, 200, 0.4);
  }
`;

const RightDiv = styled.div`
  display: flex;
  align-items: center;
`;

const AlertIconDiv = styled.div`
  position: relative;
  width: 38px;
  height: 38px;
  margin-right: 8px;

  border: 1px solid black;
  border-radius: 50%;
`;

const AlertIcon = styled.img`
  position: absolute;
  width: 20px;
  left: 8px;
  top: 8px;
`;

const Avatar = styled.img`
  width: 38px;
  height: 38px;
  margin-right: 16px;
  background: #ffffff;
  border-radius: 50%;
  user-select: none;
`;

const AvatarArrowIconDiv = styled.div`
  position: absolute;
  right: 16px;
  top: 30px;
  width: 16px;
  height: 16px;
  background: #eff2f5;
  border: 1px solid white;
  border-radius: 50%;
  user-select: none;
`;

const AvatarArrowIcon = styled.img`
  position: absolute;
  width: 10px;
  left: 2px;
  top: 4px;
`;

const UserWrapper = styled.div<{ $active: boolean }>`
  display: ${(props) => (props.$active ? "flex" : "none")};
  position: absolute;
  top: 50px;
  right: 16px;
  z-index: 2;
  width: 360px;
  flex-direction: column;
  align-items: center;

  background: white;
  padding: 8px 0px;
  border-radius: 6px;
  box-shadow: 0 12px 28px 0 rgba(0, 0, 0, 0.2), 0 2px 4px 0 rgba(0, 0, 0, 0.1);
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
  :hover {
    background: rgba(200, 200, 200, 0.4);
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
  margin-right: 8px;
  background: #e4e6eb;

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
  margin-right: 8px;
  background: #e4e6eb;

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
  background: #e4e6eb;

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
  margin-right: 8px;
  background: #e4e6eb;

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
