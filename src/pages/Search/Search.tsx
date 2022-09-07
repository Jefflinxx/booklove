import search from "./search.svg";

import { useSelector } from "react-redux";
import styled from "styled-components";
import { useEffect, useState } from "react";

import { User } from "../../reducer/userReducer";
import { CurrentBook } from "../../reducer/currentBookReducer";

import { addSearchBookToUserLibrary } from "../../utils/firestore";
import { stringify } from "querystring";

const googleApi = `https://www.googleapis.com/books/v1/volumes?q=`;
const esliteApi = `https://athena.eslite.com/api/v2/search?q=`;
function Search() {
  const [input, setInput] = useState("");
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

  console.log(books);
  return (
    <>
      <p>返回</p>
      <SearchIconDiv>
        <SearchIcon src={search} />
        <Input
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
      <p>{books.length}筆搜尋結果</p>

      <Center>
        <Bookcase>
          {books.map((i) => {
            let a = 0;
            library.forEach((j) => {
              console.log(j.isbn, i.isbn);
              if (j.isbn === i.isbn) {
                console.log("有一樣");
                a += 1;
              }
            });
            console.log(a);
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
                    加入此書
                  </AddBookBtn>
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

const AddBookBtn = styled.button<{ $a: number }>`
  display: ${(props) => {
    console.log(props.$a);
    return props.$a ? "none" : "block";
  }};
`;
