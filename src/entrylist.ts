import { Entry } from "./entry.js";

export class EntryList {
    /**
     * entries IN NO PARTICULAR ORDER.
     */
    #mEntries: Entry[] = [];
    #element;

    constructor(element: HTMLElement) {
        if (!element) throw new Error("Entry list not found.");
        if (element.nodeName !== "DIV") throw new Error("Entry list element not div.");

        this.#element = element;
        const entryElements = Array.from(element.children);
        entryElements.forEach((entryElement) => {
            this.#mEntries.push(new Entry(<HTMLElement> entryElement, this));
        });
    }

    /**
     * creates a new entry places it after the given one and returns it.
     */
    createEntryAfter(givenEntry: Entry) {
        const newEntryElement = document.createElement("div");
        const newEntry = new Entry(newEntryElement, this);
        this.#mEntries.push(newEntry);

        // inserts child after givenEntry
        const afterGivenEntryElement = givenEntry.getElement().nextElementSibling;
        if (afterGivenEntryElement)
            this.#element.insertBefore(newEntryElement, afterGivenEntryElement);
        else
            this.#element.appendChild(newEntryElement);

        return newEntry;
    }
}