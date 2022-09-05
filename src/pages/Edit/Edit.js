import styled from "styled-components";
import { useSelector, useDispatch } from "react-redux";
import { updateUserLibrary } from "../../utils/firestore";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";

function Edit() {
  const user = useSelector((state) => state.userReducer);
  const currentbook = useSelector((state) => state.currentBookReducer);
  const library = useSelector((state) => state.currentLibraryReducer);
  const navigator = useNavigate();
  const { register, handleSubmit } = useForm();
  return (
    <>
      <Center>
        <DeleteIconDivWrapper>
          <BackDiv
            onClick={() => {
              navigator(-1);
            }}
          >
            <Back></Back>Back
          </BackDiv>
          <DeleteIconDiv
            onClick={() => {
              const a = library.filter((i) => i.isbn !== currentbook.isbn);
              console.log(a);
              updateUserLibrary(user.uid, a);
              navigator("../../");
            }}
          >
            <DeleteIcon></DeleteIcon>delete
          </DeleteIconDiv>
        </DeleteIconDivWrapper>
      </Center>
      <form
        onSubmit={handleSubmit((data) => {
          console.log(data);
        })}
      >
        <TopSection>
          <BookImg />
          <TopRightSection>
            {["書名", "作者", "出版"].map((i) => {
              return (
                <SectionItem>
                  <BooknameP>{i}</BooknameP>
                  <Bookname {...register("bookname")}></Bookname>
                </SectionItem>
              );
            })}
            <SectionItem>
              <CategoryP>分類</CategoryP>
              <Category {...register("category")}></Category>
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
            <Progress {...register("totalChapter")}></Progress>
          </SectionItem>
          <SectionItem>
            <PlaceP>地點</PlaceP>
            <Place {...register("place")}></Place>
          </SectionItem>
          <SectionItem>
            <LendToP>出借給</LendToP>
            <LendTo {...register("lendTo")}></LendTo>
          </SectionItem>
          <SummaryP>書摘</SummaryP>
          <Summary {...register("summary")}></Summary>
        </BottomSection>

        <ModifyButton type="submit">修改</ModifyButton>
      </form>
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
  justify-content: space-between;
`;

const BackDiv = styled.div`
  width: 40px;
  height: 40px;
  border: 1px solid black;
`;
const Back = styled.div``;

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

const ModifyButton = styled.button``;
const BackButton = styled.button``;
