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
import { useState, useEffect } from "react";
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

  console.log(followActive);

  return (
    <>
      <HeaderDiv>
        <LeftDiv>
          <Logo
            onClick={() => {
              if (user) {
                dispatch({
                  type: actionType.LIBRARY.SETLIBRARY,
                  value: user?.library,
                });
                navigator("./");
              } else {
                window.alert("請先登入");
              }
            }}
          >
            booklove
          </Logo>
          <SearchWrapper>
            <SearchIconDiv
              onClick={() => {
                setIsInputActive(!isInputActive);
              }}
            >
              <SearchIcon src={search} />
            </SearchIconDiv>
            <SearchInput
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
                        ? "unfollow"
                        : "follow"}
                    </SearchResultButton>
                  </SearchResultDiv>
                );
              })}
              {!searchResult && <SearchResultDiv>暫無結果</SearchResultDiv>}
            </SearchResultWrapper>
          </SearchWrapper>
        </LeftDiv>
        <RightDiv>
          <AlertIconDiv>
            <AlertIcon src={alert} />
          </AlertIconDiv>
          <Avatar
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
            <AvatarArrowIcon />
          </AvatarArrowIconDiv>
        </RightDiv>
      </HeaderDiv>

      <UserWrapper $active={active}>
        <UserDiv
          onClick={() => {
            setFriendActive(true);
          }}
        >
          <UserIconDiv>
            <UserIcon />
          </UserIconDiv>
          <UserP>追蹤名單</UserP>
        </UserDiv>
        <Friend friendActive={friendActive} setFriendActive={setFriendActive} />

        <UserDiv
          onClick={() => {
            setAccountActive(true);
            setIsEdit(false);
          }}
        >
          <UserIconDiv>
            <UserIcon />
          </UserIconDiv>
          <UserP>帳戶設定</UserP>
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
          <UserIconDiv>
            <UserIcon />
          </UserIconDiv>
          <UserP>主題更換</UserP>
        </UserDiv>
        <Theme themeActive={themeActive} setThemeActive={setThemeActive} />

        <UserDiv onClick={logOut}>
          <UserIconDiv>
            <UserIcon />
          </UserIconDiv>
          <UserP>登出</UserP>
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
  border: 1px solid black;
`;

const LeftDiv = styled.div`
  display: flex;
  align-items: center;
`;

const Logo = styled.p`
  margin-left: 16px;
  font-size: 26px;
  font-weight: 800;
`;

const SearchWrapper = styled.div`
  position: relative;
`;

const SearchIconDiv = styled.div`
  position: relative;
  width: 38px;
  height: 38px;
  margin-left: 16px;

  border: 1px solid black;
  border-radius: 50%;
`;

const SearchIcon = styled.img`
  position: absolute;
  width: 18px;
  left: 9px;
  top: 9px;
`;

const SearchInput = styled.input<{ isInputActive: boolean }>`
  border: none;
  position: absolute;
  font-size: 20px;
  left: 60px;
  top: 9px;
  height: 20px;
  width: ${(props) => (props.isInputActive ? "300px" : "0px")};
  border-bottom: ${(props) =>
    props.isInputActive ? "1px solid black" : "0px solid black"};
`;

const SearchResultWrapper = styled.div<{ searchResultActive: boolean }>`
  position: absolute;
  left: 60px;
  top: 47px;
  width: 300px;
  height: 100px;
  border: 1px solid black;
  display: ${(props) => (props.searchResultActive ? "block" : "none")};
`;

const SearchResultDiv = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 1px solid black;
`;
const SearchResultDivLeft = styled.div`
  display: flex;
  align-items: center;
  border: 1px solid black;
`;
const SearchAvatar = styled.img`
  width: 38px;
  height: 38px;
  margin-right: 16px;

  border: 1px solid black;
  border-radius: 50%;
`;
const SearchResultName = styled.p``;
const SearchResultButton = styled.div`
  border: 1px solid black;
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

  border: 1px solid black;
  border-radius: 50%;
`;

const AvatarArrowIconDiv = styled.div`
  position: absolute;
  right: 16px;
  top: 30px;
  width: 16px;
  height: 16px;

  border: 1px solid black;
  border-radius: 50%;
`;

const AvatarArrowIcon = styled.img``;

const UserWrapper = styled.div<{ $active: boolean }>`
  display: ${(props) => (props.$active ? "block" : "none")};
  position: absolute;
  top: 47px;
  right: 16px;
  z-index: 2;
  width: 350px;
  height: 450px;
  border: 1px solid black;
  background: white;
`;

const UserDiv = styled.div`
  width: 330px;
  height: 100px;
  border: 1px solid black;
`;

const UserIconDiv = styled.div`
  position: relative;
  width: 38px;
  height: 38px;
  margin-right: 8px;

  border: 1px solid black;
  border-radius: 50%;
`;

const UserIcon = styled.img`
  position: absolute;
  width: 20px;
  left: 8px;
  top: 8px;
`;

const UserP = styled.p``;
