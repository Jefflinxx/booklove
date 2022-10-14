import search from "./search.svg";
import back from "./back.svg";
import bg from "./search.jpeg";
import bc from "./bookcover.jpg";

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
import { useNavigate } from "react-router-dom";
import ReactLoading from "react-loading";

const googleApi = `${process.env.REACT_APP_GOOGLE_API}`;
function Search() {
  const dispatch = useDispatch();
  const navigator = useNavigate();
  const [input, setInput] = useState("");
  const [resultCountActive, setResultCountActive] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
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
  const friendSearchRef = useRef<HTMLInputElement>(null);
  const fetchGoogleBooksData = async (input: string) => {
    setLoading(true);
    const apiKey = `${process.env.REACT_APP_GOOGLE_API_KEY}`;
    const response = await fetch(
      `${googleApi}${input}&maxResults=40&key=${apiKey}`,
      { method: "GET" }
    );
    if (response.status === 403) {
      alert("有點異常");
    }
    const searchResult = await response.json();

    setBooks((prev) => []);
    searchResult.items.forEach(
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
            const isbnIdentifiers = i.volumeInfo.industryIdentifiers;
            const hasIsbn: { identifier: string }[] = isbnIdentifiers.filter(
              (i: { type: string }) => i.type === "ISBN_13"
            );
            if (hasIsbn.length < 1) {
              return prev;
            }
            isbn = hasIsbn[0].identifier;
          } else {
            return prev;
          }

          return [
            ...prev,
            {
              name: name || "查無資料",
              author: author || "查無資料",
              publisher: publisher || "查無資料",
              picture_url: picture_url || bc,
              isbn: isbn,
            },
          ];
        });
      }
    );
    setResultCountActive(true);
    setLoading(false);
  };

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
    let bookInLibrary: string[] = [];
    let bookInWishList: string[] = [];
    books?.forEach((i) => {
      user.library?.forEach((j) => {
        if (j.isbn === i.isbn) {
          bookInLibrary.push(i.isbn);
        }
      });
      user.wishList?.forEach((j) => {
        if (j.isbn === i.isbn) {
          bookInWishList.push(i.isbn);
        }
      });
    });
    setBookAlreadyInLibrary(bookInLibrary);
    setBookAlreadyInWishList(bookInWishList);
  }, [books]);

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
        <PopupBtnW>
          <PopupBtn
            onClick={() => {
              navigator("../");
              getUserInfo(user.uid).then((v) => {
                dispatch({
                  type: actionType.USER.SETUSER,
                  value: v,
                });
              });
            }}
          >
            回到主頁
          </PopupBtn>
          <PopupBtn
            onClick={() => {
              setPopupActive(false);
              setBarrierBGActive(false);
            }}
          >
            繼續加書
          </PopupBtn>
        </PopupBtnW>
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
                  if (input.trim()) {
                    fetchGoogleBooksData(input);
                  } else {
                    alert("不能空白");
                  }
                }
              }}
              onChange={(e) => {
                setInput(e.target.value);
              }}
            ></Input>
            {loading && (
              <SearchLoading $active={resultCountActive}>
                <ReactLoading type="cylon" color="black" width={40} />
              </SearchLoading>
            )}
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
                          $bookAlreadyInLibrary={bookAlreadyInLibrary.find(
                            (j) => i.isbn === j
                          )}
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
                          $bookAlreadyInLibrary={bookAlreadyInLibrary.find(
                            (j) => i.isbn === j
                          )}
                        >
                          已加入書櫃
                        </AddBookBtn>
                      )}
                      <SplitBtn />
                      {!bookAlreadyInWishList.find((j) => i.isbn === j) && (
                        <AddToWishList
                          $bookAlreadyInWishList={bookAlreadyInWishList.find(
                            (j) => i.isbn === j
                          )}
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
                              ...bookAlreadyInWishList,
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
                          $bookAlreadyInWishList={bookAlreadyInWishList.find(
                            (j) => i.isbn === j
                          )}
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
  @media screen and (max-width: 1100px) {
    top: 6px;
    left: 6px;
  }
  @media screen and (max-width: 800px) {
    left: ${(props) => (props.$active ? "-6px" : "6px")};
  }
  @media screen and (max-width: 620px) {
    left: ${(props) => (props.$active ? "6px" : "32px")};
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

  @media screen and (max-width: 1100px) {
    width: ${(props) => (props.$active ? "600px" : "700px")};
    right: ${(props) => (props.$active ? "0px" : "0px")};
  }
  @media screen and (max-width: 940px) {
  }
  @media screen and (max-width: 800px) {
    width: 600px;
  }
  @media screen and (max-width: 620px) {
    width: 338px;
    top: ${(props) => (props.$active ? "0px" : "33vh")};
    right: ${(props) => (props.$active ? "0px" : "20px")};
  }
`;

const SearchIcon = styled.img<{ $active: boolean }>`
  position: absolute;
  width: ${(props) => (props.$active ? "24px" : "36px")};
  left: ${(props) => (props.$active ? "292px" : "100px")};
  top: ${(props) => (props.$active ? "16px" : "12px")};
  @media screen and (max-width: 1100px) {
    top: 14px;
    left: 50px;
  }
  @media screen and (max-width: 800px) {
    left: ${(props) => (props.$active ? "36px" : "62px")};
  }
  @media screen and (max-width: 620px) {
    left: ${(props) => (props.$active ? "50px" : "92px")};
  }
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
  @media screen and (max-width: 800px) {
    width: 540px;
  }
  @media screen and (max-width: 620px) {
    width: 260px;
    ::placeholder {
      opacity: 0;
    }
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
  @media screen and (max-width: 1100px) {
    width: 600px;
  }
  @media screen and (max-width: 620px) {
    width: 352px;
  }
`;

const SplitDiv = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  @media screen and (max-width: 620px) {
    margin-bottom: 32px;
  }
`;

const Split = styled.div`
  width: 1080px;
  height: 20px;
  border-bottom: 3px solid #f3b391;
  @media screen and (max-width: 1100px) {
    width: 600px;
  }
  @media screen and (max-width: 620px) {
    width: 352px;
  }
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
  @media screen and (max-width: 800px) {
    display: none;
  }
`;
const Bookcase = styled.div`
  margin: 0px 0px 100px 0px;
  width: 1080px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  @media screen and (max-width: 1100px) {
    width: 600px;
  }
  @media screen and (max-width: 620px) {
    width: 352px;
  }
`;

const BookDiv = styled.div`
  width: 540px;
  height: 400px;

  display: flex;
  justify-content: center;
  align-items: center;
  @media screen and (max-width: 620px) {
    flex-wrap: wrap;
    height: auto;
  }
`;

const BookImg = styled.img`
  width: 200px;
  height: 280px;
  box-shadow: 0 12px 28px 0 rgba(0, 0, 0, 0.2), 0 2px 4px 0 rgba(0, 0, 0, 0.1);
`;

const BookRightSection = styled.div`
  margin-left: 32px;
  width: 285px;
  @media screen and (max-width: 620px) {
    height: auto;
    margin: 16px 0px 32px 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
  }
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
const Publish = styled.p`
  @media screen and (max-width: 620px) {
    width: 200px;
  }
`;

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
  flex-direction: column;
  font-size: 24px;
  position: fixed;
  top: 50vh;
  left: 50vw;
  width: 300px;
  height: 140px;
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
  :hover {
    background: #dc9d7b;
  }
  cursor: pointer;
`;

const PopupBtnW = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 16px;
`;
const PopupBtn = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100px;
  height: 30px;
  background: #f6d4ba;
  border-radius: 6px;
  font-size: 20px;
  margin: 0px 8px;
  :hover {
    background: #e9c5a9;
  }
  cursor: pointer;
`;

const AddBookBtn = styled.div<{ $bookAlreadyInLibrary: string | undefined }>`
  width: 120px;
  height: 36px;
  font-size: 16px;
  justify-content: center;
  align-items: center;
  border-radius: 6px;
  display: flex;
  color: ${(props) => (props.$bookAlreadyInLibrary ? "gray" : "#1f2e16 ")};
  background: ${(props) => (props.$bookAlreadyInLibrary ? "" : "")};
  cursor: ${(props) =>
    props.$bookAlreadyInLibrary ? "not-allowed" : "pointer"};
  :hover {
    background: ${(props) => (props.$bookAlreadyInLibrary ? "" : "#fefadc")};
  }
`;

const SplitBtn = styled.div`
  border-left: 2px solid #1f2e16;
  height: 24px;
`;

const AddToWishList = styled.div<{
  $bookAlreadyInWishList: string | undefined;
}>`
  width: 140px;
  height: 36px;
  font-size: 16px;
  justify-content: center;
  align-items: center;
  border-radius: 6px;

  display: flex;
  color: ${(props) => (props.$bookAlreadyInWishList ? "gray" : "#1f2e16 ")};
  background: ${(props) => (props.$bookAlreadyInWishList ? "" : "")};
  cursor: ${(props) =>
    props.$bookAlreadyInWishList ? "not-allowed" : "pointer"};
  :hover {
    background: ${(props) => (props.$bookAlreadyInWishList ? "" : "#fefadc")};
  }
`;

const SearchLoading = styled.div<{ $active: boolean }>`
  position: absolute;
  bottom: 0px;
  right: ${(props) => (props.$active ? "290px" : "0px")};
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;

  @media screen and (max-width: 1100px) {
    right: ${(props) => (props.$active ? "50px" : "0px")};
  }
  @media screen and (max-width: 620px) {
    right: ${(props) => (props.$active ? "40px" : "0px")};
  }
`;
