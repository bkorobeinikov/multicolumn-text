import { IPoint } from "./point";
import { IRect } from "./rect";

/** Used for performent check if two rectangles overlap. */
function intersects(a: IRect, b: IRect): boolean {
  const left = Math.max(a.left, b.left);
  const right = Math.min(a.left + a.width, b.left + b.width);

  if (left >= right) {
    return false;
  }

  const top = Math.max(a.top, b.top);
  const bottom = Math.min(a.top + a.height, b.top + b.height);

  return top < bottom;
}

function intersectWith(a: IRect, b: IRect): IRect | null {
  const left = Math.max(a.left, b.left);
  const right = Math.min(a.left + a.width, b.left + b.width);
  const top = Math.max(a.top, b.top);
  const bottom = Math.min(a.top + a.height, b.top + b.height);

  if (right >= left && bottom >= top) {
    return { left, top, width: right - left, height: bottom - top };
  }

  return null;
}

/**
 * Gets area which is overlapped by inner rectangle.
 * Result has top left coord relative to outer rectangle.
 *
 * |‾‾‾‾‾‾‾‾|
 * |        |
 * |   |████|‾‾‾‾|
 * |___|████|    |
 *     |_________|
 * { left: 20, top: 20: width: 20, height: 20 }
 */
function intersectRelative(outer: IRect, inner: IRect): IRect | null {
  const left = Math.max(outer.left, inner.left);
  const right = Math.min(outer.left + outer.width, inner.left + inner.width);
  const top = Math.max(outer.top, inner.top);
  const bottom = Math.min(outer.top + outer.height, inner.top + inner.height);

  if (right >= left && bottom >= top) {
    return {
      left: Math.max(inner.left - outer.left, 0),
      top: Math.max(inner.top - outer.top, 0),
      width: right - left,
      height: bottom - top,
    };
  }

  return null;
}

function intersectsInBetween(start: IRect, end: IRect, rect: IRect): boolean {
  const left = Math.max(Math.min(start.left, end.left), rect.left);
  const right = Math.min(
    Math.max(start.left + start.width, end.left + end.width),
    rect.left + rect.width
  );

  if (right < left) {
    return false;
  }

  const top = Math.max(Math.min(start.top, end.top), rect.top);
  const bottom = Math.min(
    Math.max(start.top + start.height, end.top + end.height),
    rect.top + rect.height
  );

  if (bottom < top) {
    return false;
  }

  return true;
}

function containsPoint(rect: IRect, point: IPoint) {
  return (
    point.x >= rect.left &&
    point.x <= rect.left + rect.width &&
    point.y >= rect.top &&
    point.y <= rect.top + rect.height
  );
}

/**
 * Does inner rect fits inside the outer rect completely.
 */
function fitsInsideVertically(outer: IRect, inner: IRect) {
  return (
    inner.top >= outer.top &&
    inner.top + inner.height <= outer.top + outer.height
  );
}

function fitsInsideHorizontally(outer: IRect, inner: IRect) {
  return (
    inner.left >= outer.left &&
    inner.left + inner.width <= outer.left + outer.width
  );
}

export {
  intersects,
  intersectWith,
  intersectRelative,
  intersectsInBetween,
  containsPoint,
  fitsInsideVertically,
  fitsInsideHorizontally,
};
