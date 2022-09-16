import search from "./search.svg";
import back from "./back.svg";

import { useSelector } from "react-redux";
import styled from "styled-components";
import { useEffect, useState, useRef } from "react";

import { User } from "../../reducer/userReducer";
import { CurrentBook } from "../../reducer/currentBookReducer";

import {
  addSearchBookToUserLibrary,
  addSearchBookToUserWishList,
} from "../../utils/firestore";
import { stringify } from "querystring";
import { useNavigate } from "react-router-dom";

const googleApi = `https://www.googleapis.com/books/v1/volumes?q=`;
const esliteApi = `https://athena.eslite.com/api/v2/search?q=`;
function Search() {
  const navigator = useNavigate();
  const [input, setInput] = useState("");
  const [resultCountActive, setResultCountActive] = useState(false);
  const [books, setBooks] = useState<
    {
      name: string;
      author: string;
      publisher: string;
      picture_url: string;
      isbn: string;
    }[]
  >([]);
  const user = useSelector((state: { userReducer: User }) => state.userReducer);
  const library = useSelector(
    (state: { currentLibraryReducer: CurrentBook[] }) =>
      state.currentLibraryReducer
  );
  const friendSearchRef = useRef<HTMLInputElement>(null);

  const fetchGoogleBooksData = async (input: string) => {
    const apiKey = "AIzaSyDz4bZxMmhDzE2XFztfzDqrBaCEuyiwFe4";
    const response = await fetch(
      `${googleApi}${input}&maxResults=40&key=${apiKey}`,
      { method: "GET" }
    );
    if (response.status === 200) {
      console.log("成功");
    } else if (response.status === 403) {
      alert("有點異常");
    }
    const a = await response.json();
    console.log(a);

    setBooks((prev) => []);
    a.items.forEach(
      (i: {
        volumeInfo: {
          title: string;
          authors: string;
          publisher: string;
          imageLinks: { thumbnail: string };
          industryIdentifiers: [];
        };
      }) => {
        setBooks((prev) => {
          let name;
          let author;
          let publisher;
          let picture_url;
          let isbn;
          if (i.volumeInfo.title) {
            name = i.volumeInfo.title;
          } else {
            name = undefined;
          }
          if (i.volumeInfo.authors) {
            author = i.volumeInfo.authors[0];
          } else {
            author = undefined;
          }
          if (i.volumeInfo.publisher) {
            publisher = i.volumeInfo.publisher;
          } else {
            publisher = undefined;
          }
          if (i.volumeInfo.imageLinks) {
            picture_url = i.volumeInfo.imageLinks.thumbnail;
          } else {
            picture_url = undefined;
          }
          if (i.volumeInfo.industryIdentifiers) {
            const a = i.volumeInfo.industryIdentifiers;
            const b: { identifier: string }[] = a.filter(
              (i: { type: string }) => i.type === "ISBN_13"
            );
            if (b.length < 1) {
              return prev;
            }
            isbn = b[0].identifier;
            console.log(isbn);
          } else {
            return prev;
          }

          return [
            ...prev,
            {
              name: name || "查無資料",
              author: author || "查無資料",
              publisher: publisher || "查無資料",
              picture_url: picture_url || "查無資料",
              isbn: isbn,
            },
          ];
        });
      }
    );
    setResultCountActive(true);
  };

  //誠品
  // const fetchEsliteBooksData = async (input) => {
  //   const response = await fetch(`${esliteApi}${input}&size=40`, {
  //     method: "GET",
  //   });
  //   if (response.status === 200) {
  //     console.log("成功");
  //   } else if (response.status === 403) {
  //     alert("有點異常");
  //   }
  //   const message = await response.json();

  //   //console.log(message.hits.hit);

  //   setBooks((prev) => []);
  //   message.hits.hit.forEach((i) => {
  //     setBooks((prev) => {
  //       return [
  //         ...prev,
  //         {
  //           name: i.fields.name,
  //           author: i.fields.author_for_autocomplete,
  //           publisher: i.fields.manufacturer_for_autocomplete,
  //           picture_url: `https://s.eslite.dev${i.fields.product_photo_url}`,
  //           isbn: i.fields.isbn,
  //         },
  //       ];
  //     });
  //   });
  // };

  useEffect(() => {
    friendSearchRef?.current?.focus();
  }, []);

  console.log(books);
  return (
    <>
      <WholeWrapper>
        <Center>
          <TopIconDivWrapper>
            <BackIconDiv
              onClick={() => {
                navigator(-1);
              }}
            >
              <BackIcon src={back}></BackIcon>
            </BackIconDiv>
          </TopIconDivWrapper>

          <SearchIconDiv>
            <SearchIcon src={search} />
            <Input
              ref={friendSearchRef}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  //fetchEsliteBooksData(input);
                  fetchGoogleBooksData(input);
                }
              }}
              onChange={(e) => {
                setInput(e.target.value);
              }}
            ></Input>
          </SearchIconDiv>
          {resultCountActive ? (
            <>
              <SearchCount>{books.length}筆搜尋結果</SearchCount>
              <SplitDiv>
                <Split />
              </SplitDiv>
            </>
          ) : (
            <>
              <SearchCount>搜尋書籍 加入書櫃</SearchCount>
              <SplitDiv>
                <Split />
              </SplitDiv>
            </>
          )}

          <Bookcase>
            {books.map((i) => {
              let a = 0;
              user.library?.forEach((j) => {
                console.log(j.isbn, i.isbn);
                if (j.isbn === i.isbn) {
                  console.log("有一樣");
                  a += 1;
                }
              });
              let b = 0;
              user.wishList?.forEach((j) => {
                console.log(j.isbn, i.isbn);
                if (j.isbn === i.isbn) {
                  console.log("有一樣");
                  b += 1;
                }
              });

              return (
                <BookDiv key={i.isbn}>
                  <BookImg src={i.picture_url}></BookImg>
                  <BookRightSection>
                    <BookItem>
                      <BookNameP>書名</BookNameP>
                      <BookName>{i.name}</BookName>
                    </BookItem>
                    <BookItem>
                      <AuthorP>作者</AuthorP>
                      <Author>{i.author}</Author>
                    </BookItem>
                    <BookItem>
                      <PublishP>出版</PublishP>
                      <Publish>{i.publisher}</Publish>
                    </BookItem>
                    <AddWrapper>
                      <AddBookBtn
                        $a={a}
                        onClick={() => {
                          addSearchBookToUserLibrary(
                            user.uid,
                            i.isbn,
                            i.name,
                            i.author,
                            i.publisher,
                            i.picture_url
                          );
                        }}
                      >
                        加入書櫃
                      </AddBookBtn>
                      <AddToWishList
                        $b={b}
                        onClick={() => {
                          addSearchBookToUserWishList(
                            user.uid,
                            i.isbn,
                            i.name,
                            i.author,
                            i.publisher,
                            i.picture_url
                          );
                        }}
                      >
                        加入願望清單
                      </AddToWishList>
                    </AddWrapper>
                  </BookRightSection>
                </BookDiv>
              );
            })}
          </Bookcase>
        </Center>
      </WholeWrapper>
    </>
  );
}

