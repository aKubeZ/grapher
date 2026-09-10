import { MathInput, type MathToken } from "./mathinput";

export class EntryMath {
    private static entries: EntryMath[] = [];
    public static newEntryMath(element: HTMLDivElement): EntryMath {
        const entryMath = new EntryMath(element);
        this.entries.push(entryMath);
        return entryMath;
    }

    private element: HTMLDivElement;
    private mathInput: MathInput;
    private constructor(element: HTMLDivElement) {
        this.element = element;
        this.mathInput = new MathInput();
        this.initEntry();
    }

    private initEntry(): void {
        this.element.addEventListener('keydown', (event) => {
            const key = event.key.toUpperCase();
            console.log(key);
        });
    }

    public getMathTokens(): MathToken[] { return this.mathInput.getMathTokens(); }
}