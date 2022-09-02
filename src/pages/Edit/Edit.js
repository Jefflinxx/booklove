import styled from "styled-components";

function Edit() {
  return (
    <>
      <>
        <Center>
          <DeleteIconDivWrapper>
            <DeleteIconDiv onClick={() => {}}>
              <DeleteIcon></DeleteIcon>delete
            </DeleteIconDiv>
          </DeleteIconDivWrapper>
        </Center>

        <TopSection>
          <BookImg />
          <TopRightSection>
            {["書名", "作者", "出版"].map((i) => {
              return (
                <SectionItem>
                  <BooknameP>{i}</BooknameP>
                  <Bookname></Bookname>
                </SectionItem>
              );
            })}
            <SectionItem>
              <CategoryP>分類</CategoryP>
              <Category></Category>
            </SectionItem>

            <SectionItem>
              <LikeP>點讚</LikeP>
              <Like></Like>
            </SectionItem>
          </TopRightSection>
        </TopSection>

        <BottomSection>
          <SectionItem>
            <ProgressP>總章節</ProgressP>
            <Progress></Progress>
          </SectionItem>
          <SectionItem>
            <PlaceP>地點</PlaceP>
            <Place></Place>
          </SectionItem>
          <SectionItem>
            <LendToP>出借給</LendToP>
            <LendTo></LendTo>
          </SectionItem>
          <SummaryP>書摘</SummaryP>
          <Summary></Summary>
        </BottomSection>
      </>
    </>
  );
}

export default Edit;

const Center = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const DeleteIconDivWrapper = styled.div`
  width: 80%;
  display: flex;
  align-items: center;
  justify-content: flex-end;
`;

const DeleteIconDiv = styled.div`
  width: 40px;
  height: 40px;
  border: 1px solid black;
`;

const DeleteIcon = styled.div``;

const TopSection = styled.div`
  display: flex;
`;

const BookImg = styled.div`
  width: 100px;
  height: 120px;
  border: 1px solid black;
`;

const TopRightSection = styled.div``;

const SectionItem = styled.div`
  display: flex;
`;

const BooknameP = styled.div``;
const Bookname = styled.input`
  width: 160px;
  height: 40px;
`;

const CategoryP = styled.div``;
const Category = styled.input`
  width: 160px;
  height: 40px;
`;

const LikeP = styled.div``;
const Like = styled.input`
  width: 160px;
  height: 40px;
`;

const ProgressP = styled.div``;
const Progress = styled.input`
  width: 160px;
  height: 40px;
`;

const PlaceP = styled.div``;
const Place = styled.input`
  width: 160px;
  height: 40px;
`;

const LendToP = styled.div``;
const LendTo = styled.input`
  width: 160px;
  height: 40px;
`;

const SummaryP = styled.div``;
const Summary = styled.input`
  width: 160px;
  height: 40px;
`;

const BottomSection = styled.div``;
