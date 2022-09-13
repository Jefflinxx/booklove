import { useSelector, useDispatch } from "react-redux";
import { actionType } from "../../reducer/rootReducer";

import styled from "styled-components";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../utils/firebase";

import TopSection from "../../components/TopSection/TopSection";

import { User } from "../../reducer/userReducer";
import { CurrentBook } from "../../reducer/currentBookReducer";
import { getUserInfo, updateCategory } from "../../utils/firestore";
import { useNavigate, useLocation } from "react-router-dom";
import { async } from "@firebase/util";

function Home() {
  const Location = useLocation();
  const dispatch = useDispatch();
  const navigator = useNavigate();
  const user = useSelector((state: { userReducer: User }) => state.userReducer);
  const library = useSelector(
    (state: { currentLibraryReducer: CurrentBook[] }) =>
      state.currentLibraryReducer
  );
  const [categorySelectActive, setCategorySelectActive] =
    useState<boolean>(false);
  const [categoryAllActive, setCategoryAllActive] = useState<boolean>(false);
  const [categoryReadActive, setCategoryReadActive] = useState<boolean>(false);
  const [categoryLendActive, setCategoryLendActive] = useState<boolean>(false);
  const [categoryInput, setCategoryInput] = useState<string>("");
  const [categoryCurrent, setCategoryCurrent] = useState<string | null>(null);
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
              <LendToOther
                onClick={async () => {
                  setCategoryLendActive(true);
                  let categoryResult: CurrentBook[] = [];

                  const a = await getUserInfo(user.uid);

                  a?.library?.forEach((j) => {
                    if (j?.isLendTo) {
                      categoryResult = [...categoryResult, j];
                    }
                  });
                  dispatch({
                    type: actionType.LIBRARY.SETLIBRARY,
                    value: categoryResult,
                  });
                  setCategoryCurrent(null);
                  setCategoryAllActive(false);
                  setCategoryReadActive(false);
                }}
              >
                出借中{categoryLendActive && `(${library.length})`}
              </LendToOther>

              <FinishRead
                onClick={async () => {
                  setCategoryReadActive(true);
                  let categoryResult: CurrentBook[] = [];

                  const a = await getUserInfo(user.uid);

                  a?.library?.forEach((j) => {
                    if (j?.isFinishRead) {
                      categoryResult = [...categoryResult, j];
                    }
                  });
                  dispatch({
                    type: actionType.LIBRARY.SETLIBRARY,
                    value: categoryResult,
                  });
                  setCategoryCurrent(null);
                  setCategoryAllActive(false);
                  setCategoryLendActive(false);
                }}
              >
                完成閱讀{categoryReadActive && `(${library.length})`}
              </FinishRead>

              <CategoryAll
                onClick={async () => {
                  setCategoryAllActive(true);
                  const a = await getUserInfo(user.uid);
                  dispatch({
                    type: actionType.LIBRARY.SETLIBRARY,
                    value: a?.library || [],
                  });
                  setCategoryCurrent(null);
                  setCategoryReadActive(false);
                  setCategoryLendActive(false);
                }}
              >
                全部{categoryAllActive && `(${library.length})`}
              </CategoryAll>
              <CategoryButton
                onClick={() => {
                  setCategorySelectActive(!categorySelectActive);
                  setCategoryAllActive(false);
                  setCategoryReadActive(false);
                  setCategoryLendActive(false);
                }}
              >
                類別
                {categoryCurrent && `:${categoryCurrent}(${library?.length})`}
              </CategoryButton>
              <CategoryWrapper categorySelectActive={categorySelectActive}>
                {user?.category?.map((i) => {
                  return (
                    <CategoryDiv
                      onClick={async () => {
                        let categoryResult: CurrentBook[] = [];

                        const a = await getUserInfo(user.uid);

                        a?.library?.forEach((j) => {
                          console.log(j);
                          j?.category?.forEach((k) => {
                            if (k === i) {
                              categoryResult = [...categoryResult, j];
                            }
                          });
                        });
                        dispatch({
                          type: actionType.LIBRARY.SETLIBRARY,
                          value: categoryResult,
                        });
                        setCategoryCurrent(i);
                        setCategorySelectActive(false);
                      }}
                    >
                      {i}
                    </CategoryDiv>
                  );
                })}
              </CategoryWrapper>
              <CategoryInput
                onChange={(e) => {
                  setCategoryInput(e.target.value);
                }}
              />
              <CategoryPlus
                onClick={() => {
                  if (user?.category) {
                    updateCategory(user.uid, [...user.category, categoryInput]);
                    dispatch({
                      type: actionType.USER.SETUSER,
                      value: {
                        ...user,
                        category: [...user.category, categoryInput],
                      },
                    });
                  } else {
                    updateCategory(user.uid, [categoryInput]);
                    dispatch({
                      type: actionType.USER.SETUSER,
                      value: { ...user, category: [categoryInput] },
                    });
                  }
                }}
              >
                +
              </CategoryPlus>

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
  position: relative;
  margin: 100px 0px;
  width: 80%;
  display: flex;
  align-items: center;
  ${"" /* justify-content: center; */}
  flex-wrap: wrap;
`;

const LendToOther = styled.div`
  border: 1px solid black;
  position: absolute;
  top: -30px;
  left: 50px;
`;

const FinishRead = styled.div`
  border: 1px solid black;
  position: absolute;
  top: -30px;
  left: 120px;
`;

const CategoryAll = styled.div`
  border: 1px solid black;
  position: absolute;
  top: -30px;
  left: 200px;
`;

const CategoryButton = styled.div`
  border: 1px solid black;
  position: absolute;
  top: -30px;
  left: 250px;
`;

const CategoryWrapper = styled.div<{ categorySelectActive: boolean }>`
  width: 200px;
  height: auto;
  border: 1px solid black;
  position: absolute;
  top: -5px;
  left: 250px;
  z-index: 1;
  background: white;
  display: ${(props) => (props.categorySelectActive ? "block" : "none")};
`;

const CategoryDiv = styled.div`
  border: 1px solid black;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const CategoryInput = styled.input`
  border: 1px solid black;
  position: absolute;
  top: -30px;
  left: 350px;
`;
const CategoryPlus = styled.div`
  border: 1px solid black;
  position: absolute;
  top: -30px;
  left: 500px;
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
