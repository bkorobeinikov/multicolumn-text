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
