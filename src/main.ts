import { Entry } from "./entry.js";
import { EntryList } from "./entrylist.js";

function main() {
    const entryListEle = document.getElementById("entrylist");
    if (!entryListEle) throw new Error("Entry list element not found.");
    const entryList = new EntryList(entryListEle);
}

main();