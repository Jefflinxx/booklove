import { useSelector, useDispatch } from "react-redux";
import { actionType } from "../../reducer/rootReducer";

import styled from "styled-components";
import { useEffect, useState } from "react";

import TopSection from "../../components/TopSection/TopSection";
import { auth } from "../../utils/firebase";
import { initUser, getUserInfo } from "../../utils/firestore";

import { User } from "../../reducer/userReducer";
import { CurrentBook } from "../../reducer/currentBookReducer";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
const defaultAvatar =
  "https://firebasestorage.googleapis.com/v0/b/booklove-d393f.appspot.com/o/images%2Fdefault%2Favatar.svg?alt=media&token=ef7468d4-fc7e-43e4-8c95-1f7627ebb363";

const Login = () => {
  const dispatch = useDispatch();
  const navigator = useNavigate();
  const user = useSelector((state: { userReducer: User }) => state.userReducer);
  const library = useSelector(
    (state: { currentLibraryReducer: CurrentBook[] }) =>
      state.currentLibraryReducer
  );
  const [signState, setSignState] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <LoginPage>
      <TitleWrapper>
        <Title>Booklove</Title>
        <SubTitle>
          Booklove，讓你和親朋好友保持聯繫，隨時分享生活中的每一刻。
        </SubTitle>
      </TitleWrapper>
      <div>
        <LoginWrapper>
          <LoginButtonDiv>
            <Signup
              signState={signState}
              onClick={() => {
                setSignState("signup");
              }}
            >
              註冊
            </Signup>
            <Signin
              signState={signState}
              onClick={() => {
                setSignState("signin");
              }}
            >
              登入
            </Signin>
          </LoginButtonDiv>
          <Form
            onSubmit={(e) => {
              e.preventDefault();
              if (signState === "signup") {
                createUserWithEmailAndPassword(auth, email, password)
                  .then((u) => {
                    console.log("註冊成功");
                    initUser(u.user.uid, u.user.email!, defaultAvatar);
                    getUserInfo(u.user.uid).then((v) => {
                      dispatch({ type: actionType.USER.SETUSER, value: v });
                    });
                    navigator("../");
                  })
                  .catch((e) => {
                    console.log(e.code);

                    if (e.code === "auth/email-already-in-use") {
                      console.log("信箱已存在");
                    } else if (e.code === "auth/invalid-email") {
                      console.log("信箱格式不正確");
                    } else if (e.code === "auth/week-password") {
                      console.log("密碼強度不足");
                    }
                  });
              } else if (signState === "signin") {
                signInWithEmailAndPassword(auth, email, password)
                  .then((u) => {
                    console.log("登入成功");
                    getUserInfo(u.user.uid).then((v) => {
                      dispatch({ type: actionType.USER.SETUSER, value: v });
                    });
                    navigator("../");
                  })
                  .catch((e) => {
                    if (e.code === "auth/invalid-email") {
                      console.log("信箱格式不正確");
                    } else if (e.code === "auth/user-not-found") {
                      console.log("信箱不存在");
                    } else if (e.code === "auth/wrong-password") {
                      console.log("密碼錯誤");
                    }
                  });
              }
            }}
          >
            <Input
              placeholder="電子郵件地址"
              onChange={(e) => {
                setEmail(e.target.value.replace(/^\s*/, "") || "");
              }}
              value={email}
            ></Input>
            <Input
              placeholder="密碼"
              type="password"
              onChange={(e) => {
                setPassword(e.target.value.replace(/^\s*/, "") || "");
              }}
              value={password}
            ></Input>
            <Button>
              {signState === "signup" && "註冊"}
              {signState === "signin" && "登入"}
            </Button>
          </Form>
        </LoginWrapper>
        <TestP>jeffxxtest@gmail.com</TestP>
        <TestP>12345678</TestP>
        <TestP>xxxx55554@gmail.com</TestP>
        <TestP>123456</TestP>
      </div>
    </LoginPage>
  );
};

export default Login;

const LoginPage = styled.div`
  z-index: 3;
  position: fixed;
  top: 0px;
  left: 0px;

  width: 100vw;
  height: 100vh;
  background: #eff2f5;
  border: 1px solid black;

  display: flex;
  align-items: center;
  justify-content: center;
`;

const TitleWrapper = styled.div`
  width: 580px;
  height: 300px;
  margin-right: ;
`;
const Title = styled.p`
  font-size: 54px;
  font-weight: 700;
  color: #1a77f2;
`;
const SubTitle = styled.p`
  width: 500px;
  height: 84px;
  font-size: 29px;
`;

const LoginWrapper = styled.div`
  border-radius: 6px;
  overflow: hidden;

  box-shadow: 0 2px 4px rgb(0 0 0 / 10%), 0 8px 16px rgb(0 0 0 / 10%);
  background: #ffffff;

  display: flex;
  align-items: center;
  flex-direction: column;
`;

const LoginButtonDiv = styled.div`
  width: 364px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 16px 0px;
  border: 1px solid #dddfe2;
  border-radius: 6px;
`;

const Signup = styled.div<{ signState: string }>`
  width: 200px;
  height: 50px;
  color: ${(props) => (props.signState === "signup" ? "white" : "black")};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 21px;
  border-radius: 6px;
  background: ${(props) => (props.signState === "signup" ? "#44B729" : "none")};
`;

const Signin = styled.div<{ signState: string }>`
  width: 200px;
  height: 50px;
  color: ${(props) => (props.signState === "signup" ? "black" : "white")};
  font-size: 21px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${(props) => (props.signState === "signin" ? "#44B729" : "none")};
`;

const Form = styled.form`
  width: 400px;
  height: auto;
  display: flex;
  align-items: center;
  flex-direction: column;
`;

const Input = styled.input`
  display: block;
  width: 364px;
  height: 52px;
  border: 1px solid #dddfe2;
  font-size: 21px;
  border-radius: 6px;
  margin-bottom: 16px;
  text-indent: 16px;
  ::placeholder {
    color: #b4b7bc;
  }
`;

const Button = styled.button`
  width: 364px;
  height: 52px;
  border: none;
  font-size: 21px;
  background: #1a77f2;
  color: white;
  border-radius: 6px;
  margin-bottom: 66px;
`;

const TestP = styled.p`
  text-align: center;
`;
