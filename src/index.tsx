import store from "./store/store";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import App from "./App";
import Home from "./pages/Home/Home";
import Book from "./pages/Book/Book";
import Edit from "./pages/Edit/Edit";
import Message from "./pages/Message/Message";
import Search from "./pages/Search/Search";
import Login from "./pages/Login/Login";
import { Provider } from "react-redux";

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(
  <Provider store={store}>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route path="login" element={<Login />} />
          <Route index element={<Home />} />
          <Route path="/:id" element={<Home />} />
          <Route path="book/:id" element={<Book />} />
          <Route path="edit/:id" element={<Edit />} />
          <Route path="message" element={<Message />} />
          <Route path="search" element={<Search />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </Provider>
);
