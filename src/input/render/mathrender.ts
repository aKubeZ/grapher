import type { InputMathToken, MathCursor } from "../math.js";
import { MathString } from "./mathstring.js";

export type Offset = {
    x: number;
    y: number;
};

export type FontStyle = "mathfont" | "textfont";

/**
 * A full render of math
 */
export class MathRender {
    // default values
    private fontSize: number;
    private fontStyle: FontStyle = "mathfont";

    private tokens: InputMathToken[];
    private mathString!: MathString;
    private element: HTMLElement;
    private parent: HTMLElement;

    public constructor(tokens: InputMathToken[], parent: HTMLElement, fontSize: number) {
        this.fontSize = fontSize;
        this.tokens = tokens;
        this.element = document.createElement("math-container");
        this.parent = parent;

        this.parent.appendChild(this.element);
        this.updateTokens();

        this.element.style.width = `${this.element.scrollWidth}px`;
        this.element.style.height = `${this.element.scrollHeight}px`;
    }

    public setCursor(cursor: null | MathCursor, selection: number): void {
        this.mathString.setCursor(cursor, selection);
    }

    public getElement() { return this.element; }

    /**
     * updates the math (and cursor with it) by
     * resetting everything because i know of no other way
     */
    public updateTokens(): void {
        this.mathString?.getElement().remove();
        this.mathString = new MathString("math-render", this.tokens, this.fontSize, this.fontStyle);
        this.element.appendChild(this.mathString.getElement());
    }
}