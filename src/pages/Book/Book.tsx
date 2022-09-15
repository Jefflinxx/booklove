import styled from "styled-components";
import { actionType } from "../../reducer/rootReducer";
import { User } from "../../reducer/userReducer";
import { CurrentBook } from "../../reducer/currentBookReducer";
import {
  getUserInfo,
  updateUserLibrary,
  getAllUserDoc,
} from "../../utils/firestore";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import edit from "./edit.svg";
import back from "./back.svg";

function Book() {
  const Location = useLocation();
  const dispatch = useDispatch();
  const navigator = useNavigate();
  const currentBook = useSelector(
    (state: { currentBookReducer: CurrentBook }) => state.currentBookReducer
  );
  const user = useSelector((state: { userReducer: User }) => state.userReducer);
  const library = useSelector(
    (state: { currentLibraryReducer: CurrentBook[] }) =>
      state.currentLibraryReducer
  );
  const [progressArray, setProgressArray] = useState<number[]>([0]);
  const [totalLike, setTotalLike] = useState<number | null>(null);

  const progressRows: number[] = [];
  for (let i = 1; i <= currentBook.totalChapter; i++) {
    progressRows.push(i);
  }

  console.log(progressArray);

  const a = Location.pathname.split("/")[2];
  const bookId = a.slice(-13);
  const userId = a.split(bookId)[0];
  console.log(bookId);

  useEffect(() => {
    console.log(userId);
    getUserInfo(userId).then((v) => {
      if (v) {
        dispatch({
          type: actionType.LIBRARY.SETLIBRARY,
          value: v.library,
        });
      }
    });
    setProgressArray(() => {
      const a: number[] = [];
      for (let i = 1; i <= currentBook.alreadyReadChapter; i++) {
        a.push(i);
      }
      return a;
    });
    let likeCounter: number = 0;
    const getTotalLike = async () => {
      const a = await getAllUserDoc();
      console.log(a);
      a.forEach((i) => {
        i.library?.forEach((j) => {
          if (j.isbn === currentBook.isbn && j.like) {
            likeCounter++;
          }
        });
      });
      setTotalLike(likeCounter);
    };

    getTotalLike();
  }, []);

  useEffect(() => {
    console.log(library);
    library.forEach((i) => {
      if (i.isbn === bookId) {
        dispatch({
          type: actionType.BOOK.SETBOOKDATA,
          value: i,
        });
      }
    });
  }, [library]);

  return (
    <>
      <WholeWrapper>
        <WholeCenterWrapper>
          <TopIconDivWrapper>
            <BackIconDiv
              onClick={() => {
                navigator(-1);
              }}
            >
              <BackIcon src={back}></BackIcon>
            </BackIconDiv>
            <EditIconDiv
              onClick={() => {
                getUserInfo(user.uid).then((v) => {
                  dispatch({
                    type: actionType.USER.SETUSER,
                    value: v,
                  });
                  v?.library.forEach((i) => {
                    if (i.isbn === currentBook.isbn) {
                      dispatch({
                        type: actionType.BOOK.SETBOOKDATA,
                        value: i,
                      });
                    }
                  });
                });
                navigator(`../edit/${user.uid}${currentBook.isbn}`);
              }}
            >
              <EditIcon src={edit}></EditIcon>
            </EditIconDiv>
          </TopIconDivWrapper>

          <TopSection>
            <BookImg src={currentBook.cover} />
            <TopRightSection>
              {[
                { key: "書名", v: currentBook.bookname },
                { key: "作者", v: currentBook.author },
                { key: "出版", v: currentBook.publisher },
              ].map((i) => {
                return (
                  <SectionItem>
                    <BooknameP>{i.key}</BooknameP>
                    <Bookname>{i.v}</Bookname>
                  </SectionItem>
                );
              })}
              <SectionItem>
                <CategoryP>分類</CategoryP>
                <Category>{currentBook.category}</Category>
              </SectionItem>

              <SectionItem>
                <LikeP>全站讚數</LikeP>
                <Like>{totalLike}</Like>
              </SectionItem>
            </TopRightSection>
          </TopSection>

          <BottomSection>
            <SectionBItem>
              <ProgressP>進度{`${currentBook.totalChapter}`}</ProgressP>
              <ProgressWrapper>
                {progressRows.map((i) => (
                  <Progress
                    $i={i}
                    progressArray={progressArray}
                    key={i}
                    onClick={async () => {
                      const userData = await getUserInfo(user.uid);
                      if (userData) {
                        if (
                          //刪掉
                          progressArray.find((j) => j === i) &&
                          Math.max(...progressArray) === i
                        ) {
                          setProgressArray((prev) => {
                            prev.filter((k) => k !== i);
                            return [...prev.filter((k) => k !== i)];
                          });

                          updateUserLibrary(user.uid, [
                            ...userData.library.filter(
                              (i) => i.isbn !== currentBook.isbn
                            ),
                            {
                              ...currentBook,
                              alreadyReadChapter: i - 1,
                              isFinishRead: false,
                            },
                          ]);
                        } else if (
                          //增加
                          Math.max(...progressArray) + 1 === i ||
                          i === 1
                        ) {
                          setProgressArray((prev) => [...prev, i]);
                          if (i === Number(currentBook.totalChapter)) {
                            console.log("設為已讀完");
                            updateUserLibrary(user.uid, [
                              ...userData.library.filter(
                                (i) => i.isbn !== currentBook.isbn
                              ),
                              {
                                ...currentBook,
                                alreadyReadChapter: i,
                                isFinishRead: true,
                              },
                            ]);
                          } else {
                            updateUserLibrary(user.uid, [
                              ...userData.library.filter(
                                (i) => i.isbn !== currentBook.isbn
                              ),
                              {
                                ...currentBook,
                                alreadyReadChapter: i,
                                isFinishRead: false,
                              },
                            ]);
                          }
                        }
                      }
                    }}
                  ></Progress>
                ))}
              </ProgressWrapper>
            </SectionBItem>
            <SectionBItem>
              <PlaceP>地點</PlaceP>
              <Place>{currentBook.place}</Place>
            </SectionBItem>
            <SectionBItem>
              <LendToP>出借給</LendToP>
              <LendTo>{currentBook.lendTo}</LendTo>
            </SectionBItem>
            <SummaryP>書摘</SummaryP>
            <Summary>{currentBook.summary}</Summary>
          </BottomSection>
        </WholeCenterWrapper>
      </WholeWrapper>
    </>
  );
}

