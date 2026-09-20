import { MathInput, mathToken, type MathInputBase, type MathToken } from "./mathinput.js";
import { updateMath } from "./mathjax.js";

export class EntryMath {
    private static entries: EntryMath[] = [];

    public static newEntryMath(element: HTMLDivElement): EntryMath {
        const entryMath = new EntryMath(element);
        this.entries.push(entryMath);
        return entryMath;
    }

    private element: HTMLDivElement;
    private mathInput: MathInputBase;
    private constructor(element: HTMLDivElement) {
        this.element = element;
        this.mathInput = new MathInput();
        this.initEntry();
    }

    private initEntry(): void {
        this.element.contentEditable = "plaintext-only";
        this.mathInput.updateMathFunction = (newString: string) => {
            this.element.textContent = newString;
            updateMath(this.element);
        };

        this.element.addEventListener('keydown', (event) => {
            if (event.altKey || event.metaKey) return;
            const key = event.key.toUpperCase();

            let insertKey = false;
            let forcePreventDefault = true;
            switch (key) {
            case "ESCAPE": return;
            case "ARROWRIGHT":
                if (!event.ctrlKey) {
                    if (!event.shiftKey) this.mathInput.moveCursorRight();
                    else this.mathInput.selectionRight();
                } else {
                    if (!event.shiftKey) this.mathInput.forceCursorRight();
                    else this.mathInput.forceSelectRight();
                }
                break;
            case "ARROWLEFT":
                if (!event.ctrlKey) {
                    if (!event.shiftKey) this.mathInput.moveCursorLeft();
                    else this.mathInput.selectionLeft();
                } else {
                    if (!event.shiftKey) this.mathInput.forceCursorLeft();
                    else this.mathInput.forceSelectLeft();
                }
                break;
            case "TAB":
                if (!event.shiftKey)
                    this.mathInput.tabCursorRight();
                else
                    this.mathInput.tabCursorLeft();
                break;
            case "BACKSPACE":
                if (event.ctrlKey)
                    this.mathInput.clear();
                else
                    this.mathInput.deleteLeft();
                break;
            case "DELETE":
                if (event.ctrlKey)
                    this.mathInput.clear();
                else
                    this.mathInput.deleteRight();
                break;
            case "A":
                if (event.ctrlKey) {
                    this.mathInput.selectAll();
                    forcePreventDefault = true;
                } else
                    insertKey = true;
                break;
            case "C":
                if (event.ctrlKey) {
                    this.mathInput.copy();
                    forcePreventDefault = true;
                } else
                    insertKey = true;
                break;
            case "X":
                if (event.ctrlKey) {
                    this.mathInput.cut();
                    forcePreventDefault = true;
                } else
                    insertKey = true;
                break;
            case "V":
                if (event.ctrlKey) {
                    this.mathInput.paste();
                    forcePreventDefault = true;
                } else
                    insertKey = true;
                break;
            default:
                insertKey = true;
            }

            if (insertKey && key.length === 1) {
                // uses event.key for casing
                this.mathInput.insertToken(mathToken(event.key));
            }

            if (forcePreventDefault || !event.ctrlKey) event.preventDefault();
        });

        this.element.addEventListener('focus', () => this.mathInput.focus());
        this.element.addEventListener('blur', () => this.mathInput.unfocus());

        this.mathInput.updateMath();
    }

    public getMathTokens(): MathToken[] { return this.mathInput.getMathTokens(); }
}