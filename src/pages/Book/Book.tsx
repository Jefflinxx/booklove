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
import parser from "html-react-parser";
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
  const displayLibrary = useSelector(
    (state: { displayLibraryReducer: CurrentBook[] }) =>
      state.displayLibraryReducer
  );
  //alreadyChapter
  const [progressArray, setProgressArray] = useState<number[]>([0]);
  const [totalLike, setTotalLike] = useState<number | null>(null);
  //totalChapter
  const progressRows: number[] = [];
  for (let i = 1; i <= currentBook.totalChapter; i++) {
    progressRows.push(i);
  }

  const localPath = Location.pathname.split("/")[2];
  const bookId = localPath.slice(-13);
  const userId = localPath.split(bookId)[0];

  useEffect(() => {
    setProgressArray(() => {
      const a: number[] = [];
      for (let j = 1; j <= currentBook.alreadyReadChapter; j++) {
        a.push(j);
      }
      return a;
    });

    let likeCounter: number = 0;
    const getTotalLike = async () => {
      const a = await getAllUserDoc();

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
  }, [currentBook]);

  // useEffect(() => {
  //   getUserInfo(user.uid).then((v) => {
  //     dispatch({
  //       type: actionType.USER.SETUSER,
  //       value: v,
  //     });
  //   });
  // }, []);

  return (
    <>
      <WholeWrapper>
        <WholeCenterWrapper>
          <TopIconDivWrapper>
            <BackIconDiv
              onClick={() => {
                navigator("../../");
              }}
            >
              <BackIcon src={back}></BackIcon>
            </BackIconDiv>
            {userId === user?.uid && (
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
            )}
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
                  <SectionItem key={i.key}>
                    <BooknameP>{i.key}</BooknameP>
                    <Bookname>{i.v}</Bookname>
                  </SectionItem>
                );
              })}
              <SectionItem>
                <CategoryP>分類</CategoryP>
                {currentBook?.category?.map((i) => {
                  return <Category key={i}>{i}</Category>;
                })}
                {/* <Category>{currentBook.category}</Category> */}
              </SectionItem>

              <SectionItem>
                <LikeP>全站讚數</LikeP>
                <Like>{totalLike}</Like>
              </SectionItem>
            </TopRightSection>
          </TopSection>

          <BottomSection>
            <ProgressSectionBItem>
              <ProgressP>進度</ProgressP>
              <ProgressWrapper>
                {progressRows.map((i) => (
                  <Progress
                    $i={i}
                    progressArray={progressArray}
                    key={i}
                    onMouseEnter={() => {
                      setProgressArray(() => {
                        const a: number[] = [];
                        for (let j = 1; j <= i; j++) {
                          a.push(j);
                        }
                        return [...a];
                      });
                    }}
                    onMouseLeave={() => {
                      setProgressArray(() => {
                        const a: number[] = [];
                        for (
                          let j = 1;
                          j <= currentBook.alreadyReadChapter;
                          j++
                        ) {
                          a.push(j);
                        }
                        return a;
                      });
                    }}
                    onClick={async () => {
                      const userData = await getUserInfo(user.uid);
                      if (userData) {
                        // setProgressArray(() => {
                        //   const a: number[] = [];
                        //   for (let j = 1; j <= i; j++) {
                        //     a.push(j);
                        //   }
                        //   return [...a];
                        // });
                        if (i === currentBook.totalChapter) {
                          updateUserLibrary(user.uid, [
                            {
                              ...currentBook,
                              alreadyReadChapter: i,
                              isFinishRead: true,
                            },
                            ...userData.library.filter(
                              (i) => i.isbn !== currentBook.isbn
                            ),
                          ]);

                          dispatch({
                            type: actionType.BOOK.SETBOOKDATA,
                            value: {
                              ...currentBook,
                              alreadyReadChapter: i,
                              isFinishRead: true,
                            },
                          });
                        } else {
                          updateUserLibrary(user.uid, [
                            {
                              ...currentBook,
                              alreadyReadChapter: i,
                              isFinishRead: false,
                            },
                            ...userData.library.filter(
                              (i) => i.isbn !== currentBook.isbn
                            ),
                          ]);

                          dispatch({
                            type: actionType.BOOK.SETBOOKDATA,
                            value: {
                              ...currentBook,
                              alreadyReadChapter: i,
                              isFinishRead: false,
                            },
                          });
                        }
                      }
                    }}
                  ></Progress>
                ))}
              </ProgressWrapper>
              {progressArray.length ? (
                <ProgressPercent>
                  {Math.floor(
                    (Math.max(...progressArray) / currentBook.totalChapter) *
                      100
                  )}
                  %
                </ProgressPercent>
              ) : (
                <ProgressTip
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
                  編輯/點擊輸入章節
                </ProgressTip>
              )}
            </ProgressSectionBItem>
            <SectionBItem>
              <PlaceP>書籤頁</PlaceP>
              <Place>{currentBook.page && `${currentBook.page}頁`}</Place>
            </SectionBItem>
            <SectionBItem>
              <PlaceP>放置位置</PlaceP>
              <Place>{currentBook.place}</Place>
            </SectionBItem>
            <SectionBItem>
              <LendToP>出借給</LendToP>
              <LendTo>{currentBook.lendTo}</LendTo>
            </SectionBItem>
            <SummaryP>書摘</SummaryP>
            <Summary>{parser(currentBook.summary || "")}</Summary>
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
  background: #f6d4ba;
