import * as React from "react";
import "./styles.css";
import seedrandom from "seedrandom";

import { LoremIpsum } from "lorem-ipsum";

import {
  analyzeColumns,
  columnsToVirtualDocument,
  domRectToRect,
  IColumn,
  renderMediaIntoDOM,
} from "./utils";

import { addMediaToPage, IRawText, IVirtualDocument, toHTMLText } from "./text";
import { IPoint, IRect } from "./geometry";

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

interface IPageConfig {
  width: number;
  height: number;

  columnCount: number;
  columnGap: number;
}

const Article = React.memo<{
  pageConfig: IPageConfig;
  text: IRawText;
  inputMedia: IRect;
}>(({ pageConfig, text, inputMedia }) => {
  const pageWidth = pageConfig.width;
  const pageHeight = pageConfig.height;

  const columnCount = pageConfig.columnCount;
  const columnGap = pageConfig.columnGap;

  const contentGhostRef = React.useRef<HTMLDivElement>(null);
  const debugRef = React.useRef<HTMLDivElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);

  const [debugColumns, setColumns] = React.useState<IColumn[]>([]);
  const [
    debugVirtualDoc,
    setVirtualDoc,
  ] = React.useState<IVirtualDocument | null>(null);

  const htmlText = React.useMemo(() => {
    return toHTMLText(text, { debug: true });
  }, [text]);

  React.useEffect(() => {
    if (!contentGhostRef?.current || !contentRef?.current) {
      return;
    }

    contentGhostRef.current.innerHTML = "";
    htmlText.paragraphs.forEach((pEl) => {
      contentGhostRef.current!.append(pEl.element.cloneNode(true));
    });

    let columns: IColumn[] = analyzeColumns({
      container: contentGhostRef.current,
    });

    const virtualDoc = columns
      ? columnsToVirtualDocument(columns, {
          container: contentGhostRef.current,
          columnCount,
        })
      : null;

    if (virtualDoc) {
      // media for page #1
      const page1MediaRect = inputMedia;

      const page1 = virtualDoc.pages[0]!;
      addMediaToPage(page1, page1MediaRect);

      // render media into DOM
      renderMediaIntoDOM(virtualDoc, { container: contentGhostRef.current });

      columns = analyzeColumns({
        container: contentGhostRef.current,
      });
    }

    console.log("columns", columns);
    console.log("virtual doc", virtualDoc);

    if (columns) {
      setColumns(columns);
    }

    if (virtualDoc) {
      setVirtualDoc(virtualDoc);
    }

    contentRef.current.innerHTML = "";
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

      if (!c.end) {
        console.log("c.end is null!");
        return;
      }

      const endPId = c.end!.dataset.pid;
      const endPOffset = c.end!.dataset.poffset;

      const wordEl = contentRef.current!.querySelector(
        `[data-pid='${endPId}'][data-poffset='${endPOffset}']`
      );

      // console.log(
      //   "searching",
      //   `[data-pid='${endPId}'][data-poffset='${endPOffset}']`,
      //   wordEl
      // );

      const splitEl = document.createElement("div");
      splitEl.className = "splitter";
      wordEl?.after(splitEl);
    });
  }, [htmlText, contentGhostRef, columnCount, inputMedia]);

  React.useEffect(() => {
    if (!debugRef.current || !contentGhostRef.current) {
      return;
    }

    const debugEl = debugRef.current;

    debugEl.innerHTML = "";

    if (true) {
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

        if (c.start) {
          const startRect = domRectToRect(c.start!.getBoundingClientRect());
          cStartEl.style.background = "green";
          cStartEl.style.opacity = "0.5";
          cStartEl.style.width = startRect.width + "px";
          cStartEl.style.height = startRect.height + "px";
          cStartEl.style.left = startRect.left + "px";
          cStartEl.style.top = startRect.top + "px";
          cStartEl.style.position = "absolute";
        }

        if (c.end) {
          const endRect = domRectToRect(c.end!.getBoundingClientRect());
          cEndEl.style.background = "red";
          cEndEl.style.opacity = "0.5";
          cEndEl.style.width = endRect.width + "px";
          cEndEl.style.height = endRect.height + "px";
          cEndEl.style.left = endRect.left + "px";
          cEndEl.style.top = endRect.top + "px";
          cEndEl.style.position = "absolute";
        }

        debugEl.append(cOuterEl);
        debugEl.append(cInnerEl);
        debugEl.append(cStartEl);
        debugEl.append(cEndEl);
      });
    }

    if (debugVirtualDoc) {
      debugVirtualDoc.pages.forEach((vp) => {
        const vpEl = document.createElement("div");

        vpEl.style.outline = "2px solid blue";
        vpEl.style.width = vp.rect.width + "px";
        vpEl.style.height = vp.rect.height + "px";
        vpEl.style.left = vp.rect.left + "px";
        vpEl.style.top = vp.rect.top + "px";
        vpEl.style.position = "absolute";

        vp.columns.forEach((vpc) => {
          const vpcEl = document.createElement("div");

          vpcEl.style.outline = "2px solid red";
          vpcEl.style.width = vpc.rect.width + "px";
          vpcEl.style.height = vpc.rect.height + "px";
          vpcEl.style.left = vpc.rect.left + "px";
          vpcEl.style.top = vpc.rect.top + "px";
          vpcEl.style.position = "absolute";

          vpc.media.forEach((m) => {
            const mEl = document.createElement("div");

            mEl.style.outline = "2px solid green";
            mEl.style.width = m.rect.width + "px";
            mEl.style.height = m.rect.height + "px";
            mEl.style.left = m.rect.left + "px";
            mEl.style.top = m.rect.top + "px";
            mEl.style.position = "absolute";

            vpcEl.append(mEl);
          });

          vpEl.append(vpcEl);
        });

        debugEl.append(vpEl);
      });
    }
  }, [debugRef, debugColumns, debugVirtualDoc]);

  return (
    <>
      <div
        className="article-ghost"
        // style={{ position: "fixed", visibility: "hidden" }}
      >
        <div
          ref={contentGhostRef}
          className="article-content"
          style={{
            width: pageWidth,
            height: pageHeight,
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
          style={{ width: pageWidth, columnCount, columnGap }}
        ></div>
      </div>
    </>
  );
});

