import { Entry } from "./entry.js";
import { MathInput, mathToken, type MathInputBase, type MathToken, type MathInputShortcut } from "./mathinput.js";
import { updateMath } from "./mathjax.js";

/*
i have a feeling that entry math is going to be reformed soon but that's an
issue for future me so we just dont talk about that ok
mathjax has been a pain lowkirkenuinely
also its not built for this so
*/

/**
 * what the input keys are directly substituted for name for name
 */
const substitutionKeys: { [key: string]: string } = {
    " ": "\\  ",
    "#": "\\# ",
    "%": "\\% ",
    "&": "\\& ",
    "(": "\\paren ",
    "*": "\\cdot ",
    "[": "\\brack ",
    "\\": "\\backslash ",
    "{": "\\brace ",
    "|": "\\verts ",
    "~": "\\sim ",
    "/": "\\frac ",
};

/**
 * how many arguments are given to certain keys, if any
 */
const argumentKeys: { [key: string]: number } = {
    "/": 2,
    "(": 1,
    "[": 1,
    "{": 1,
    "^": 1,
    "_": 1,
    "|": 1,
};

/**
 * keys that only move the cursor right without inputting anything
 */
const moveCursorRightKeys = [")", "]", "}"];

function mathTokens(input: string): MathToken[] {
    const tokens: MathToken[] = [];
    for (const char of input)
        tokens.push(mathToken(char));
    return tokens;
}

/**
 * shortcuts yay
 */
const shortcuts: MathInputShortcut[] = [
    { trigger: mathTokens("sin"), value: mathToken("\\sin ") },
    { trigger: mathTokens("cos"), value: mathToken("\\cos ") },
    { trigger: mathTokens("tan"), value: mathToken("\\tan ") },
    { trigger: mathTokens("sec"), value: mathToken("\\sec ") },
    { trigger: mathTokens("csc"), value: mathToken("\\csc ") },
    { trigger: mathTokens("cot"), value: mathToken("\\cot ") },
    // { trigger: mathTokens("arcsin"), value: mathToken("\\sin ", [[]]) },
    // { trigger: mathTokens("arccos"), value: mathToken("\\cos ", [[]]) },
    // { trigger: mathTokens("arctan"), value: mathToken("\\tan ", [[]]) },
    // { trigger: mathTokens("arcsec"), value: mathToken("\\arcsec ", [[]]) },
    // { trigger: mathTokens("arccsc"), value: mathToken("\\arccsc ", [[]]) },
    // { trigger: mathTokens("arccot"), value: mathToken("\\arccot ", [[]]) },
];

export class EntryMath {
    /**
     * a list of all entries
     */
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
        this.mathInput.setShortcuts(shortcuts);

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
                if (moveCursorRightKeys.includes(key)) {
                    this.mathInput.moveCursorRight();
                    event.preventDefault();
                    return;
                }

                const argumentCount = argumentKeys[key] || 0;
                const tokenName = substitutionKeys[key] || event.key;
                // uses event.key for casing

                const args: [][] = []; // a list of empty lists is so stupid :sob:
                for (let i = 0; i < argumentCount; i++) args.push([]);
                
                this.mathInput.insertToken(mathToken(tokenName, args));
            }

            if (forcePreventDefault || !event.ctrlKey) event.preventDefault();
        });

        this.element.addEventListener('focus', () => this.mathInput.focus());
        this.element.addEventListener('blur', () => this.mathInput.unfocus());

        this.mathInput.updateMath();
    }

    public getMathTokens(): MathToken[] { return this.mathInput.getMathTokens(); }
}