export default Book;

const WholeWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  background: #eff2f5;
  width: 100%;
`;

const WholeCenterWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #e4e6eb;
  flex-direction: column;
  width: 902px;
  background: #ffffff;
  border-radius: 6px;
  margin: 120px 0px;
`;

const TopIconDivWrapper = styled.div`
  width: 902px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
  padding: 8px;
`;

const BackIconDiv = styled.div`
  position: relative;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  :hover {
    background: rgba(200, 200, 200, 0.4);
  }
`;
const BackIcon = styled.img`
  position: absolute;
  top: 8px;
  left: 10px;
  width: 14px;
`;

const EditIconDiv = styled.div`
  position: relative;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  :hover {
    background: rgba(200, 200, 200, 0.4);
  }
`;
const EditIcon = styled.img`
  position: absolute;
  top: 8px;
  left: 8px;
  width: 20px;
`;

const TopSection = styled.div`
  border: 1px solid black;
  display: flex;
  width: 720px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const BookImg = styled.img`
  width: 180px;
  height: 250px;

  margin: 32px;
  box-shadow: 0 12px 28px 0 rgba(0, 0, 0, 0.2), 0 2px 4px 0 rgba(0, 0, 0, 0.1);
`;

const TopRightSection = styled.div``;

const SectionItem = styled.div`
  display: flex;
  border: 1px solid black;
  margin: 24px 0px;
  width: 440px;
`;

const SectionBItem = styled.div`
  display: flex;
  border: 1px solid black;
  margin: 24px 0px 24px 54px;
`;

const BooknameP = styled.div`
  width: 90px;
  color: gray;
`;
const Bookname = styled.div``;

const CategoryP = styled.div`
  width: 90px;
  color: gray;
`;
const Category = styled.div``;

const LikeP = styled.div`
  width: 90px;
  color: gray;
`;
const Like = styled.div``;

const ProgressP = styled.div`
  width: 90px;
  color: gray;
`;
const ProgressWrapper = styled.div`
  display: flex;
  border-radius: 20px;
  border-left: 2px solid black;
  border-right: 2px solid black;
  overflow: hidden;
`;
const Progress = styled.div<{ progressArray: number[]; $i: number }>`
  width: 40px;
  height: 40px;
  border: 1px solid black;
  background: ${(props) =>
    props.progressArray.find((j) => j === props.$i) ? "blue" : "white"};
`;

const PlaceP = styled.div`
  width: 90px;
  color: gray;
`;
const Place = styled.div``;

const LendToP = styled.div`
  width: 90px;
  color: gray;
`;
const LendTo = styled.div``;

const SummaryP = styled.div`
  width: 90px;
  color: gray;
  margin: 24px 0px 12px 54px;
`;
const Summary = styled.div`
  border: 1px solid black;
  margin: 0px 0px 24px 54px;
`;

const BottomSection = styled.div`
  width: 720px;
  border: 1px solid black;
  margin-bottom: 54px;
`;
