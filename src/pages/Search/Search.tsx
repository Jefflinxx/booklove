import search from "./search.svg";
import back from "./back.svg";
import bg from "./search.jpeg";

import { actionType } from "../../reducer/rootReducer";
import { useSelector, useDispatch } from "react-redux";
import styled from "styled-components";
import { useEffect, useState, useRef } from "react";

import { User } from "../../reducer/userReducer";
import { CurrentBook } from "../../reducer/currentBookReducer";

import {
  addSearchBookToUserLibrary,
  addSearchBookToUserWishList,
  getUserInfo,
} from "../../utils/firestore";
import { stringify } from "querystring";
import { useNavigate } from "react-router-dom";

const googleApi = `https://www.googleapis.com/books/v1/volumes?q=`;
const esliteApi = `https://athena.eslite.com/api/v2/search?q=`;
function Search() {
  const dispatch = useDispatch();
  const navigator = useNavigate();
  const [input, setInput] = useState("");
  const [resultCountActive, setResultCountActive] = useState(false);
  const [popupActive, setPopupActive] = useState(false);
  const [barrierBGActive, setBarrierBGActive] = useState<boolean>(false);
  const [bookAlreadyInLibrary, setBookAlreadyInLibrary] = useState<string[]>(
    []
  );
  const [bookAlreadyInWishList, setBookAlreadyInWishList] = useState<string[]>(
    []
  );
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
    if (user) {
      getUserInfo(user.uid).then((v) => {
        dispatch({
          type: actionType.USER.SETUSER,
          value: v,
        });
      });
    }
  }, []);

  useEffect(() => {
    //確認這本書是否已加入書櫃，加入了就不再顯示可加入的按鈕
    let a: string[] = [];
    //確認這本書是否已加入願望清單，加入了就不再顯示可加入的按鈕
    let b: string[] = [];
    books?.forEach((i) => {
      user.library?.forEach((j) => {
        if (j.isbn === i.isbn) {
          a.push(i.isbn);
        }
      });
      user.wishList?.forEach((j) => {
        if (j.isbn === i.isbn) {
          b.push(i.isbn);
        }
      });
    });
    setBookAlreadyInLibrary(a);
    setBookAlreadyInWishList(b);
  }, [books]);

  console.log(bookAlreadyInLibrary);

  return (
    <>
      <BarrierBG barrierBGActive={barrierBGActive} />
      <Popup $active={popupActive}>
        已成功加入
        <PopupClose
          onClick={() => {
            setPopupActive(false);
            setBarrierBGActive(false);
          }}
        >
          ✗
        </PopupClose>
      </Popup>
      <WholeWrapper>
        <Center>
          <SearchIconDiv $active={resultCountActive}>
            <BackIconDiv
              $active={resultCountActive}
              onClick={() => {
                navigator(-1);
              }}
            >
              <BackIcon src={back} $active={resultCountActive}></BackIcon>
            </BackIconDiv>
            <SearchIcon src={search} $active={resultCountActive} />
            <Input
              $active={resultCountActive}
              ref={friendSearchRef}
              placeholder="Search books, add to bookshelf"
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
            <></>
          )}
          <BackgroundDiv $active={resultCountActive}></BackgroundDiv>

          <Bookcase>
            {books.map((i) => {
              return (
                <BookDiv key={i.isbn}>
                  <BookImg src={i.picture_url}></BookImg>
                  <BookRightSection>
                    <BookItem>
                      <BookNameP>書名</BookNameP>

                      {i.name.length > 36 && (
                        <BookName>{`${i.name.slice(0, 37)}...`}</BookName>
                      )}
                      {i.name.length <= 36 && <BookName>{i.name}</BookName>}
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
                      {!bookAlreadyInLibrary.find((j) => i.isbn === j) && (
                        <AddBookBtn
                          $a={bookAlreadyInLibrary.find((j) => i.isbn === j)}
                          onClick={() => {
                            addSearchBookToUserLibrary(
                              user.uid,
                              i.isbn,
                              i.name,
                              i.author,
                              i.publisher,
                              i.picture_url
                            );
                            setBookAlreadyInLibrary([
                              ...bookAlreadyInLibrary,
                              i.isbn,
                            ]);
                            setPopupActive(true);
                            setBarrierBGActive(true);
                          }}
                        >
                          加入書櫃
                        </AddBookBtn>
                      )}
                      {bookAlreadyInLibrary.find((j) => i.isbn === j) && (
                        <AddBookBtn
                          $a={bookAlreadyInLibrary.find((j) => i.isbn === j)}
                        >
                          已加入書櫃
                        </AddBookBtn>
                      )}
                      <SplitBtn />
                      {!bookAlreadyInWishList.find((j) => i.isbn === j) && (
                        <AddToWishList
                          $b={bookAlreadyInWishList.find((j) => i.isbn === j)}
                          onClick={() => {
                            addSearchBookToUserWishList(
                              user.uid,
                              i.isbn,
                              i.name,
                              i.author,
                              i.publisher,
                              i.picture_url
                            );
                            setBookAlreadyInWishList([
                              ...bookAlreadyInLibrary,
                              i.isbn,
                            ]);
                            setPopupActive(true);
                            setBarrierBGActive(true);
                          }}
                        >
                          加入願望清單
                        </AddToWishList>
                      )}
                      {bookAlreadyInWishList.find((j) => i.isbn === j) && (
                        <AddToWishList
                          $b={bookAlreadyInWishList.find((j) => i.isbn === j)}
                        >
                          已加入願望清單
                        </AddToWishList>
                      )}
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
  min-height: 100vh;
  display: flex;
  align-items: center;
  flex-direction: column;

  background: #f6d4ba;
`;

const TopIconDivWrapper = styled.div`
  width: 1080px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
  padding: 8px;
`;

const BackIconDiv = styled.div<{ $active: boolean }>`
  position: absolute;
  top: ${(props) => (props.$active ? "6px" : "6px")};
  left: ${(props) => (props.$active ? "240px" : "40px")};
  width: ${(props) => (props.$active ? "38px" : "48px")};
  height: ${(props) => (props.$active ? "38px" : "48px")};
  border-radius: 50%;
  cursor: pointer;

  :hover {
    background: #f3b391;
  }
`;
const BackIcon = styled.img<{ $active: boolean }>`
  position: absolute;
  top: ${(props) => (props.$active ? "8px" : "5px")};
  left: ${(props) => (props.$active ? "10px" : "10px")};
  width: ${(props) => (props.$active ? "14px" : "24px")};
`;

const Center = styled.div`
  border-radius: 6px;
  margin: 120px 0px;
`;

const SearchIconDiv = styled.div<{ $active: boolean }>`
  position: relative;
  top: ${(props) => (props.$active ? "0px" : "33vh")};
  right: ${(props) => (props.$active ? "0px" : "-370px")};
  width: ${(props) => (props.$active ? "1080px" : "700px")};
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: ${(props) => (props.$active ? "center" : "flex-end")};
  margin-bottom: 50px;
`;

const SearchIcon = styled.img<{ $active: boolean }>`
  position: absolute;
  width: ${(props) => (props.$active ? "24px" : "36px")};
  left: ${(props) => (props.$active ? "292px" : "100px")};
  top: ${(props) => (props.$active ? "16px" : "12px")};
`;

const Input = styled.input<{ $active: boolean }>`
  width: ${(props) => (props.$active ? "500px" : "600px")};
  height: ${(props) => (props.$active ? "56px" : "64px")};
  text-indent: ${(props) => (props.$active ? "48px" : "54px")};
  border-bottom: 3px solid #f3b391;

  font-size: ${(props) => (props.$active ? "24px" : "28px")};
  ::placeholder {
    font-family: "Inknut Antiqua", serif;
    color: #3f612d88;
  }
`;

const SearchCount = styled.div`
  width: 1080px;
  color: #3f612d;
  letter-spacing: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
`;

const SplitDiv = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Split = styled.div`
  width: 1080px;
  height: 20px;
  border-bottom: 3px solid #f3b391;
`;
const BackgroundDiv = styled.div<{ $active: boolean }>`
  position: absolute;
  opacity: ${(props) => (props.$active ? "0" : "1")};
  top: 0px;
  left: 0px;
  width: 50vw;
  height: ${() => `calc(100vh + 25.5px)`};

  background-image: linear-gradient(to right, #f6d4ba00 60%, #f6d4ba 100%),
    url(${bg});
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  transition: all 1s;
`;
const Bookcase = styled.div`
  margin: 0px 0px 100px 0px;
  width: 1080px;
  display: flex;
  align-items: center;
  ${"" /* justify-content: center; */}
  flex-wrap: wrap;
`;

const BookDiv = styled.div`
  width: 540px;
  height: 400px;

  display: flex;
  justify-content: center;
  align-items: center;
`;

const BookImg = styled.img`
  width: 200px;
  height: 280px;
  box-shadow: 0 12px 28px 0 rgba(0, 0, 0, 0.2), 0 2px 4px 0 rgba(0, 0, 0, 0.1);
`;

const BookRightSection = styled.div`
  margin-left: 32px;
  width: 285px;
`;

const BookItem = styled.div`
  font-size: 20px;
  color: #3f612d;
  display: flex;
  min-height: 56px;
`;

const BookNameP = styled.p`
  width: 70px;
  font-weight: 700;
`;
const BookName = styled.p`
  width: 200px;
`;

const AuthorP = styled.p`
  width: 70px;
  font-weight: 700;
`;
const Author = styled.p`
  width: 200px;
`;

const PublishP = styled.p`
  width: 70px;
  font-weight: 700;
`;
const Publish = styled.p``;

const AddWrapper = styled.div`
  position: relative;
  right: 20px;
  display: flex;
  align-items: center;
`;

const Popup = styled.div<{ $active: boolean }>`
  display: ${(props) => (props.$active ? "flex" : "none")};
  align-items: center;
  justify-content: center;
  font-size: 24px;
  position: fixed;
  top: 50vh;
  left: 50vw;
  width: 300px;
  height: 100px;
  transform: translate(-50%, -50%);
  z-index: 9;
  background: #fefadc;
  border: 1px solid #fefadc;
  border-radius: 6px;
  color: #3f612d;
  border: 8px solid #f3b391;
`;

const BarrierBG = styled.div<{ barrierBGActive: boolean }>`
  width: 100vw;
  height: 100vh;
  position: fixed;
  top: 0px;
  left: 0px;
  z-index: 8;

  display: ${(props) => (props.barrierBGActive ? "block" : "none")};
`;

const PopupClose = styled.div`
  position: absolute;
  top: -18px;
  left: -18px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #f3b391;
  border: 1px solid #fefadc;
`;

const AddBookBtn = styled.div<{ $a: string | undefined }>`
  width: 120px;
  height: 36px;
font-size:16px;
  justify-content: center;
  align-items: center;
 
  border-radius: 6px;
 

  display: flex;
  }};
  color:${(props) => (props.$a ? "gray" : "#3f612d")};
  background: ${(props) => (props.$a ? "" : "")};
  cursor: ${(props) => (props.$a ? "not-allowed" : "pointer")};
  :hover {
    background: ${(props) => (props.$a ? "" : "#fefadc")};
  }
`;

const SplitBtn = styled.div`
  border: 1px solid #3f612d;
  height: 24px;
`;

const AddToWishList = styled.div<{ $b: string | undefined }>`
  width: 140px;
  height: 36px;
  font-size: 16px;
  justify-content: center;
  align-items: center;
  border-radius: 6px;

  display: flex;
  color: ${(props) => (props.$b ? "#b4b7bc" : "#3f612d")};
  background: ${(props) => (props.$b ? "" : "")};
  cursor: ${(props) => (props.$b ? "not-allowed" : "pointer")};
  :hover {
    background: ${(props) => (props.$b ? "" : "#fefadc")};
  }
`;
