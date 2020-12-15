import { intersectRelative, intersects, IRect } from "./geometry";
import { IVirtualDocument, IVirtualPage } from "./text";

export const splitPreserve = (value: string, seperator: string) => {
  var temp = "",
    outputArray = [],
    text = value.split("");

  for (let i = 0; i < text.length; i++) {
    // console.log(typeof text[i+1])
    if (
      text[i] === seperator &&
      (text[i + 1] !== seperator || typeof text[i + 1] === "undefined")
    ) {
      outputArray.push((temp += text[i]));
      temp = "";
    } else {
      temp += text[i];
    }
  }
  return outputArray;
};

export function findStartOfColumn(
  rect: IRect,
  children: HTMLCollection
): HTMLElement | null {
  for (let childIndex = 0; childIndex < children.length; childIndex++) {
    const child = children.item(childIndex) as HTMLElement;
    if (child) {
      const childRect = child.getBoundingClientRect();

      if (intersects(childRect, rect)) {
        return child;
      }
    }
  }

  return null;
}

export function findEndOfColumn(
  rect: IRect,
  children: HTMLCollection
): HTMLElement | null {
  for (let childIndex = children.length - 1; childIndex >= 0; childIndex--) {
    const child = children.item(childIndex) as HTMLElement;
    if (child) {
      const childRect = child.getBoundingClientRect();

      if (intersects(childRect, rect)) {
        return child;
      }
    }
  }

  return null;
}

export function domRectToRect(domRect: DOMRect): IRect {
  return {
    top: domRect.top,
    left: domRect.left,
    width: domRect.width,
    height: domRect.height,
  };
}

export interface IColumn {
  outerRect?: IRect | null;
  innerRect: IRect;

  start?: HTMLElement | null;
  end?: HTMLElement | null;
}

interface IColumnContext {
  pageRect: IRect;
  columnWidth: number;
  columnGap: number;
}

export function buildColumnContext(container: HTMLElement) {
  const contentRect = container.getBoundingClientRect();
  const pageRect = domRectToRect(contentRect);

  const firstChildRect = (container.firstChild! as HTMLElement).getBoundingClientRect();
  const columnWidth = firstChildRect.width;

  let columnGap = 0;

  for (
    let childIndex = 1;
    childIndex < container.children.length;
    childIndex++
  ) {
    const child = container.children.item(childIndex)!.getBoundingClientRect();

    if (child.left !== firstChildRect.left) {
      columnGap = child.left - firstChildRect.right;
      break;
    }
  }

  return { pageRect, columnWidth, columnGap };
}

export function generateNextColumn(
  prevColumn: IColumn | null,
  options: IColumnContext
): IColumn {
  let innerRect: IRect | null = null;
  if (!prevColumn) {
    innerRect = {
      top: options.pageRect.top,
      left: options.pageRect.left,
      width: options.columnWidth,
      height: options.pageRect.height,
    };
  } else {
    innerRect = {
      ...prevColumn.innerRect,
      left: prevColumn.innerRect.left + options.columnWidth + options.columnGap,
    };
  }

  return { innerRect: innerRect, outerRect: null };
}

export function analyzeColumns(options: { container: HTMLElement }): IColumn[] {
  const { container } = options;

  const columnContext = buildColumnContext(container);

  const columns: IColumn[] = [];

  let lastColumn: IColumn | null = null;

  for (let pIndex = 0; pIndex < container.children.length; pIndex++) {
    const p = container.children.item(pIndex) as HTMLElement;

    if (!lastColumn) {
      lastColumn = generateNextColumn(null, columnContext);
      columns.push(lastColumn);

      lastColumn.start = findStartOfColumn(lastColumn.innerRect, p.children);
    }

    if (lastColumn) {
      const lastWordRect = (p.lastChild as HTMLElement).getBoundingClientRect();
      if (!intersects(lastColumn.innerRect, lastWordRect)) {
        lastColumn.end = findEndOfColumn(lastColumn.innerRect, p.children);
        if (!lastColumn.end) {
          const prevP = container.children.item(pIndex - 1) as HTMLElement;
          lastColumn.end = findEndOfColumn(
            lastColumn.innerRect,
            prevP.children
          );
        }

        lastColumn = generateNextColumn(lastColumn, columnContext);
        columns.push(lastColumn);

        lastColumn.start = findStartOfColumn(lastColumn.innerRect, p.children);
      }

      if (pIndex === container.children.length - 1) {
        lastColumn.end = findEndOfColumn(lastColumn.innerRect, p.children);
      }
    }
  }

  return columns;
}

export function columnsToVirtualDocument(
  columns: IColumn[],
  options: { container: HTMLElement; columnCount: number }
): IVirtualDocument {
  const columnContext = buildColumnContext(options.container);

  const containerRect = domRectToRect(
    options.container.getBoundingClientRect()
  );

  const doc: IVirtualDocument = { pages: [] };

  const pagesCount = Math.ceil(columns.length / options.columnCount);

  for (let pIndex = 0; pIndex < pagesCount; pIndex++) {
    const cols = columns.slice(
      pIndex * options.columnCount,
      pIndex * options.columnCount + options.columnCount
    );

    const firstCol = cols[0];

    const pageRect: IRect = {
      top: firstCol.innerRect.top,
      left: firstCol.innerRect.left,
      width: columnContext.pageRect.width,
      height: columnContext.pageRect.height,
    };

    const page: IVirtualPage = {
      absoluteRect: pageRect,
      rect: {
        top: pageRect.top - containerRect.top,
        left: pageRect.left - containerRect.left,
        width: pageRect.width,
        height: pageRect.height,
      },
      columns: [
        ...cols.map((c) => {
          return {
            absoluteRect: c.innerRect,
            rect: intersectRelative(pageRect, c.innerRect)!,
            media: [],
          };
        }),
      ],
    };

    doc.pages.push(page);
  }

  return doc;
}

export function renderMediaIntoDOM(
  doc: IVirtualDocument,
  options: { container: HTMLElement }
) {
  doc.pages.forEach((p) => {
    p.columns.forEach((c) => {
      c.media.forEach((m) => {
        const elementUnderMediaTopLeft = document.elementsFromPoint(
          m.absoluteRect.left,
          m.absoluteRect.top
        ) as HTMLElement[];

        if (elementUnderMediaTopLeft) {
          let wordEl = elementUnderMediaTopLeft.find(
            (el) => el.dataset.type === "word"
          );

          if (!wordEl) {
            const paragraphEl = elementUnderMediaTopLeft.find(
              (el) => el.dataset.type === "paragraph"
            );
            if (paragraphEl) {
              const wordsEls = paragraphEl.querySelectorAll(
                "[data-type='word']"
              );
              wordEl = wordsEls.item(wordsEls.length - 1) as HTMLElement;
            }
            console.log(`didn't find anything`, elementUnderMediaTopLeft);
          }

          if (wordEl) {
            console.log("found element under media", wordEl);

            const mediaEl = document.createElement("div");

            if (m.rect.left === 0) {
              mediaEl.style.float = "left";
              mediaEl.style.backgroundColor = "blue";
            } else if (m.rect.left + m.rect.width === c.rect.width) {
              mediaEl.style.float = "right";
              mediaEl.style.backgroundColor = "red";
            } else {
              mediaEl.style.backgroundColor = "yellow";
            }

            mediaEl.style.height = m.rect.height + "px";
            mediaEl.style.width = m.rect.width + "px";

            wordEl.parentElement!.insertBefore(mediaEl, wordEl);
          }
        }
      });
    });
  });
}
