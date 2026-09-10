import { EntryList } from "./entrylist.js";
import { EntryMath } from "../math/entrymath.js";
import type { MathToken } from "../math/mathinput.js";

export class Entry {
    private static entries: Entry[] = [];
    public static getEntry(element: HTMLElement): Entry | undefined {
        if (element.nodeName !== "DIV") return undefined;
        for (const entry of Entry.entries)
            if (entry.element == element) return entry;
        return undefined;
    }

    private static focusElement(element: HTMLElement): void {
        const range = document.createRange();
        const selection = window.getSelection();
        range.setStart(element, 0);
        range.collapse(true);
        selection?.removeAllRanges();
        selection?.addRange(range);
    }

    private element: HTMLDivElement;
    private entryList: EntryList | undefined;
    private math: EntryMath;
    constructor(element: HTMLElement, entryList: EntryList | undefined) {
        if (!element) throw new Error("Entry not found");
        if (element.nodeName !== "DIV") throw new Error("Entry element not div");
        
        this.element = element as HTMLDivElement;
        this.math =  EntryMath.newEntryMath(this.element);
        this.entryList = entryList;

        this.element.classList.add("entry");
        Entry.entries.push(this);
    }

    public getMathTokens(): MathToken[] {
        return this.math.getMathTokens();
    }

    delete(): void {
        this.element.remove();
        const index = Entry.entries.indexOf(this);
        if (index > -1) Entry.entries.splice(index, 1);
    }

    /**
     * Puts the cursor inside the entry
     */
    focus(): void { Entry.focusElement(this.element) }
    setEntryList(entryList: EntryList): void { this.entryList = entryList; }
    getElement(): HTMLDivElement { return this.element; }
}