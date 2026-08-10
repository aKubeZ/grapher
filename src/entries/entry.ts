import { EntryList } from "./entrylist.js";
import { MathInput } from "../math/mathinput.js";

export class Entry {
    private static entries: Entry[] = [];
    public static getEntry(element: HTMLElement): Entry | undefined {
        if (element.nodeName !== "DIV") return undefined;
        for (const entry of Entry.entries)
            if (entry.element == element) return entry;
        return undefined;
    }

    private static focusElement(element: HTMLElement): undefined {
        const range = document.createRange();
        const selection = window.getSelection();
        range.setStart(element, 0);
        range.collapse(true);
        selection?.removeAllRanges();
        selection?.addRange(range);
    }

    private element: HTMLDivElement;
    private entryList: EntryList | undefined;
    constructor(element: HTMLElement, entryList: EntryList | undefined) {
        if (!element) throw new Error("Entry not found");
        if (element.nodeName !== "DIV") throw new Error("Entry element not div");
        
        this.element = <HTMLDivElement> element;
        this.entryList = entryList;

        this.initEntry();
        Entry.entries.push(this);
    }

    private initEntry(): undefined {
        this.element.classList.add("entry");
        this.element.addEventListener('keydown', (event) => {
            switch (event.key) {
                case "Enter": { // new entry
                    event.preventDefault();
                    const newEntry = (<EntryList> this.entryList).createEntryAfter(this);
                    newEntry.focus();
                } break;
                case "ArrowUp": { // move up an entry
                    const prevEntryElement = <HTMLElement> this.element.previousElementSibling;
                    if (prevEntryElement) {
                        Entry.focusElement(prevEntryElement);
                        event.preventDefault();
                    }
                } break;
                case "ArrowDown": { // move down an entry
                    const nextEntryElement = <HTMLElement> this.element.nextElementSibling;
                    if (nextEntryElement) {
                        Entry.focusElement(nextEntryElement);
                        event.preventDefault();
                    }
                } break;
                case "Backspace": { // delete this entry
                    if (!event.ctrlKey) return;
                    const prevEntryElement = <HTMLElement> this.element.previousElementSibling;
                    if (!prevEntryElement) {
                        const nextEntryElement = <HTMLElement> this.element.nextElementSibling;
                        if (!nextEntryElement) return;
                        Entry.focusElement(nextEntryElement);
                        this.delete();
                        return;
                    }

                    Entry.focusElement(prevEntryElement);
                    this.delete();
                    event.preventDefault();
                }
            }
        });
        
        MathInput.mathInput(this.element);
    }

    delete(): undefined {
        this.element.remove();
        const index = Entry.entries.indexOf(this);
        if (index > -1) Entry.entries.splice(index, 1);
    }

    /**
     * Puts the cursor inside the entry
     */
    focus(): undefined { Entry.focusElement(this.element) }
    setEntryList(entryList: EntryList): undefined { this.entryList = entryList; }
    getElement(): HTMLDivElement { return this.element; }
    getText(): string { return this.element.textContent; }
}