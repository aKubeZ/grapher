import { EntryList } from "./entrylist.js";

export class Entry {
    static #entries: Entry[] = [];
    static getEntry(element: HTMLElement) {
        if (element.nodeName !== "DIV") return undefined;
        for (const entry of Entry.#entries)
            if (entry.#element == element) return entry;
        return undefined;
    }

    static #focusElement(element: HTMLElement) {
        const range = document.createRange();
        const selection = window.getSelection();
        range.setStart(element, 0);
        range.collapse(true);
        selection?.removeAllRanges();
        selection?.addRange(range);
    }

    #element: HTMLDivElement;
    #entryList: EntryList | undefined;
    constructor(element: HTMLElement, entryList: EntryList | undefined) {
        if (!element) throw new Error("Entry not found");
        if (element.nodeName !== "DIV") throw new Error("Entry element not div");
        
        this.#element = <HTMLDivElement> element;
        this.#entryList = entryList;
        this.#initEntry();
        Entry.#entries.push(this);
    }

    #initEntry() {
        this.#element.classList.add("entry");
        this.#element.contentEditable = "plaintext-only";
        // create new entry on enter
        if (!this.#entryList) throw new Error("Entry not yet defined");
        this.#element.addEventListener('keydown', (event) => {
            switch (event.key) {
                case "Enter": {
                    event.preventDefault();
                    const newEntry = (<EntryList> this.#entryList).createEntryAfter(this);
                    newEntry.focus();
                } break;
                case "ArrowUp": {
                    const prevEntryElement = <HTMLElement> this.#element.previousElementSibling;
                    if (prevEntryElement) {
                        Entry.#focusElement(prevEntryElement);
                        event.preventDefault();
                    }
                } break;
                case "ArrowDown": {
                    const nextEntryElement = <HTMLElement> this.#element.nextElementSibling;
                    if (nextEntryElement) {
                        Entry.#focusElement(nextEntryElement);
                        event.preventDefault();
                    }
                } break;
            }
        });
    }

    /**
     * Puts the cursor inside the entry
     */
    focus() { Entry.#focusElement(this.#element) }
    setEntryList(entryList: EntryList) { this.#entryList = entryList; }
    getElement() { return this.#element; }
    getText() { return this.#element.textContent; }
}