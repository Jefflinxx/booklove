import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
//import React from "react";
import { useEffect, useState } from "react";
import styled from "styled-components";

import {
  BiBold,
  BiItalic,
  BiStrikethrough,
  BiListUl,
  BiListOl,
  BiUndo,
  BiRedo,
} from "react-icons/bi";
import { MdHorizontalRule, MdFormatQuote } from "react-icons/md";
const MenuBar = ({ editor }) => {
  if (!editor) {
    return null;
  }

  return (
    <BtnWrapper>
      <Button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={editor.isActive("bold") ? "is-active" : ""}
      >
        <BiBoldW>
          <BiBold />
        </BiBoldW>
      </Button>
      <Button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={editor.isActive("italic") ? "is-active" : ""}
      >
        <BiItalic />
      </Button>
      <Button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={editor.isActive("strike") ? "is-active" : ""}
      >
        <BiStrikethrough />
      </Button>

      <Button
        onClick={() => editor.chain().focus().setParagraph().run()}
        className={editor.isActive("paragraph") ? "is-active" : ""}
      >
        P
      </Button>
      <Button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={editor.isActive("heading", { level: 1 }) ? "is-active" : ""}
      >
        h1
      </Button>
      <Button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={editor.isActive("heading", { level: 2 }) ? "is-active" : ""}
      >
        h2
      </Button>
      <Button
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={editor.isActive("heading", { level: 3 }) ? "is-active" : ""}
      >
        h3
      </Button>

      <Button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={editor.isActive("bulletList") ? "is-active" : ""}
      >
        <BiListUl />
      </Button>
      <Button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={editor.isActive("orderedList") ? "is-active" : ""}
      >
        <BiListOl />
      </Button>

      <Button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={editor.isActive("blockquote") ? "is-active" : ""}
      >
        <MdFormatQuote />
      </Button>
      <Button onClick={() => editor.chain().focus().setHorizontalRule().run()}>
        <MdHorizontalRule />
      </Button>

      <Button onClick={() => editor.chain().focus().undo().run()}>
        <BiUndo />
      </Button>
      <Button onClick={() => editor.chain().focus().redo().run()}>
        <BiRedo />
      </Button>
    </BtnWrapper>
  );
};

type TiptapProps = {
  data: string;
  setData: (value: string) => void;
};

const Tiptap: React.FC<TiptapProps> = ({ data, setData }) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: data,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setData(html);
    },
  });
  // useEffect(()=>{
  //   editor.commands.setContent('<p>Example Text</p>')
  // },[editor])

  return (
    <Wrapper>
      <MenuBar editor={editor} />
      <ContentWrapper>
        <EditorContent editor={editor} />
      </ContentWrapper>
    </Wrapper>
  );
};

export default Tiptap;

const Wrapper = styled.div`
  margin: 16px 0px 24px 48px;
`;

const ContentWrapper = styled.div`
  width: 780px;
  min-height: 200px;

  display: flex;
  justify-content: center;
  .ProseMirror {
    color: #3f612d;
    border-radius: 0px 0px 6px 6px;
    width: 780px;
    border: 1px solid #3f612d;
    min-height: 200px;
    background: #fefadc;
    user-select: auto;

    padding: 8px;
    outline: none;
  }
  .ProseMirror h1,
  .ProseMirror h2,
  .ProseMirror h3,
  .ProseMirror h4,
  .ProseMirror h5,
  .ProseMirror h6 {
    line-height: 1.1;
    user-select: auto;
  }
  .ProseMirror blockquote {
    padding-left: 1rem;
    border-left: 2px solid rgba(13, 13, 13, 0.1);
  }

  .ProseMirror hr {
    border: none;
    border-top: 2px solid rgba(13, 13, 13, 0.1);
    margin: 2rem 0;
    user-select: auto;
  }
  .ProseMirror pre {
    background: #0d0d0d;
    color: #fff;
    font-family: "JetBrainsMono", monospace;
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;
    user-select: auto;
  }
  p,
  strong,
  s,
  em {
    user-select: auto;
  }
`;

const BtnWrapper = styled.div`
  display: flex;
  width: 780px;
  border-radius: 6px 6px 0px 0px;
  border: 1px solid #3f612d;
  background: #f3b391;
  .is-active {
    background: #f6d4ba;
    border-radius: 6px 6px 0px 0px;
  }
`;
const Button = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 60px;
`;
const BiBoldW = styled.div`
  line-height: 0px;
  font-size: 20px;
  color: black;
`;
