import styled from "styled-components";
import { actionType } from "../../reducer/rootReducer";
import { User } from "../../reducer/userReducer";
import { CurrentBook } from "../../reducer/currentBookReducer";
import { getUserLibrary } from "../../utils/firestore";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";

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

  console.log(currentBook);

  const a = Location.pathname.split("/")[2];
  const bookId = a.slice(-13);
  const userId = a.split(bookId)[0];
  console.log(bookId);

  useEffect(() => {
    console.log(userId);
    getUserLibrary(userId).then((v) => {
      if (v) {
        dispatch({
          type: actionType.LIBRARY.SETLIBRARY,
          value: v.library,
        });
      }
    });
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
            <Category>df</Category>
          </SectionItem>

          <SectionItem>
            <LikeP>點讚</LikeP>
            <Like>DFKLS</Like>
          </SectionItem>
        </TopRightSection>
      </TopSection>

      <BottomSection>
        <SectionItem>
          <ProgressP>進度</ProgressP>
          <Progress>DSFKLJ</Progress>
        </SectionItem>
        <SectionItem>
          <PlaceP>地點</PlaceP>
          <Place>dfk</Place>
        </SectionItem>
        <SectionItem>
          <LendToP>出借給</LendToP>
          <LendTo>a</LendTo>
        </SectionItem>
        <SummaryP>書摘</SummaryP>
        <Summary>b</Summary>
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
const Progress = styled.div``;

const PlaceP = styled.div``;
const Place = styled.div``;

const LendToP = styled.div``;
const LendTo = styled.div``;

const SummaryP = styled.div``;
const Summary = styled.div``;

const BottomSection = styled.div``;
