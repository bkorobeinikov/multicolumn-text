import {
    IHTMLText,
    IHTMLTextParagraph,
    IHTMLTextParagraphWord,
    IRawText
  } from "./models";
  
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
  
  function toHTMLWords(pId: string, content: string): IHTMLTextParagraphWord[] {
    const htmlWords: IHTMLTextParagraphWord[] = [];
    let htmlWordOffset = 0;
  
    const rawWords: string[] = splitPreserve(content, " ");
    rawWords.forEach((w) => {
      const el = document.createElement("span");
      el.dataset.pid = pId;
      el.dataset.poffset = htmlWordOffset.toString();
      el.innerHTML = w;
  
      htmlWords.push({
        offset: htmlWordOffset,
        element: el
      });
  
      htmlWordOffset += w.length;
    });
  
    return htmlWords;
  }
  
  export function toHTMLText(
    rawText: IRawText,
    options: { debug: boolean }
  ): IHTMLText {
    const htmlParagraphs: IHTMLTextParagraph[] = [];
  
    for (let pIndex = 0; pIndex < rawText.paragraphs.length; pIndex++) {
      const rawP = rawText.paragraphs[pIndex];
  
      const htmlP = document.createElement("p");
      htmlP.dataset.pid = rawP.id;
  
      const htmlWords = toHTMLWords(rawP.id, rawP.content);
      htmlP.append(...htmlWords.map((w) => w.element));
  
      if (options.debug) {
        // const color = Math.floor(Math.random() * 16777215).toString(16);
        const color =
          "888888" +
          Math.floor(Math.random() * 16).toString(16) +
          Math.floor(Math.random() * 16).toString(16);
        htmlP.style.backgroundColor = `#${color}`;
      }
  
      htmlParagraphs.push({
        id: rawP.id,
        content: htmlWords,
  
        element: htmlP
      });
    }
  
    return {
      paragraphs: htmlParagraphs
    };
  }
  