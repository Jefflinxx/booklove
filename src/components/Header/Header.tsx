import { useSelector, useDispatch } from "react-redux";
import { actionType } from "../../reducer/rootReducer";

import styled from "styled-components";

import { auth } from "../../utils/firebase";
import { signOut } from "firebase/auth";

import search from "./search.svg";
import alert from "./alert.svg";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Friend from "../Friend/Friend";
import Account from "../Account/Account";
import Theme from "../Theme/Theme";

function Header() {
  const dispatch = useDispatch();
  const user = useSelector(
    (state: { userReducer: object }) => state.userReducer
  );

  //console.log(user);
  const [active, setActive] = useState<boolean>(false);
  const [friendActive, setFriendActive] = useState<boolean>(false);
  const [accountActive, setAccountActive] = useState<boolean>(false);
  const [themeActive, setThemeActive] = useState<boolean>(false);
  const navigator = useNavigate();

  //登出
  function logOut() {
    signOut(auth)
      .then(() => {
        window.localStorage.clear();
        dispatch({
          type: actionType.USER.SETUSER,
          value: null,
        });
        setActive(false);
        navigator("./");
      })
      .catch((error) => {
        console.log("登出失敗");
      });
  }

  useEffect(() => {
    dispatch({
      type: actionType.USER.SETUSER,
      value: JSON.parse(window.localStorage.getItem("user") || "") || null,
    });
  }, []);

  //console.log("user", user);

  return (
    <>
      <HeaderDiv>
        <LeftDiv>
          <Logo
            onClick={() => {
              navigator("./");
            }}
          >
            booklove
          </Logo>
          <SearchIconDiv>
            <SearchIcon src={search} />
            <SearchInput />
          </SearchIconDiv>
        </LeftDiv>
        <RightDiv>
          <AlertIconDiv>
            <AlertIcon src={alert} />
          </AlertIconDiv>
          <Avatar
            onClick={() => {
              setActive(!active);
            }}
          ></Avatar>
          <AvatarArrowIconDiv
            onClick={() => {
              setActive(!active);
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
          }}
        >
          <UserIconDiv>
            <UserIcon />
          </UserIconDiv>
          <UserP>帳戶設定</UserP>
        </UserDiv>
        <Account
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

const SearchInput = styled.img`
  position: absolute;

  left: 9px;
  top: 9px;
  width: ${(props) => (true ? 0 : 0)};
  border-button: ${(props) => (true ? "none" : "none")};
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
