import type { MathText } from "../math/mathtext.js";
import { Entry } from "./entry.js";

export class EntryList {
    /**
     * entries IN NO PARTICULAR ORDER.
     */
    private entries: Entry[] = [];
    private element;

    constructor(element: HTMLElement) {
        if (!element) throw new Error("Entry list not found.");
        if (element.nodeName !== "DIV") throw new Error("Entry list element not div.");

        this.element = element;
        const entryElements = Array.from(element.children);
        if (entryElements.length == 0) this.clearEntries();
        else {
            entryElements.forEach((entryElement) => {
                this.entries.push(new Entry(entryElement as HTMLElement, this));
            });
        }
    }

    /**
     * returns all mathtexts of all entries in order.
     */
    getAllMath(): MathText[] {
        const mathTexts: MathText[] = [];
        for (const entry of this.entries) {
            mathTexts.push(entry.getMathText());
        }

        return mathTexts;
    }

    /**
     * creates a new entry places it after the given one and returns it.
     */
    createEntryAfter(givenEntry: Entry): Entry {
        const newEntryElement = document.createElement("div");
        const newEntry = new Entry(newEntryElement, this);
        this.entries.push(newEntry);

        // inserts child after givenEntry
        const afterGivenEntryElement = givenEntry.getElement().nextElementSibling;
        if (afterGivenEntryElement)
            this.element.insertBefore(newEntryElement, afterGivenEntryElement);
        else
            this.element.appendChild(newEntryElement);

        return newEntry;
    }

    /**
     * deletes all entries makes an empty one and returns it
     */
    clearEntries(): Entry {
        this.element.childNodes.forEach((childNode) => {
            childNode.remove();
        });

        const newEntryElement = document.createElement("div");
        const newEntry = new Entry(newEntryElement, this);
        this.entries = [newEntry];
        this.element.appendChild(newEntryElement);

        return newEntry;
    }
}