import { blankOperator, operators } from "./calculator/operators/operators.js";
import { Parser } from "./calculator/parser.js";
import { EntryList } from "./input/entrylist.js";
import { Grapher } from "./grapher/grapher.js";

document.getElementById("error")?.remove();
const entryListEle = document.getElementById("entrylist");
if (!entryListEle) throw new Error("Entry list element not found.");
const entryList = new EntryList(entryListEle);

const canvas = document.getElementById("graph");
if (!canvas) throw new Error("Canvas element not found.");
const graph = new Grapher(canvas);

const parser = new Parser(operators, blankOperator);

const updateButton = document.getElementById("update") as HTMLButtonElement;
if (!updateButton) throw new Error("Update button not found.");
updateButton.addEventListener('mousedown', () => {
    const mathTokens = entryList.getAllMath();
    for (const math of mathTokens) {
        parser.parse(math);
    }
});