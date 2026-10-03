import type { InputMathToken } from "../math.js";
import type { FontStyle, Offset } from "./mathrender.js";
import { MathString } from "./mathstring.js";

export type OffsetAnchor = "left" | "right";

export type MathUnitConfig = {
    name: string;
    offset: Offset;
    fontStyle: FontStyle | undefined; // undefined means inherit
    fontScale: number;
    args: MathArgumentConfig[];
};

export type MathArgumentConfig = {
    offset: Offset;
    offsetAnchor: OffsetAnchor;
    fontStyle: FontStyle | undefined; // undefined means inherit
    fontScale: number;
};

export const defaultArgumentConfig: MathArgumentConfig = {
    offset: { x: 0, y: 0 },
    offsetAnchor: "right",
    fontStyle: undefined,
    fontScale: 1,
};

/**
 * Creates a unit config based on the given ones,
 * if not provided then it uses a default.
 */
function createUnitConfig(
    config: {
        name: string;
        offset?: Offset;
        fontStyle?: FontStyle;
        fontScale?: number;
        args?: MathArgumentConfig[];
    }
): MathUnitConfig {
    return {
        name: config.name,
        offset: config.offset || { x: 0, y: 0 },
        fontStyle: config.fontStyle,
        fontScale: config.fontScale || 1,
        args: config.args || []
    };
}

const unitConfigs: { [tokenName: string]: MathUnitConfig } = {
    "1": createUnitConfig({ name: "1", fontStyle: "textfont" }),
    "2": createUnitConfig({ name: "2", fontStyle: "textfont" }),
    "3": createUnitConfig({ name: "3", fontStyle: "textfont" }),
    "4": createUnitConfig({ name: "4", fontStyle: "textfont" }),
    "5": createUnitConfig({ name: "5", fontStyle: "textfont" }),
    "6": createUnitConfig({ name: "6", fontStyle: "textfont" }),
    "7": createUnitConfig({ name: "7", fontStyle: "textfont" }),
    "8": createUnitConfig({ name: "8", fontStyle: "textfont" }),
    "9": createUnitConfig({ name: "9", fontStyle: "textfont" }),
    "0": createUnitConfig({ name: "0", fontStyle: "textfont" }),
    "!": createUnitConfig({ name: "!", fontStyle: "textfont" }),
    "?": createUnitConfig({ name: "?", fontStyle: "textfont" }),
    ".": createUnitConfig({ name: ".", fontStyle: "textfont" }),
    ",": createUnitConfig({ name: ",", fontStyle: "textfont" }),
    "+": createUnitConfig({ name: "+", fontStyle: "textfont" }),
    "=": createUnitConfig({ name: "=", fontStyle: "textfont" }),
    "-": createUnitConfig({ name: "-", fontStyle: "textfont" }),
    "\\infty ": createUnitConfig({ name: "∞", fontStyle: "textfont" }),
    "\\sqrt ": createUnitConfig({ name: "√", fontStyle: "textfont" }),
    "\\pi ": createUnitConfig({ name: "π", fontStyle: "textfont" }),
    "\\dint ": createUnitConfig({
        name: "∫", fontStyle: "textfont",
        fontScale: 2,
        args: [
            { offset: { x: 10, y: 0 }, offsetAnchor: "left", fontStyle: "mathfont", fontScale: 0.5 },
            { offset: { x: 10, y: 10 }, offsetAnchor: "left", fontStyle: "mathfont", fontScale: 0.5 },
            { offset: { x: 10, y: 5 }, offsetAnchor: "left", fontStyle: "mathfont", fontScale: 1 },
        ]
    }),
};

/**
 * Render of one math token
 */
export class MathUnit {
    private token: InputMathToken;
    private baseFontSize: number;
    private baseFontStyle: FontStyle;
    private fontStyle: FontStyle;
    private unitConfig: MathUnitConfig;
    private args: MathString[] = [];

    private element: HTMLElement;
    public constructor(token: InputMathToken, baseFontSize: number, baseFontStyle: FontStyle) {
        this.token = token;
        this.baseFontSize = baseFontSize;
        this.baseFontStyle = baseFontStyle;
        this.unitConfig = unitConfigs[token.name] || createUnitConfig({ name: token.name });

        for (let i = 0; i < token.args.length; i++) {
            const argument = token.args[i]!;
            const argumentConfig = this.unitConfig.args[i] || defaultArgumentConfig;
            this.args.push(new MathString(
                "math-argument",
                argument,
                baseFontSize * argumentConfig.fontScale,
                argumentConfig.fontStyle || baseFontStyle
            ));
        }

        this.fontStyle = this.unitConfig.fontStyle || baseFontStyle;
        this.element = document.createElement("math-unit");
        this.element.textContent = this.unitConfig.name;
        for (const argument of this.args) this.element.appendChild(argument.getElement());

        this.element.classList.add(this.fontStyle); // i like this
        this.element.style.fontSize = `${this.unitConfig.fontScale * baseFontSize}px`;
    }

    public updateSize() {
        for (const argument of this.args) argument.updateSize();
        // this.element.style.width = `${this.element.offsetWidth}px`;
        // this.element.style.height = `${this.element.offsetHeight}px`;
    }

    public getArgument(index: number) { return this.args[index]; }
    public getElement() { return this.element; }
    public getToken() { return this.token; }
    public getWidth() { return this.element.offsetWidth; }
    public getHeight() { return this.element.offsetHeight; }
}