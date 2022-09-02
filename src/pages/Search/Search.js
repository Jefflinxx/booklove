import search from "./search.svg";

import styled from "styled-components";

function Search() {
  return (
    <>
      <p>返回</p>
      <SearchIconDiv>
        <SearchIcon src={search} />
        <Input></Input>
      </SearchIconDiv>
      <p>{`n`}筆搜尋結果</p>

      <Center>
        <Bookcase>
          {[1, 2, 3, 4, 5].map((i) => {
            return (
              <BookDiv>
                <BookImg></BookImg>
                <BookRightSection>
                  <BookItem>
                    <BookNameP>書名</BookNameP>
                    <BookName>{i}</BookName>
                  </BookItem>
                  <BookItem>
                    <AuthorP>作者</AuthorP>
                    <Author></Author>
                  </BookItem>
                  <BookItem>
                    <PublishP>出版</PublishP>
                    <Publish></Publish>
                  </BookItem>
                  <button>加入此書</button>
                </BookRightSection>
              </BookDiv>
            );
          })}
        </Bookcase>
      </Center>
    </>
  );
}

export default Search;

const Center = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SearchIconDiv = styled.div`
  position: relative;
  width: 80%;
`;

const SearchIcon = styled.img`
  position: absolute;
  width: 18px;
  left: 9px;
  top: 9px;
`;

const Input = styled.input`
  width: 100%;
  height: 38px;
  text-indent: 32px;
  border-bottom: 1px solid black;
`;

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
  display: flex;
`;

const BookImg = styled.img`
  width: 100px;
  height: 100px;
`;

const BookRightSection = styled.div``;

const BookItem = styled.div`
  display: flex;
`;

const BookNameP = styled.p``;
const BookName = styled.p``;

const AuthorP = styled.p``;
const Author = styled.p``;

const PublishP = styled.p``;
const Publish = styled.p``;
