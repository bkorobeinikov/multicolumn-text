import { intersects, IRect } from "./geometry";

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
