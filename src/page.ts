import { EntryList } from "./entries/entrylist.js";
import { Graph } from "./grapher/graph.js";

export function init() {
    const entryListEle = document.getElementById("entrylist");
    if (!entryListEle) throw new Error("Entry list element not found.");
    const entryList = new EntryList(entryListEle);

    const canvas = <HTMLElement> document.getElementById("graph");
    const graph = new Graph(canvas);
}