const MovableRect = React.memo<{
  rect: IRect;
  onMove(dx: number, dy: number): void;
}>((props) => {
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!ref.current) {
      return;
    }

    const el = ref.current;

    let dragging = false;
    let lastPoint: IPoint | null = null;

    function onMouseDown(e: MouseEvent) {
      dragging = true;
      lastPoint = { x: e.clientX, y: e.clientY };

      console.log("dragStart", lastPoint);

      e.preventDefault();
      e.stopPropagation();
    }

    function onMouseMove(e: MouseEvent) {
      if (!dragging) {
        return;
      }

      console.log("dragging", lastPoint);
      if (lastPoint) {
        props.onMove(lastPoint!.x - e.clientX, lastPoint!.y - e.clientY);
        lastPoint = { x: e.clientX, y: e.clientY };
      }

      e.preventDefault();
      e.stopPropagation();
    }

    function onMouseUp(e: MouseEvent) {
      console.log("dragend", lastPoint);
      dragging = false;

      e.preventDefault();
      e.stopPropagation();
    }

    el.addEventListener("mousedown", onMouseDown);
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);

    return () => {
      el.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };
  }, [ref]);

  return (
    <div
      ref={ref}
      className="movable-rect"
      style={{
        position: "absolute",
        ...props.rect,
      }}
    ></div>
  );
});

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

  const [mediaRect, setMediaRect] = React.useState<IRect>({
    top: 0,
    left: 0,
    width: 200,
    height: 200,
  });

  console.log("new media rect", mediaRect);

  return (
    <div className="App">
      <Article
        pageConfig={{ width: 600, height: 500, columnCount: 3, columnGap: 20 }}
        text={text}
        inputMedia={mediaRect}
      />
      <MovableRect
        rect={mediaRect}
        onMove={(dx, dy) =>
          setMediaRect((rect) => {
            return {
              ...rect,
              left: rect.left - dx,
              top: rect.top - dy,
            };
          })
        }
      />
      {/* <Article text={text} /> */}
    </div>
  );
}