`;

const WholeCenterWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  flex-direction: column;
  width: 902px;

  border-radius: 6px;
  margin: 120px 0px;
`;

const TopIconDivWrapper = styled.div`
  width: 1080px;
  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 8px;
`;

const BackIconDiv = styled.div`
  position: relative;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  cursor: pointer;
  :hover {
    background: #f3b391;
  }
`;
const BackIcon = styled.img`
  position: absolute;
  top: 8px;
  left: 10px;
  width: 14px;
  fill: #f3b391;
`;

const EditIconDiv = styled.div`
  position: relative;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  cursor: pointer;
  :hover {
    background: #f3b391;
  }
`;
const EditIcon = styled.img`
  position: absolute;
  top: 8px;
  left: 8px;
  width: 20px;
`;

const TopSection = styled.div`
  display: flex;
  width: 900px;
  display: flex;
  align-items: center;
  margin-bottom: 60px;
`;

const BookImg = styled.img`
  width: 260px;
  height: 320px;

  margin-right: 80px;
  box-shadow: 0 12px 28px 0 rgba(0, 0, 0, 0.2), 0 2px 4px 0 rgba(0, 0, 0, 0.1);
`;

const TopRightSection = styled.div`
  border-left: 3px solid #3f612d;
  height: auto;
`;

const SectionItem = styled.div`
  display: flex;

  font-size: 24px;
  margin-left: 32px;

  color: #3f612d;
  min-height: 64px;
`;

const SectionBItem = styled.div`
  display: flex;

  font-size: 24px;
  margin-left: 32px;

  color: #3f612d;
  min-height: 64px;
`;

const ProgressSectionBItem = styled(SectionBItem)`
  justify-content: space-between;
`;

const BooknameP = styled.div`
  width: 120px;
`;
const Bookname = styled.div`
  width: 400px;
  color: #1f2e16;
`;

const CategoryP = styled.div`
  width: 120px;
`;
const Category = styled.div`
  margin-right: 8px;

  color: #1f2e16;
`;

const LikeP = styled.div`
  width: 120px;
`;
const Like = styled.div`
  color: #1f2e16;
`;

const ProgressP = styled.div`
  width: 120px;
`;
const ProgressPercent = styled.div`
  display: flex;
  width: 90px;
  color: #1f2e16;
  justify-content: center;
`;

const ProgressWrapper = styled.div`
  width: 400px;
  display: flex;
  border-radius: 6px;
  overflow: hidden;
`;
const ProgressTip = styled.p`
  cursor: pointer;
  :hover {
    color: #1f2e16;
  }
`;
const Progress = styled.div<{ progressArray: number[]; $i: number }>`
  width: 40px;
  height: 32px;
  margin: 0px 1px;
  border-radius: 6px;
  border: 1px solid #3f612d;
  transition: background 1s;
  :hover {
    background: #f3b391;
  }
  cursor: pointer;
  background: ${(props) =>
    props.progressArray.find((j) => j === props.$i) ? "#f3b391" : "#fefadc "};
`;

const PlaceP = styled.div`
  width: 120px;
`;
const Place = styled.div`
  color: #1f2e16;
`;

const LendToP = styled.div`
  width: 120px;
`;
const LendTo = styled.div`
  color: #1f2e16;
`;

const SummaryP = styled.div`
  width: 120px;

  font-size: 24px;
  margin-left: 32px;

  color: #3f612d;
  min-height: 52px;
`;
const Summary = styled.div`
  margin: 0px 54px 0px 32px;
  color: #1f2e16;
`;

const BottomSection = styled.div`
  width: 900px;
  border-left: 3px solid #3f612d;
  margin-bottom: 54px;
`;