export default Search;

const WholeWrapper = styled.div`
  width: 100%;
  min-height: ${() => `calc(100vh - 82px)`};
  display: flex;
  align-items: center;
  flex-direction: column;

  background: #eff2f5;
`;

const TopIconDivWrapper = styled.div`
  width: 1172px;
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

const Center = styled.div`
  border: 1px solid #e4e6eb;
  background: white;
  border-radius: 6px;
  margin: 120px 0px;
`;

const SearchIconDiv = styled.div`
  position: relative;
  width: 1172px;

  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 100px;
`;

const SearchIcon = styled.img`
  position: absolute;
  width: 24px;
  left: 140px;
  top: 12px;
`;

const Input = styled.input`
  width: 902px;
  height: 48px;
  text-indent: 42px;
  border-bottom: 1px solid black;

  font-size: 24px;
`;

const SearchCount = styled.div`
  width: 1172px;

  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
`;

const SplitDiv = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Split = styled.div`
  width: 802px;
  height: 20px;
  border-bottom: 1px solid rgb(206, 208, 212);
`;

const Bookcase = styled.div`
  margin: 0px 0px 100px 0px;
  width: 1172px;
  display: flex;
  align-items: center;
  ${"" /* justify-content: center; */}
  flex-wrap: wrap;
`;

const BookDiv = styled.div`
  width: 585px;
  height: 400px;

  display: flex;
  justify-content: center;
  align-items: center;
`;

const BookImg = styled.img`
  width: 160px;
  height: 200px;
  box-shadow: 0 12px 28px 0 rgba(0, 0, 0, 0.2), 0 2px 4px 0 rgba(0, 0, 0, 0.1);
`;

const BookRightSection = styled.div`
  margin-left: 32px;
  width: 285px;
`;

const BookItem = styled.div`
  display: flex;
  margin-bottom: 16px;
`;

const BookNameP = styled.p`
  width: 70px;
  font-weight: 700;
`;
const BookName = styled.p``;

const AuthorP = styled.p`
  width: 70px;
  font-weight: 700;
`;
const Author = styled.p``;

const PublishP = styled.p`
  width: 70px;
  font-weight: 700;
`;
const Publish = styled.p``;

const AddWrapper = styled.div`
  display: flex;
`;

const AddBookBtn = styled.div<{ $a: number }>`
  width: 100px;
  height: 36px;

  justify-content: center;
  align-items: center;
  margin-right: 16px;
  border-radius: 6px;
  background: #eff2f5;
  cursor: pointer;
  :hover {
    background: rgba(200, 200, 200, 0.4);
  }

  display: ${(props) => {
    console.log(props.$a);
    return props.$a ? "none" : "flex";
  }};
`;

const AddToWishList = styled.div<{ $b: number }>`
  width: 120px;
  height: 36px;

  justify-content: center;
  align-items: center;
  border-radius: 6px;
  background: #eff2f5;
  cursor: pointer;
  :hover {
    background: rgba(200, 200, 200, 0.4);
  }

  display: ${(props) => {
    return props.$b ? "none" : "flex";
  }};
`;
