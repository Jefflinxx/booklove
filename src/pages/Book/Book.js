import styled from "styled-components";

import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

function Book() {
  const book = useSelector((state) => state.currentBookReducer);
  const user = useSelector((state) => state.userReducer);
  const navigator = useNavigate();
  console.log(book);
  return (
    <>
      <Center>
        <EditIconDivWrapper>
          <EditIconDiv
            onClick={() => {
              navigator(`../edit/${user.uid}${book.isbn}`);
            }}
          >
            <EditIcon></EditIcon>edit
          </EditIconDiv>
        </EditIconDivWrapper>
      </Center>

      <TopSection>
        <BookImg src={book.cover} />
        <TopRightSection>
          {[
            { key: "書名", v: book.bookname },
            { key: "作者", v: book.author },
            { key: "出版", v: book.publisher },
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

const EditIconDivWrapper = styled.div`
  width: 80%;
  display: flex;
  align-items: center;
  justify-content: flex-end;
`;

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
