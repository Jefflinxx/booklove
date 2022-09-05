import { useSelector, useDispatch } from "react-redux";
import { actionType } from "../../reducer/rootReducer";

import styled from "styled-components";
import { useEffect, useState } from "react";

import TopSection from "../../components/TopSection/TopSection";
import { auth } from "../../utils/firebase";
import { initUser, getUserLibrary } from "../../utils/firestore";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";

function Home() {
  const dispatch = useDispatch();
  const navigator = useNavigate();
  const user = useSelector((state) => state.userReducer);
  const library = useSelector((state) => state.currentLibraryReducer);
  const [signState, setSignState] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  //const [errorMessage, setErrorMessage] = useState(null);

  //console.log("error", errorMessage);
  console.log(library);
  useEffect(() => {
    console.log(user);
    if (user) {
      getUserLibrary(user.uid).then((v) => {
        dispatch({
          type: actionType.LIBRARY.SETLIBRARY,
          value: v.library,
        });
        // const a = [...library, v.library];
        // console.log(typeof a);
        // setLibrary(a);
        // setLibrary((pre) => {
        //   return [...pre, v.library]
        // })
      });
    }
  }, [user]);

  return (
    <>
      <TopSection />
      {user ? (
        <>
          <Center>
            <PlusIconDivWrapper>
              <PlusIconDiv
                onClick={() => {
                  navigator("./search");
                }}
              >
                <PlusIcon />+
              </PlusIconDiv>
            </PlusIconDivWrapper>
          </Center>
          <Center>
            <Bookcase>
              {console.log(typeof [])}
              {library.map((i) => {
                return (
                  <BookDiv>
                    <BookImg
                      src={i.cover}
                      onClick={() => {
                        dispatch({
                          type: actionType.BOOK.SETBOOKDATA,
                          value: i,
                        });
                        navigator(`./book/${user.uid}${i.isbn}`);
                      }}
                    ></BookImg>
                    <BookName
                      onClick={() => {
                        dispatch({
                          type: actionType.BOOK.SETBOOKDATA,
                          value: i,
                        });
                        navigator(`./book/${user.uid}${i.isbn}`);
                      }}
                    >
                      {i.bookname}
                    </BookName>
                  </BookDiv>
                );
              })}
            </Bookcase>
          </Center>
        </>
      ) : (
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
                    localStorage.setItem("user", JSON.stringify(u.user));
                    console.log("註冊成功");
                    dispatch({ type: actionType.USER.SETUSER, value: u.user });
                    initUser(u.user.uid, u.user.email);
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
                    localStorage.user = JSON.stringify(u.user);
                    console.log("登入成功");
                    dispatch({ type: actionType.USER.SETUSER, value: u.user });
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
                setEmail(e.target.value.replace(/^\s*/, ""));
              }}
              value={email}
            ></Input>
            <Input
              placeholder="密碼"
              type="password"
              onChange={(e) => {
                setPassword(e.target.value.replace(/^\s*/, ""));
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
        </LoginPage>
      )}
    </>
  );
}

export default Home;

const Center = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

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

const Signup = styled.div`
  width: 200px;
  height: 50px;
  border: 1px solid black;
  background: ${(props) => (props.signState === "signup" ? "gray" : "none")};
`;

const Signin = styled.div`
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

const PlusIconDivWrapper = styled.div`
  width: 80%;
  display: flex;
  align-items: center;
  justify-content: flex-end;
`;

const PlusIconDiv = styled.div`
  width: 40px;
  height: 40px;
  border: 1px solid black;
`;

const PlusIcon = styled.div``;

const Bookcase = styled.div`
  border: 1px solid black;

  margin: 100px 0px;
  width: 80%;
  display: flex;
  align-items: center;
  ${"" /* justify-content: center; */}
  flex-wrap: wrap;
`;

const BookDiv = styled.div`
  width: 30%;
  height: 400px;
  border: 1px solid black;
`;

const BookImg = styled.img`
  width: 100px;
  height: 100px;
`;

const BookName = styled.p``;
