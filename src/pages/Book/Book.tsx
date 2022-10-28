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
import edit from "../../assets/edit.svg";
import back from "../../assets/back.svg";

function Book() {
  const Location = useLocation();
  const dispatch = useDispatch();
  const navigator = useNavigate();
  const currentBook = useSelector(
    (state: { currentBookReducer: CurrentBook }) => state.currentBookReducer
  );
  const user = useSelector((state: { userReducer: User }) => state.userReducer);
  const [progressArray, setProgressArray] = useState<number[]>([0]);
  const [clickProgress, setClickProgress] = useState<number[]>([]);
  const [totalLike, setTotalLike] = useState<number | null>(null);
  const progressRows: number[] = [];
  for (let i = 1; i <= currentBook.totalChapter; i++) {
    progressRows.push(i);
  }
  const localPath = Location.pathname.split("/")[2];
  const bookId = localPath.slice(-13);
  const userId = localPath.split(bookId)[0];

  useEffect(() => {
    if (currentBook) {
      const boxes: number[] = [];
      for (let j = 1; j <= currentBook.alreadyReadChapter; j++) {
        boxes.push(j);
      }
      setProgressArray(boxes);
      setClickProgress(boxes);
    }

    let likeCounter: number = 0;
    const getTotalLike = async () => {
      const allUsers = await getAllUserDoc();

      allUsers.forEach((i: User) => {
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

  return (
    <>
      <WholeWrapper>
        <WholeCenterWrapper>
          <TopIconDivWrapper>
            <BackIconDiv
              onClick={() => {
                // navigator(-1);
                navigator("../");
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
                { key: "書名", content: currentBook.bookname },
                { key: "作者", content: currentBook.author },
                { key: "出版", content: currentBook.publisher },
              ].map((i) => {
                return (
                  <SectionItem key={i.key}>
                    <BooknameP>{i.key}</BooknameP>
                    <Bookname>{i.content}</Bookname>
                  </SectionItem>
                );
              })}
              <SectionItem>
                <CategoryP>分類</CategoryP>
                {!currentBook?.category?.length && <Content>無</Content>}
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
                {!progressRows.length && "未設定"}
                {progressRows.map((i) => (
                  <Progress
                    $i={i}
                    progressArray={progressArray}
                    key={i}
                    onMouseEnter={() => {
                      if (userId !== user.uid) return;
                      setProgressArray(() => {
                        const boxes: number[] = [];
                        for (let j = 1; j <= i; j++) {
                          boxes.push(j);
                        }
                        return [...boxes];
                      });
                    }}
                    onMouseLeave={() => {
                      if (userId !== user.uid) return;
                      setProgressArray(clickProgress);
                    }}
                    onClick={async () => {
                      if (userId !== user.uid) return;
                      const nArr = [];
                      let x = 1;
                      while (x <= i) {
                        nArr.push(x);
                        x++;
                      }
                      setClickProgress(nArr);
                      const userData = await getUserInfo(user.uid);
                      if (userData) {
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
                    if (userId !== user.uid) return;
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
              <Place>
                {!!currentBook.page ? `${currentBook.page}頁` : `未設定`}
              </Place>
            </SectionBItem>
            <SectionBItem>
              <PlaceP>放置位置</PlaceP>
              <Place>{currentBook.place || "未設定"}</Place>
            </SectionBItem>
            <SectionBItem>
              <LendToP>出借給</LendToP>
              <LendTo>{currentBook.lendTo || "無"}</LendTo>
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
  margin: 120px 0px 150px 0px;
  @media screen and (max-width: 620px) {
    margin: 60px 0px 120px 0px;
  }
`;

const TopIconDivWrapper = styled.div`
  width: 1080px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px;
  @media screen and (max-width: 1100px) {
    width: 900px;
    margin-bottom: 32px;
  }
  @media screen and (max-width: 920px) {
    width: 560px;
  }
  @media screen and (max-width: 620px) {
    width: 348px;
  }
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
  @media screen and (max-width: 920px) {
    width: 560px;
    flex-direction: column;
  }
  @media screen and (max-width: 620px) {
    width: 348px;
    margin-bottom: 0px;
  }
`;

const BookImg = styled.img`
  width: 260px;
  height: 320px;

  margin-right: 80px;
  box-shadow: 0 12px 28px 0 rgba(0, 0, 0, 0.2), 0 2px 4px 0 rgba(0, 0, 0, 0.1);
  @media screen and (max-width: 920px) {
    margin-right: 0px;
    margin-bottom: 32px;
  }
`;

const TopRightSection = styled.div`
  border-left: 3px solid #3f612d;
  height: auto;
  @media screen and (max-width: 920px) {
    border-left: none;
  }
`;

const SectionItem = styled.div`
  display: flex;
  font-size: 24px;
  margin-left: 32px;
  color: #3f612d;
  min-height: 64px;
  @media screen and (max-width: 620px) {
    flex-direction: column;
    margin-left: 0px;
  }
`;

const SectionBItem = styled.div`
  display: flex;
  font-size: 24px;
  margin-left: 32px;
  color: #3f612d;
  min-height: 64px;
  @media screen and (max-width: 620px) {
    flex-direction: column;
    margin-left: 0px;
  }
`;

const ProgressSectionBItem = styled(SectionBItem)`
  position: relative;
`;

const Title = styled.div`
  width: 120px;
`;

const Content = styled.div`
  color: #1f2e16;
  word-wrap: break-word;
  width: 400px;
  @media screen and (max-width: 620px) {
    width: 320px;
    margin-bottom: 16px;
  }
`;

const BooknameP = styled(Title)``;
const Bookname = styled(Content)``;

const CategoryP = styled(Title)``;
const Category = styled(Content)`
  margin-right: 8px;
`;

const LikeP = styled(Title)``;
const Like = styled(Content)``;

const ProgressP = styled(Title)``;
const ProgressPercent = styled.div`
  display: flex;
  width: 90px;
  color: #1f2e16;
  justify-content: center;
  @media screen and (max-width: 620px) {
    position: absolute;
    top: 0px;
    right: 0px;
    justify-content: flex-end;
  }
`;

const ProgressWrapper = styled.div`
  width: 400px;
  display: flex;
  border-radius: 6px;
  overflow: hidden;
  margin-right: 40px;
  color: #1f2e16;
  @media screen and (max-width: 620px) {
    width: 320px;
    margin-right: 0px;
    margin-bottom: 16px;
  }
`;

const ProgressTip = styled.p`
  display: none;
  cursor: pointer;
  :hover {
    color: #1f2e16;
  }
  @media screen and (max-width: 920px) {
    display: none;
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

const PlaceP = styled(Title)``;
const Place = styled(Content)``;

const LendToP = styled(Title)``;
const LendTo = styled(Content)``;

const SummaryP = styled(Title)`
  font-size: 24px;
  margin-left: 32px;
  color: #3f612d;
  min-height: 52px;
  @media screen and (max-width: 620px) {
    width: 320px;
    margin-left: 0px;
    min-height: auto;
  }
`;

const Summary = styled(Content)`
  margin: 0px 54px 0px 32px;
  width: auto;
  @media screen and (max-width: 620px) {
    margin: 0px;
  }
`;

const BottomSection = styled.div`
  width: 900px;
  border-left: 3px solid #3f612d;
  margin-bottom: 54px;
  @media screen and (max-width: 920px) {
    width: 560px;
    border: none;
  }
  @media screen and (max-width: 620px) {
    display: flex;
    display: flex;
    align-items: center;
    flex-direction: column;
    width: 348px;
  }
`;
