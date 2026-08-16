import { EntryList } from "./entries/entrylist.js";
import { Grapher } from "./grapher/grapher.js";

export function init() {
    const entryListEle = document.getElementById("entrylist");
    if (!entryListEle) throw new Error("Entry list element not found.");
    const entryList = new EntryList(entryListEle);

    const canvas = document.getElementById("graph");
    if (!canvas) throw new Error("Canvas element not found.");
    const graph = new Grapher(canvas);

    const updateButton = <HTMLButtonElement> document.getElementById("update");
    if (!updateButton) throw new Error("Update button not found.");
    updateButton.addEventListener('mousedown', () => {

    });
}