import { IRect } from "../geometry";
import { IColumn } from "../utils";

export interface IRawTextParagraph {
  id: string;
  content: string;
}

export interface IRawText {
  paragraphs: IRawTextParagraph[];
}

export interface IHTMLTextParagraphWord {
  /** offset in the paragraph */
  offset: number;

  element: HTMLElement;
}

export interface IHTMLTextParagraph {
  id: string;
  content: IHTMLTextParagraphWord[];

  element: HTMLElement;
}

export interface IHTMLText {
  paragraphs: IHTMLTextParagraph[];
}

export interface ITextPage {
  pageNumber: number;
  columns: IColumn[];
}

export interface IVirtualColumnMedia {
  absoluteRect: IRect;

  /** relative to column */
  rect: IRect;
}

export interface IVirtualColumn {
  absoluteRect: IRect;

  /** relative to virtual page. */
  rect: IRect;

  media: IVirtualColumnMedia[];
}

export interface IVirtualPage {
  absoluteRect: IRect;

  rect: IRect;

  columns: IVirtualColumn[];
}

export interface IVirtualDocument {
  pages: IVirtualPage[];
}
