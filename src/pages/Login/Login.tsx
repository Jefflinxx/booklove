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
                // getUserInfo(u.user.uid).then((v) => {
                //   dispatch({ type: actionType.USER.SETUSER, value: v });
                // });
                //navigator("../");
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
                // getUserInfo(u.user.uid).then((v) => {
                //   dispatch({ type: actionType.USER.SETUSER, value: v });
                // });
                //navigator("../");
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
          placeholder="帳號"
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
      <p>jeffxxtest@gmail.com</p>
      <p>12345678</p>
      <p>xxxx55554@gmail.com</p>
      <p>123456</p>
    </LoginPage>
  );
};

export default Login;

const LoginPage = styled.div`
  z-index: 3;
  position: fixed;
  top: 56px;
  left: 0px;

  width: 100vw;
  height: 100vh;
  background: white;
  border: 1px solid black;

  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
`;

const LoginButtonDiv = styled.div`
  width: 400px;
  height: 50px;
  border: 1px solid black;
  display: flex;
`;

const Signup = styled.div<{ signState: string }>`
  width: 200px;
  height: 50px;
  border: 1px solid black;
  background: ${(props) => (props.signState === "signup" ? "gray" : "none")};
`;

const Signin = styled.div<{ signState: string }>`
  width: 200px;
  height: 50px;
  border: 1px solid black;
  background: ${(props) => (props.signState === "signin" ? "gray" : "none")};
`;

const Form = styled.form`
  width: 400px;
  height: 300px;
  border: 1px solid black;
`;

const Input = styled.input`
  display: block;
  width: 400px;
  height: 40px;
  border: 1px solid black;
`;

const Button = styled.button`
  width: 100px;
  height: 40px;
  border: 1px solid black;
`;
