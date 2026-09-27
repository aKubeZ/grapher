import type { InputMathToken, MathCursor } from "../math.js";
import type { FontStyle } from "./mathrender.js";
import { MathUnit } from "./mathunit.js";

/**
 * Render of a string of math tokens
 */
export class MathString {
    protected element: HTMLElement;
    protected units: MathUnit[] = [];
    protected tokens: InputMathToken[];
    protected baseFontSize: number;
    protected baseFontStyle: FontStyle;
    protected blankElement: HTMLElement = document.createElement("math-unit-placeholder");
    protected cursorElement: HTMLElement = document.createElement("math-cursor");
    protected selectionElement: HTMLElement = document.createElement("math-selection");

    public constructor(elementTag: string, tokens: InputMathToken[], baseFontSize: number, baseFontStyle: FontStyle) {
        this.element = document.createElement(elementTag);
        this.tokens = tokens;
        this.baseFontSize = baseFontSize;
        this.baseFontStyle = baseFontStyle;

        for (const token of tokens) {
            const unit = new MathUnit(token, baseFontSize, baseFontStyle);
            this.units.push(unit);
            this.element.appendChild(unit.getElement());
        }

        if (tokens.length === 0) this.element.appendChild(this.blankElement);

        this.element.style.width = `${this.element.scrollWidth}px`;
        this.element.style.height = `${this.element.scrollHeight}px`;
    }

    public getElement() { return this.element; }
    public getWidth() { return this.element.scrollWidth; }
    public getHeight() { return this.element.scrollHeight; }

    public setCursor(cursor: null | MathCursor, selection: number) {
        // why does this method have so many comments and the rest like none
        // ill probably add comments to other methods tho
        this.cursorElement.remove(); // removes the cursor if it exists
        if (!cursor) {
            if (this.tokens.length === 0 && !this.element.contains(this.blankElement))
                this.element.appendChild(this.blankElement);
            return;
        }

        const height = this.getHeight(); // gets height BEFORE the blank elements removed
        this.blankElement.remove(); // removes the blank element ONLY if theres a cursor

        if (cursor.arg) { // if the cursor is not directly here
            // i think im using exclamation points too liberally but
            // i trust my math input class its been working p well for mathjax
            const unit = this.units[cursor.index]!;
            const argument = unit.getArgument(cursor.arg.index)!;
            argument.setCursor(cursor.arg.pos, selection);
        } else { // if the cursor is directly here (add it!)
            // find the offset
            let offset = 0;
            let i = 0;
            for (; i < cursor.index; i++) {
                const unit = this.units[i]!;
                offset += unit.getWidth();
            }

            // inserts the element where it should be
            // just to please my desires
            if (i === this.units.length)
                this.element.appendChild(this.cursorElement);
            else
                this.element.insertBefore(this.cursorElement, this.units[i]!.getElement());

            // adjust the position and height accordingly
            this.cursorElement.style.left = `${offset}px`;
            this.cursorElement.style.height = `${height}px`;
        }
    }
}