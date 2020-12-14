import * as React from "react";
import "./styles.css";
import seedrandom from "seedrandom";

import { LoremIpsum } from "lorem-ipsum";

import { analyzeColumns, domRectToRect, IColumn } from "./utils";

import { IRawText, toHTMLText } from "./text";

const images = [
  "https://images.unsplash.com/photo-1607591605038-08cf899600f5?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80",
  "https://images.unsplash.com/photo-1607591605038-08cf899600f5?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=350&q=80",
  "https://images.unsplash.com/photo-1607591605038-08cf899600f5?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80",
  "https://images.unsplash.com/photo-1607591605038-08cf899600f5?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=350&q=80",
  "https://images.unsplash.com/photo-1607591605038-08cf899600f5?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80",
  "https://images.unsplash.com/photo-1607591605038-08cf899600f5?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=350&q=80",
  "https://images.unsplash.com/photo-1607591605038-08cf899600f5?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80",
  "https://images.unsplash.com/photo-1607591605038-08cf899600f5?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=350&q=80",
];

const lorem = new LoremIpsum({
  random: seedrandom("world."),
  // seed: "hello"
});

interface IPageOptions {
  width: number;
  height: number;

  columnCount: number;
  columnGap: number;
}

const Article = React.memo<{ pageOptions: IPageOptions; text: IRawText }>(
  ({ pageOptions, text }) => {
    const containerWidth = pageOptions.width;
    const containerHeight = pageOptions.height;

    const columnCount = pageOptions.columnCount;

    const columnHeight = containerHeight;
    const columnGap = pageOptions.columnGap;

    const contentGhostRef = React.useRef<HTMLDivElement>(null);
    const debugRef = React.useRef<HTMLDivElement>(null);
    const contentRef = React.useRef<HTMLDivElement>(null);

    const [debugColumns, setColumns] = React.useState<IColumn[]>([]);

    const htmlText = React.useMemo(() => {
      return toHTMLText(text, { debug: true });
    }, [text]);

    React.useEffect(() => {
      if (!contentGhostRef?.current || !contentRef?.current) {
        return;
      }

      contentGhostRef.current.innerHTML = "";
      htmlText.paragraphs.forEach((pEl) => {
        contentGhostRef.current!.append(pEl.element);
      });

      const columns: IColumn[] = analyzeColumns({
        container: contentGhostRef.current,
      });

      console.log("columns", columns);

      if (columns) {
        setColumns(columns);
      }

      for (
        let index = 0;
        index < contentGhostRef.current.children.length;
        index++
      ) {
        const child = contentGhostRef.current.children.item(index);
        if (child) {
          contentRef.current.append(child.cloneNode(true));
        }
      }

      columns.forEach((c, index) => {
        if ((index + 1) % 3 !== 0) {
          return;
        }

        const endPId = c.end!.dataset.pid;
        const endPOffset = c.end!.dataset.poffset;

        const wordEl = contentRef.current!.querySelector(
          `[data-pid='${endPId}'][data-poffset='${endPOffset}']`
        );

        console.log(
          "searching",
          `[data-pid='${endPId}'][data-poffset='${endPOffset}']`,
          wordEl
        );

        const splitEl = document.createElement("div");
        splitEl.className = "splitter";
        wordEl?.after(splitEl);
      });
    }, [htmlText, contentGhostRef]);

    React.useEffect(() => {
      if (!debugRef.current || !contentGhostRef.current) {
        return;
      }

      const debugEl = debugRef.current;

      debugColumns.forEach((c) => {
        const cOuterEl = document.createElement("div");
        const cInnerEl = document.createElement("div");
        const cStartEl = document.createElement("div");
        const cEndEl = document.createElement("div");

        if (c.outerRect) {
          cOuterEl.style.border = "1px solid black";
          cOuterEl.style.width = c.outerRect.width + "px";
          cOuterEl.style.height = c.outerRect.height + "px";
          cOuterEl.style.left = c.outerRect.left + "px";
          cOuterEl.style.top = c.outerRect.top + "px";
          cOuterEl.style.position = "absolute";
        }

        const innerRect = c.innerRect;
        cInnerEl.style.border = "1px solid red";
        cInnerEl.style.width = innerRect.width + "px";
        cInnerEl.style.height = innerRect.height + "px";
        cInnerEl.style.left = innerRect.left + "px";
        cInnerEl.style.top = innerRect.top + "px";
        cInnerEl.style.position = "absolute";

        const startRect = domRectToRect(c.start!.getBoundingClientRect());
        cStartEl.style.background = "green";
        cStartEl.style.opacity = "0.5";
        cStartEl.style.width = startRect.width + "px";
        cStartEl.style.height = startRect.height + "px";
        cStartEl.style.left = startRect.left + "px";
        cStartEl.style.top = startRect.top + "px";
        cStartEl.style.position = "absolute";

        const endRect = domRectToRect(c.end!.getBoundingClientRect());
        cEndEl.style.background = "red";
        cEndEl.style.opacity = "0.5";
        cEndEl.style.width = endRect.width + "px";
        cEndEl.style.height = endRect.height + "px";
        cEndEl.style.left = endRect.left + "px";
        cEndEl.style.top = endRect.top + "px";
        cEndEl.style.position = "absolute";

        debugEl.append(cOuterEl);
        debugEl.append(cInnerEl);
        debugEl.append(cStartEl);
        debugEl.append(cEndEl);
      });
    }, [debugRef, debugColumns]);

    return (
      <>
        <div
          className="article-ghost"
          style={{ position: "fixed", visibility: "hidden" }}
        >
          <div
            ref={contentGhostRef}
            className="article-content"
            style={{
              width: containerWidth,
              height: columnHeight,
              columnCount: columnCount,
              columnGap: columnGap,
            }}
          ></div>
          <div
            ref={debugRef}
            className="article-content-debug"
            style={{ position: "absolute", top: 0, left: 0 }}
          ></div>
        </div>
        <div className="article">
          <div
            ref={contentRef}
            className="article-content"
            style={{ width: containerWidth, columnCount, columnGap }}
          ></div>
        </div>
      </>
    );
  }
);

export function AppWithText() {
  const text: IRawText = React.useMemo<IRawText>(() => {
    const rawText: IRawText = { paragraphs: [] };
    for (let index = 0; index < 50; index++) {
      rawText.paragraphs.push({
        id: `p${index}`,
        content: lorem.generateParagraphs(1),
      });
    }

    return rawText;
  }, []);

  return (
    <div className="App">
      <Article
        pageOptions={{ width: 600, height: 500, columnCount: 3, columnGap: 20 }}
        text={text}
      />
      {/* <Article text={text} /> */}
    </div>
  );
}
