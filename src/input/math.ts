import type { MathElement } from "./mathrender.js";

export function mathToken(name: string, args?: MathToken[][]): MathToken {
    if (args) return { name: name, args: args };
    else return { name: name, args: [] };
}

export function tokensToString(tokens: MathToken | MathToken[]): string {
    // i know this is lazy but who cares
    if (!Array.isArray(tokens)) return tokensToString([tokens]);

    let out: string = "";
    for (const token of tokens) {
        out += token.name;
        for (const argument of token.args)
            out += tokensToString(argument);
    }

    return out;
}

/**
 * a token in math
 */
export type MathToken = {
    name: string;
    args: MathToken[][];
};

export type MathInputShortcut = {
    trigger: MathToken[],
    value: MathToken,
};

/**
 * mathtoken but with extra hidden stuff
 */
export type InputMathToken = {
    name: string;
    args: InputMathToken[][];
    firstEmptyArgument?: number;
    mathElement?: MathElement;
};