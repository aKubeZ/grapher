/**
 * a type to store where the cursor is in the math
 */
type CursorPos = {
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
        pos?: CursorPos;
    };
};

/**
 * mathtoken but with extra hidden stuff
 */
type InputMathToken = MathToken & {
    size?: number;
    firstEmptyArgument?: number;
    string?: string;
};

export function mathToken(name: string, args?: MathToken[][]): MathToken {
    if (args) return { name: name, args: args };
    else return { name: name, args: [] };
}

/**
 * a token in math
 */
export type MathToken = {
    name: string;
    args: MathToken[][];
};

/**
 * a class that handles an input with math and its cursors and selection
 */
export class MathInput {
    /*
     * clear(): void { }
     * toString(): string { }
     * moveRight(): void { }
     * moveLeft(): void { }
     * tabRight(): void { }
     * tabLeft(): void { }
     * replaceInsert(): void { }
     * selectionRight(): void { }
     * selectionLeft(): void { }
     * selectAll(): void { }
     */
    /**
     * the location of the cursor
     */
    private cursor: null | CursorPos = null;

    /**
     * (signed) how many tokens are selected
     */
    private cursorSelect: number = 0;

    /**
     * the token that will be used as hte cursor
     */
    private cursorToken: MathToken = {
        name: "{\\mkern -1mu \\raise{0.1ex}{\\Large \\vert} \\mkern -1mu}",
        args: []
    };

    /**
     * the token that will be used for the selection
     */
    private selectionToken: MathToken = {
        name: "{\\bbox[#870099, 1pt]}",
        args: [[]]
    }

    /**
     * the tokens in the math input
     */
    private mathTokens: InputMathToken[] = [
        mathToken('a')
    ];
    
    /**
     * create a math input object
     */
    public constructor() { }

    /**
     * reset the values (like size, string) for each token when the values need to be recalculated
     * @param mathTokens the tokens to reset the valeus of
     */
    private resetValues(mathTokens = this.mathTokens): void {
        for (const token of mathTokens) {
            delete token.size, token.string, token.firstEmptyArgument; 
            if (!token.args) continue;
            for (const argument of token.args)
                this.resetValues(argument);
        }
    }

    /**
     * sets the mathTokens to an empty list
     */
    public clear(): void {
        this.mathTokens = [];
        this.resetValues();
    }

    /**
     * when the user is focused on the div element
     */
    public focus(): void { this.cursor = { index: 0 }; }

    /**
     * when the user unfocuses the div element
     */
    public unfocus(): void {
        this.cursor = null;
        this.cursorSelect = 0;
    }

    /**
     * returns a string to display of the mathTokens or the tokens if provided.
     * Also adds cursor and selection tokens
     * @param tokens the tokens to turn into a string, default to mathTokens
     * @returns the string
     */
    public getString(tokens: MathToken[] = this.mathTokens): string {
        let getString = "";
        for (const token of this.mathTokens) {
            if (token.string) getString += token.string;
            else {
                let tokenString = "";
                for (const argument of token.args)
                    tokenString += this.getString(argument);
                token.string = tokenString;
            }
        }

        return getString;
    }

    public getMathTokens(): MathToken[] { return this.mathTokens; }
}