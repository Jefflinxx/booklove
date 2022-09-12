import { useSelector, useDispatch } from "react-redux";
import { actionType } from "../../reducer/rootReducer";

import styled from "styled-components";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../utils/firebase";

import TopSection from "../../components/TopSection/TopSection";

import { User } from "../../reducer/userReducer";
import { CurrentBook } from "../../reducer/currentBookReducer";
import { getUserInfo } from "../../utils/firestore";
import { useNavigate, useLocation } from "react-router-dom";

function Home() {
  const Location = useLocation();
  const dispatch = useDispatch();
  const navigator = useNavigate();
  const user = useSelector((state: { userReducer: User }) => state.userReducer);
  const library = useSelector(
    (state: { currentLibraryReducer: CurrentBook[] }) =>
      state.currentLibraryReducer
  );
  const localPath = Location.pathname.split("/")[1];

  useEffect(() => {
    console.log(user);
    console.log(localPath);
    console.log(localPath === "");

    if (user?.library) {
      console.log(user.library);
      if (localPath === user.uid || localPath === "") {
        getUserInfo(user.uid).then((v) => {
          dispatch({
            type: actionType.LIBRARY.SETLIBRARY,
            value: v?.library,
          });
        });
      } else {
        getUserInfo(localPath).then((v) => {
          if (!v) {
            dispatch({
              type: actionType.LIBRARY.SETLIBRARY,
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
          } else if (v) {
            dispatch({
              type: actionType.LIBRARY.SETLIBRARY,
              value: v.library,
            });
          }
        });
      }
    }
  }, [localPath, user]);
  // useEffect(() => {
  //   onAuthStateChanged(auth, async (u) => {
  //     console.log("監聽登入變化");
  //     if (u) {
  //       const uid = u.uid;
  //       const user = await getUserInfo(uid);
  //       dispatch({
  //         type: actionType.USER.SETUSER,
  //         value: user || null,
  //       });
  //     } else {
  //       navigator("../login");
  //     }
  //   });
  // }, []);
  console.log(user);

  return (
    <>
      <TopSection />
      {user ? (
        <>
          <Center>
            <PlusIconDivWrapper>
              <PlusIconDiv
                $uid={user.uid}
                localPath={localPath}
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
        <></>
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

const PlusIconDivWrapper = styled.div`
  width: 80%;
  display: flex;
  align-items: center;
  justify-content: flex-end;
`;

const PlusIconDiv = styled.div<{ localPath: string; $uid: string }>`
  width: 40px;
  height: 40px;
  border: 1px solid black;
  display: ${(props) => {
    console.log(props.localPath === "");
    if (props.localPath === props.$uid || props.localPath === "") {
      return "block";
    } else return "none";
  }};
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
