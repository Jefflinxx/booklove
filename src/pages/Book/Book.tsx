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
import { async } from "@firebase/util";

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
      <Center>
        <TopIconDivWrapper>
          <BackDiv
            onClick={() => {
              navigator(-1);
            }}
          >
            <Back></Back>Back
          </BackDiv>
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
            <EditIcon></EditIcon>edit
          </EditIconDiv>
        </TopIconDivWrapper>
      </Center>

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
            <LikeP>本書全站讚數</LikeP>
            <Like>{totalLike}</Like>
          </SectionItem>
        </TopRightSection>
      </TopSection>

      <BottomSection>
        <SectionItem>
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
        </SectionItem>
        <SectionItem>
          <PlaceP>地點</PlaceP>
          <Place>{currentBook.place}</Place>
        </SectionItem>
        <SectionItem>
          <LendToP>出借給</LendToP>
          <LendTo>{currentBook.lendTo}</LendTo>
        </SectionItem>
        <SummaryP>書摘</SummaryP>
        <Summary>{currentBook.summary}</Summary>
      </BottomSection>
    </>
  );
}

export default Book;

const Center = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const TopIconDivWrapper = styled.div`
  width: 80%;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const BackDiv = styled.div`
  width: 40px;
  height: 40px;
  border: 1px solid black;
`;
const Back = styled.div``;

const EditIconDiv = styled.div`
  width: 40px;
  height: 40px;
  border: 1px solid black;
`;

const EditIcon = styled.div``;

const TopSection = styled.div`
  display: flex;
`;

const BookImg = styled.img`
  width: 100px;
  height: 120px;
  border: 1px solid black;
`;

const TopRightSection = styled.div``;

const SectionItem = styled.div`
  display: flex;
`;

const BooknameP = styled.div``;
const Bookname = styled.div``;

const CategoryP = styled.div``;
const Category = styled.div``;

const LikeP = styled.div``;
const Like = styled.div``;

const ProgressP = styled.div``;
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

const PlaceP = styled.div``;
const Place = styled.div``;

const LendToP = styled.div``;
const LendTo = styled.div``;

const SummaryP = styled.div``;
const Summary = styled.div``;

const BottomSection = styled.div``;
