import { useDispatch } from "react-redux";
import { actionType } from "../../reducer/rootReducer";
import ReactLoading from "react-loading";
import styled from "styled-components";
import { useState } from "react";
import pic from "../../assets/login.jpeg";
import { auth } from "../../utils/firebase";
import { initUser, getUserInfo } from "../../utils/firestore";
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
  const [signState, setSignState] = useState<string>("signin");
  const [email, setEmail] = useState<string>("fortest@t.com");
  const [password, setPassword] = useState<string>("123456");
  const [loading, setLoading] = useState<boolean>(false);

  return (
    <LoginPage>
      <PicWrapper>
        <Pic src={pic}></Pic>
      </PicWrapper>
      {loading && (
        <WholePageLoading>
          <ReactLoading type="cylon" color="black" width={100} />
        </WholePageLoading>
      )}
      <TitleWrapper>
        <Title>BOOKLOVE</Title>
        <SubTitle>陪伴您閱讀的好朋友</SubTitle>
      </TitleWrapper>
      <LW>
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
              setLoading(true);

              if (signState === "signup") {
                createUserWithEmailAndPassword(auth, email, password)
                  .then((u) => {
                    dispatch({
                      type: actionType.USERID.SETUSERID,
                      value: u.user.uid,
                    });
                    initUser(u.user.uid, u.user.email!, defaultAvatar);
                    getUserInfo(u.user.uid).then((v) => {
                      dispatch({ type: actionType.USER.SETUSER, value: v });
                    });
                    navigator("../");
                    setLoading(false);
                  })
                  .catch((e) => {
                    if (e.code === "auth/email-already-in-use") {
                      alert("信箱已存在");
                    } else if (e.code === "auth/invalid-email") {
                      alert("信箱格式不正確");
                    } else if (e.code === "auth/week-password") {
                      alert("密碼強度不足");
                    }
                    setLoading(false);
                  });
              } else if (signState === "signin") {
                signInWithEmailAndPassword(auth, email, password)
                  .then((u) => {
                    dispatch({
                      type: actionType.USERID.SETUSERID,
                      value: u.user.uid,
                    });
                    getUserInfo(u.user.uid).then((v) => {
                      dispatch({ type: actionType.USER.SETUSER, value: v });
                    });
                    navigator("../");
                    setLoading(false);
                  })
                  .catch((e) => {
                    if (e.code === "auth/invalid-email") {
                      alert("信箱格式不正確");
                    } else if (e.code === "auth/user-not-found") {
                      alert("信箱不存在");
                    } else if (e.code === "auth/wrong-password") {
                      alert("密碼錯誤");
                    }
                    setLoading(false);
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
      </LW>
    </LoginPage>
  );
};

export default Login;

const LoginPage = styled.div`
  z-index: 16;
  position: fixed;
  top: 0px;
  left: 0px;
  width: 100vw;
  height: 100vh;
  background: #f6d4ba;
  display: flex;
  align-items: center;
  justify-content: center;
  @media screen and (max-width: 1080px) {
    flex-direction: column;
  }
`;

const PicWrapper = styled.div`
  position: absolute;
  top: 0px;
  right: 0px;
  width: 500px;
  height: 100vh;
  background: #f6d4ba;
  @media screen and (max-width: 1080px) {
    display: none;
  }
`;

const Pic = styled.img`
  width: 500px;
  height: 100vh;
  object-fit: cover;
`;

const WholePageLoading = styled.div`
  z-index: 20;
  position: fixed;
  top: 0px;
  left: 0px;
  width: 100vw;
  height: 100vh;
  background: #f6d4ba;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const TitleWrapper = styled.div`
  width: 580px;
  height: 300px;
  display: flex;
  justify-content: center;
  flex-direction: column;
  @media screen and (max-width: 1080px) {
    align-items: center;
    height: auto;
  }
  @media screen and (max-width: 580px) {
    width: auto;
  }
`;

const Title = styled.p`
  font-size: 60px;
  font-weight: 500;
  line-height: 100px;
  color: #3f612d;
  font-family: "Inknut Antiqua", serif;
  @media screen and (max-width: 1080px) {
    display: flex;
    justify-content: center;
  }
  @media screen and (max-width: 580px) {
    font-size: 48px;
  }
  @media screen and (max-width: 400px) {
    font-size: 36px;
  }
`;

const SubTitle = styled.p`
  width: 500px;
  height: 84px;
  font-weight: 300;
  font-size: 28px;
  letter-spacing: 4px;
  @media screen and (max-width: 1080px) {
    display: flex;
    justify-content: center;
  }
  @media screen and (max-width: 580px) {
    font-size: 24px;
    width: 100vw;
  }
  @media screen and (max-width: 400px) {
    font-size: 20px;
  }
`;

const LW = styled.div`
  z-index: 17;
`;

const LoginWrapper = styled.div`
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgb(0 0 0 / 10%), 0 8px 16px rgb(0 0 0 / 10%);
  background: #f3b391;
  display: flex;
  align-items: center;
  flex-direction: column;
  @media screen and (max-width: 400px) {
    border-radius: 0px;
    background: #f6d4ba;
    box-shadow: none;
  }
`;

const LoginButtonDiv = styled.div`
  width: 364px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 16px 0px;
  border: 1px solid #f6d4ba;
  border-radius: 6px;
  @media screen and (max-width: 400px) {
    width: 90vw;
    border: 1px solid #fefadc;
  }
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
  background: ${(props) => (props.signState === "signup" ? "#3f612d" : "none")};
  @media screen and (max-width: 400px) {
    width: 50vw;
  }
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
  background: ${(props) => (props.signState === "signin" ? "#3f612d" : "none")};
  @media screen and (max-width: 400px) {
    width: 50vw;
  }
`;

const Form = styled.form`
  width: 400px;
  height: auto;
  display: flex;
  align-items: center;
  flex-direction: column;
  @media screen and (max-width: 400px) {
    width: 100vw;
  }
`;

const Input = styled.input`
  display: block;
  width: 364px;
  height: 52px;
  background: #fefadc;
  font-size: 21px;
  border-radius: 6px;
  margin-bottom: 16px;
  text-indent: 16px;
  user-select: auto;
  ::placeholder {
    color: gray;
  }
  @media screen and (max-width: 400px) {
    width: 90vw;
  }
`;

const Button = styled.button`
  width: 364px;
  height: 52px;
  border: none;
  font-size: 21px;
  background: #feea00;
  color: black;
  border-radius: 6px;
  margin-bottom: 36px;
  @media screen and (max-width: 400px) {
    width: 90vw;
  }
`;
