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

/**
 * a type to store where the cursor is in the math.
 * Here's how this would probably work:
 * 
 * `index` refers to which token the cursor is located
 *  - If it's 0 then its at the beninging, if it's the length then its at the end
 * 
 * `arg` refers to which argument the cursor is at
 *  - If it's undefined then its at the end of the token (with no argument)
 */
export type MathCursor = {
    /**
     * which token
     */
    index: number;
    /**
     * the argument of the token (if it exists)
     */
    arg?: {
        /**
         * which argument
         */
        index: number;

        /**
         * where in the argument
         */
        pos: MathCursor;
    };
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
};