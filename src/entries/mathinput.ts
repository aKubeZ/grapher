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
type Cursor = {
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
        pos: Cursor;
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
 * Interface for further abstraction of the math input.
 */
export interface MathInputBase {
    /**
     * Lambda that gets called when a new math string wants to be used.
     */
    updateMathFunction: (newString: string) => void;

    /**
     * Clears every token in the math input.
     */
    clear(): void;

    /**
     * Focuses (adds a cursor to) the math input.
     */
    focus(): void;
    
    /**
     * Unfocuses (removes a cursor from) the math input.
     */
    unfocus(): void;

    /**
     * Selects each token in the string.
     */
    selectAll(): void;
    
    /**
     * Moves the cursor left; does nothing if it can't.
     * Equivalent to the left arrow key.
     */
    moveCursorLeft(): void;
    
    /**
     * Moves the cursor right; does nothing if it can't.
     * Equivalent to the right arrow key.
     */
    moveCursorRight(): void;

    /**
     * Moves the cursor to the very beginning of the text.
     * Equivalent to holding the left arrow key.
     */
    forceCursorLeft(): void;

    /**
     * Moves the cursor to the very end of the text.
     * Equivalent to holding the right arrow key.
     */
    forceCursorRight(): void;

    /**
     * Moves the cursor to the very beginning of the text and selects the tokens from the beginning to the current token.
     * Equivalent to holding shift + the left arrow key.
     */
    forceSelectLeft(): void;

    /**
     * Moves the cursor to the very end of the text and selects the tokens from the current token to the end.
     * Equivalent to holding shift + the right arrow key.
     */
    forceSelectRight(): void;
    
    /**
     * Expands the selection to the left, or retracts it.
     * Equivalent to shift + the left arrow key.
     */
    selectionLeft(): void;

    /**
     * Expands the selection to the right, or retracts it.
     * Equivalent to shift + the right arrow key.
     */
    selectionRight(): void;

    /**
     * Makes the cursor escape its current token argument via the right side.
     * Equivalent to tab.
     */
    tabCursorRight(): void;

    /**
     * Makes the cursor escape its current token argument via the left side.
     * Equivalent to shift + tab.
     */
    tabCursorLeft(): void;

    /**
     * Inserts a token at the cursor position.
     * If the cursor is selecting, the selection goes into the first empty argument
     * of the token, if it has one.
     * @param token The token to be inserted.
     */
    insertToken(token: MathToken): void;

    /**
     * Deletes a token to the left of the cursor position.
     * If the cursor is at the end of a token with arguments, the token simply enters the end of the last argument.
     * If the cursor is at the beginning of the argument of the token, the token gets replaced by all of its arguments.
     */
    deleteLeft(): void;

    /**
     * Deletes a token to the right of the cursor position.
     * If the cursor is at the beginning of a token with arguments, the token simply enters the beginning of the last argument.
     * If the cursor is at the end of the argument of the token, the token gets replaced by all of its arguments.
     */
    deleteRight(): void;

    /**
     * Copies the string of selected tokens (the whole string if none) to clipboard.
     */
    copy(): void;

    /**
     * Copies and deletes the string of selected tokens (the whole string if none) to clipboard.
     */
    cut(): void;

    /**
     * Pastes the copied tokens.
     */
    paste(): void;
    
    /**
     * Returns the string of the math to be used.
     */
    getString(): string;
    
    /**
     * Returns the math tokens.
     */
    getMathTokens(): MathToken[];
    
    /**
     * Updates the output string, automatically called but can be called manually
     * during the initialization of the math input.
     */
    updateMath(): void;
}

export function tokensToString(
    tokens: InputMathToken | InputMathToken[],
    emptyArgumentString?: string
): string {
    if (!Array.isArray(tokens)) tokens = [tokens];
    if (tokens.length === 0) return emptyArgumentString || "";
    let string = "";
    for (const token of tokens) {
        let tokenString;
        if (!token.string) {
            tokenString = token.name;
            for (const argument of token.args)
                tokenString += `{${tokensToString(argument, emptyArgumentString)}}`;
            token.string = tokenString;
        } else tokenString = token.string;

        string += tokenString;
    }

    return string;
}

async function copyToClipboard(text: string) {
    const type = "text/plain";
    const clipboardItemData = {
        [type]: text,
    };

    const clipboardItem = new ClipboardItem(clipboardItemData);
    await navigator.clipboard.write([clipboardItem]);
}

/**
 * Data about what a cursor object is pointing to in a string of math.
 */
type Dereference = {
    /**
     * Data about the information that only exists if the cursor is nested somwhere
     */
    parent?: {
        /**
         * The tokens where the token the cursor is in is in.
         */
        tokens: InputMathToken[];

        /**
         * The token the cursor is in.
         */
        token: InputMathToken;

        /**
         * The cursor relative to the parent tokens;
         * has an argument with a cursor with no argument.
         */
        cursor: Cursor;
    };

    /**
     * Data that always exists
     */
    child: {
        /**
         * The exact tokens the cursor is pointing to
         */
        tokens: InputMathToken[];

        /**
         * The cursor relative to the child; has no argument
         */
        cursor: Cursor;
    }
};

/**
 * a class that handles an input with math and its cursors and selection
 */
export class MathInput implements MathInputBase {
    /**
     * the location of the cursor
     */
    private cursor: null | Cursor = null;

    /**
     * the math string
     */
    private string: string = "";

    /**
     * (unsigned) how many tokens are selected
     */
    private cursorSelection: number = 0;

    /**
     * if the cursor selection expands rightward only, 0 if no selection.
     */
    private cursorDirection: number = 0;

    /**
     * the token that will be used as hte cursor
     */
    private cursorToken: InputMathToken = {
        name: "\\cursor ",
        args: []
    };

    /**
     * the token that will be used for the selection
     */
    private cursorSelectionToken: InputMathToken = {
        name: "\\bbox[#870099, 1pt]",
        args: [[]],
        firstEmptyArgument: 0
    };

    /**
     * the token that is used to signify an argument thats empty
     */
    private emptyArgumentString: string = "\\square";

    /**
     * the tokens in the math input
     */
    private mathTokens: InputMathToken[] = [
        // mathToken('\\frac', [
        //     [
        //         mathToken('-'),
        //         mathToken('b'),
        //         mathToken('\\pm '),
        //         mathToken('\\sqrt ', [[
        //             mathToken('b'),
        //             mathToken('^', [[mathToken('2')]]),
        //             mathToken('-'),
        //             mathToken('4'),
        //             mathToken('a'),
        //             mathToken('c'),
        //         ]]),
        //     ], [
        //         mathToken('2'),
        //         mathToken('a'),
        //     ]
        // ]),
        // mathToken('a'),
        // mathToken('b'),
        // mathToken('c'),
        mathToken('\\dint ', [
            [
                mathToken('-'),
                mathToken('\\infty '),
            ],
            [
                mathToken('\\infty ')
            ],
            [
                mathToken('e'),
                mathToken('^', [[
                    mathToken('-'),
                    mathToken('x'),
                    mathToken('^', [[mathToken('2')]]),
                ]]),
            ],
            [
                mathToken('x'),
            ]
        ]),
        // mathToken('\\dd '),
        mathToken('='),
        mathToken('\\sqrt ', [[mathToken('\\pi ')]]),
    ];

    /**
     * where ctrl c stuffs is stored maybe
     */
    private static clipboard: InputMathToken[] = [];

    /**
     * function that you should chagne that is called when the math changes
     */
    public updateMathFunction: (newString: string) => void = () => { };
    
    /**
     * create a math input object (theres lwk nothing to do)
     */
    public constructor() { }

    // #region private methods

    /**
     * deep copies one specific token
     * @param token the token to deepcopy
     * @returns the copied token
     */
    private deepCopyToken(token: InputMathToken): InputMathToken {
        const newArgs: MathToken[][] = [];
        for (const argument of token.args)
            newArgs.push(this.deepCopy(argument));
        const copiedToken: InputMathToken = {
            name: token.name,
            args: newArgs
        };

        if (token.firstEmptyArgument)
            copiedToken.firstEmptyArgument = token.firstEmptyArgument;
        if (token.size)
            copiedToken.size = token.size;
        if (token.string)
            copiedToken.string = token.string;

        return copiedToken;
    }

    /**
     * deepcopies a list of tokens
     * @param tokens the token 
     * @returns the copied mathtoken
     */
    private deepCopy(tokens = this.mathTokens): InputMathToken[] {
        const newMathTokens: InputMathToken[] = [];
        for (const token of tokens)
            newMathTokens.push(this.deepCopyToken(token));

        return newMathTokens;
    }

    /**
     * resets the values of all the tokens but not the tokens of the arguments
     */
    private resetValues(tokens = this.mathTokens): void {
        for (const token of tokens) {
            delete token.size;
            delete token.string;
            delete token.firstEmptyArgument;
        }
    }

    /**
     * reset the values (like size, string) for each token when the values need to be recalculated
     * @param mathTokens the tokens to reset the valeus of
     */
    private resetAllValues(tokens = this.mathTokens): void {
        for (const token of tokens) {
            delete token.size;
            delete token.string;
            delete token.firstEmptyArgument;

            if (!token.args) continue;
            for (const argument of token.args)
                this.resetAllValues(argument);
        }
    }

    /**
     * returns exactly what and where the given cursor is pointing at,
     * with the option to reset the values of the tokens it passes by
     */
    private dereference(cursor: Cursor, resetValues: boolean, tokens = this.mathTokens): Dereference {
        if (resetValues) this.resetValues(tokens);
        if (!cursor.arg) return {
            child: {
                tokens: tokens,
                cursor: cursor
            }
        };
        
        const token = tokens[cursor.index - 1] as InputMathToken;
        const argument = token.args[cursor.arg.index] as InputMathToken[];
        const dereference = this.dereference(cursor.arg.pos, resetValues, argument);
        if (!dereference.parent) dereference.parent = {
            tokens: tokens,
            token: token,
            cursor: cursor
        };

        return dereference;
    }

    /**
     * returns what the cursor is selecting rn
     */
    private getSelection(): InputMathToken[] {
        if (!this.cursor) return [];
        if (!this.cursorSelection) return this.mathTokens;
        const dereference = this.dereference(this.cursor, false);
        const childTokens = dereference.child.tokens;
        const startIndex = dereference.child.cursor.index;
        const endIndex = startIndex + this.cursorSelection;
        return childTokens.slice(startIndex, endIndex);
    }

    /**
     * returns the first empty argument of a mathtoken, if there is none it returns undefined
     * @param mathToken the mathtoken to find the first empty argument of
     * @returns the index of the first empty argument, undefined if none found
     */
    private getFirstEmptyArgument(token: InputMathToken): number | undefined {
        if (token.firstEmptyArgument) return token.firstEmptyArgument;
        for (let i = 0; i < token.args.length; i++) {
            const argument = token.args[i] as InputMathToken[];
            if (argument.length === 0) return i;
        }

        return undefined;
    }

    // #endregion
    // #region implementations

    /**
     * sets the mathTokens to an empty list
     */
    public clear(): void {
        this.mathTokens = [];
        this.cursor = { index: 0 };
        this.cursorSelection = 0;
        this.cursorDirection = 0;
        this.resetValues();
        this.updateMath();
    }

    /**
     * when the user is focused on the div element
     */
    public focus(): void {
        this.cursor = { index: 0 };
        this.updateMath();
    }

    /**
     * when the user unfocuses the div element
     */
    public unfocus(): void {
        this.cursor = null;
        this.cursorSelection = 0;
        this.cursorDirection = 0;
        this.updateMath();
    }

    /**
     * ctrl + a
     */
    public selectAll(): void {
        this.cursor = { index: 0 };
        this.cursorSelection = this.mathTokens.length;
        if (this.cursorDirection === 0) this.cursorDirection = 1;
        this.updateMath();
    }

    /**
     * updates the math if it should
     */
    public updateMath(): void {
        const newString = this.getString();
        if (this.string === newString) return;
        this.string = newString;
        this.updateMathFunction(newString);
    }

    // #endregion
    // #region cursor stuffs

    /**
     * moves the cursor right, and collapses if there is selection.
     * returns true when it wants to escape the argument its in
     */
    public moveCursorRight(): void {
        if (!this.cursor) return;

        const dereference = this.dereference(this.cursor, false);
        const childTokens = dereference.child.tokens;
        const childCursor = dereference.child.cursor;
        if (this.cursorSelection !== 0) { // if theres a selection
            childCursor.index += this.cursorSelection;
            this.cursorSelection = 0;
            this.cursorDirection = 0;
        } else if (childCursor.index === childTokens.length) { // if it wante escape
            if (!dereference.parent) return; // if it can escape
            const parentToken = dereference.parent.token;
            const parentCursor = dereference.parent.cursor;
            if (parentCursor.arg!.index === parentToken.args.length - 1)
                delete parentCursor.arg;
            else {
                parentCursor.arg!.index++;
                parentCursor.arg!.pos = { index: 0 };
            }
        } else { // the default, moves the cursor right one token
            if (childCursor)
            childCursor.index++;
            const token = childTokens[childCursor.index - 1] as InputMathToken;
            if (token.args.length !== 0) childCursor.arg = { index: 0, pos: { index: 0 } };
        }

        this.updateMath();
    }

    /**
     * moves the cursor left, and collapses if there is selection.
     * returns true when it wants to escape the argument its in
     */
    public moveCursorLeft(): void {
        if (!this.cursor) return;

        const dereference = this.dereference(this.cursor, false);
        const childTokens = dereference.child.tokens;
        const childCursor = dereference.child.cursor;
        if (this.cursorSelection !== 0) { // if theres a selection
            this.cursorSelection = 0;
            this.cursorDirection = 0;
        } else if (childCursor.index === 0) { // if cursor beninging
            if (!dereference.parent) return;
            const parentToken = dereference.parent.token;
            const parentCursor = dereference.parent.cursor;
            if (parentCursor.arg!.index === 0) {
                delete parentCursor.arg;
                parentCursor.index--;
            } else {
                parentCursor.arg!.index--;
                const argument = parentToken.args[parentCursor.arg!.index] as InputMathToken[];
                parentCursor.arg!.pos = { index: argument.length };
            }
        } else { // the default, moves the cursor right one token
            const token = childTokens[childCursor.index - 1] as InputMathToken;
            if (token.args.length !== 0) {
                const argumentIndex = token.args.length - 1;
                const argument = token.args[argumentIndex] as InputMathToken[];
                childCursor.arg = { index: argumentIndex, pos: { index: argument.length } };
            } else childCursor.index--;
        }

        this.updateMath();
    }

    /**
     * move the seleciton right/left, expands if necessary
     */
    public selectionRight(): void {
        if (!this.cursor) return;

        const dereference = this.dereference(this.cursor, false);
        const childTokens = dereference.child.tokens;
        const childCursor = dereference.child.cursor;
        switch (this.cursorDirection) {
        case 0: {
            if (!dereference.parent && childCursor.index === childTokens.length)
                return;
            this.cursorDirection = 1;
        }
        case 1: {
            if (childCursor.index + this.cursorSelection === childTokens.length) {
                if (!dereference.parent) return;
                const parentCursor = dereference.parent.cursor;
                parentCursor.index--;
                delete parentCursor.arg;
                this.cursorSelection = 1;
            } else this.cursorSelection++;
        } break;
        case -1: {
            this.cursorSelection--;
            childCursor.index++;
            if (this.cursorSelection === 0) this.cursorDirection = 0;
        } break;
        }

        this.updateMath();
    }

    /**
     * mvoe the selection left/right, expands if necessary
     */
    public selectionLeft(): void {
        if (!this.cursor) return;

        const dereference = this.dereference(this.cursor, false);
        const childCursor = dereference.child.cursor;
        switch (this.cursorDirection) {
        case 0: {
            if (!dereference.parent && childCursor.index === 0)
                return;
            this.cursorDirection = -1;
        }
        case -1: {
            if (childCursor.index === 0) {
                if (!dereference.parent) return;
                const parentCursor = dereference.parent.cursor;
                parentCursor.index--;
                delete parentCursor.arg;
                this.cursorSelection = 1;
            } else {
                this.cursorSelection++;
                childCursor.index--;
            }
        } break;
        case 1: {
            this.cursorSelection--;
            if (this.cursorSelection === 0) this.cursorDirection = 0;
        } break;
        }

        this.updateMath();
    }

    /**
     * i dont event know what to put here anymore all the documentation is at the ienterface
     */
    public forceCursorRight(): void {
        if (!this.cursor) return;
        this.cursorSelection = 0;
        this.cursorDirection = 0;
        this.cursor = { index: this.mathTokens.length };
        delete this.cursor.arg;

        this.updateMath();
    }

    /**
     * do the 67 when you find this commend when hovering over this method
     */
    public forceCursorLeft(): void {
        if (!this.cursor) return;
        this.cursorSelection = 0;
        this.cursorDirection = 0;
        this.cursor = { index: 0 };
        delete this.cursor.arg;

        this.updateMath();
    }
    
    /**
     * what is the point of life anymore
     */
    public forceSelectRight(): void {
        if (!this.cursor) return;
        if (!this.cursor.arg && this.cursor.index === this.mathTokens.length) return;
        this.cursorSelection = this.mathTokens.length - this.cursor.index;
        this.cursorDirection = 1;
        if (this.cursor.arg) {
            this.cursorSelection++;
            this.cursor.index--;
            delete this.cursor.arg;
        }

        this.updateMath();
    }
    
    /**
     * force select left yay
     */
    public forceSelectLeft(): void {
        if (!this.cursor) return;
        if (this.cursor.index === 0) return;
        this.cursorSelection = this.cursor.index;
        this.cursorDirection = -1;
        this.cursor = { index: 0 };

        this.updateMath();
    }

    /**
     * increments argument / escapes token
     * returns "escape" if it found the escape
     */
    public tabCursorRight(): void {
        if (!this.cursor) return;

        const dereference = this.dereference(this.cursor, false);
        const childCursor = dereference.child.cursor;
        const childTokens = dereference.child.tokens;
        if (!dereference.parent)
            childCursor.index = childTokens.length;
        else {
            const parentCursor = dereference.parent.cursor;
            const parentToken = dereference.parent.token;
            if (parentCursor.arg!.index === parentToken.args.length - 1)
                delete parentCursor.arg;
            else {
                parentCursor.arg!.index++;
                parentCursor.arg!.pos = { index: 0 };
            }
        }

        this.updateMath();
    }

    /**
     * decrements argument / escapes token
     * returns "escape" if it found the escape
     */
    public tabCursorLeft(): void {
        if (!this.cursor) return;

        const dereference = this.dereference(this.cursor, false);
        const childCursor = dereference.child.cursor;
        const childTokens = dereference.child.tokens;
        if (!dereference.parent)
            childCursor.index = 0;
        else {
            const parentCursor = dereference.parent.cursor;
            const parentToken = dereference.parent.token;
            if (parentCursor.arg!.index === 0) {
                delete parentCursor.arg;
                parentCursor.index--;
            } else {
                parentCursor.arg!.index--;
                const argumentLength = parentToken.args[parentCursor.arg!.index]!.length;
                parentCursor.arg!.pos = { index: argumentLength };
            }
        }

        this.updateMath();
    }

    // #endregion
    // #region editing stuffs

    /**
     * inserts a token at a place
     * @param newToken the token to insert, if it has a first empty argument and is cursorSelection != 0,
     * then the things selected go in the new token. The default values for these is for the current cursor
     * @param cursor where the tokens get inserted
     * @param tokens what tokens are is newToken being inserted into
     * @returns 
     */
    public insertToken(
        token: MathToken,
        tokens = this.mathTokens,
        updatingCursor: boolean = false
    ): void {
        if (!this.cursor) return;

        const dereference = this.dereference(this.cursor, true, tokens);
        const childTokens = dereference.child.tokens; // no parent because its unused
        const cursor = dereference.child.cursor;

        const firstEmptyArgument = this.getFirstEmptyArgument(token);
        if (this.cursorSelection !== 0 && firstEmptyArgument !== undefined) {
            const newArgument = childTokens.splice(cursor.index, this.cursorSelection);
            token.args[firstEmptyArgument] = newArgument;
            childTokens.splice(cursor.index, 0, token);
        } else
            childTokens.splice(cursor.index, this.cursorSelection, token);
        if (!updatingCursor) {
            this.cursorSelection = 0;
            this.cursorDirection = 0;
            cursor.index++;
            this.updateMath();
        }
    }

    /**
     * like insert tokens but doesnt do the hwole first empty argument thing
     */
    public insertTokens(tokens: InputMathToken[]) {
        if (!this.cursor) return;

        const dereference = this.dereference(this.cursor, true);
        const childTokens = dereference.child.tokens;
        const cursor = dereference.child.cursor;
        childTokens.splice(cursor.index, this.cursorSelection, ...tokens);
        this.cursorSelection = 0;
        this.cursorDirection = 0;
        cursor.index += tokens.length;
        this.updateMath();
    }

    /**
     * delete token
     * @returns void if it already deleted, "flatten" if it wants to flatten a token
     */
    public deleteLeft(): void {
        if (!this.cursor) return;

        const dereference = this.dereference(this.cursor, true);
        const childTokens = dereference.child.tokens;
        const childCursor = dereference.child.cursor;
        const childToken = childTokens[childCursor.index - 1] as InputMathToken;
        if (this.cursorSelection !== 0) { // deletes the selection
            childTokens.splice(childCursor.index, this.cursorSelection);
            this.cursorSelection = 0;
            this.cursorDirection = 0;
        } else if (childCursor.index === 0) { // flattens token
            if (!dereference.parent) return;
            const parentToken = dereference.parent.token;
            const parentTokens = dereference.parent.tokens;
            const parentCursor = dereference.parent.cursor;
            const flattenedToken: InputMathToken[] = [];
            for (const argument of parentToken.args) flattenedToken.push(...argument);
            let newIndex = parentCursor.index - 1;
            for (let i = 0; i < parentCursor.arg!.index; i++)
                newIndex += parentToken.args[i]!.length;
            parentTokens.splice(parentCursor.index - 1, 1, ...flattenedToken);
            parentCursor.index = newIndex;
            delete parentCursor.arg;
        } else if (childToken.args.length !== 0) { // enters token
            const finalArgumentIndex = childToken.args.length - 1;
            const finalArgumentLength = childToken.args[finalArgumentIndex]!.length;
            childCursor.arg = { index: finalArgumentIndex, pos: { index: finalArgumentLength } };
        } else {
            childCursor.index--;
            childTokens.splice(childCursor.index, 1);
        }

        this.updateMath();
    }

    /**
     * delete token with delete key not backspace
     * @returns void if it already deleted, "flatten" if it wants to flatten a token
     */
    public deleteRight(): void {
        if (!this.cursor) return;

        const dereference = this.dereference(this.cursor, true);
        const childTokens = dereference.child.tokens;
        const childCursor = dereference.child.cursor;
        const childToken = childTokens[childCursor.index] as InputMathToken;
        if (this.cursorSelection !== 0) { // deletes the selection
            childTokens.splice(childCursor.index, this.cursorSelection);
            this.cursorSelection = 0;
            this.cursorDirection = 0;
        } else if (childCursor.index === childTokens.length) { // flattens token
            if (!dereference.parent) return;
            const parentToken = dereference.parent.token;
            const parentTokens = dereference.parent.tokens;
            const parentCursor = dereference.parent.cursor;
            const flattenedToken: InputMathToken[] = [];
            for (const argument of parentToken.args) flattenedToken.push(...argument);
            let newIndex = parentCursor.index - 1;
            for (let i = 0; i <= parentCursor.arg!.index; i++)
                newIndex += parentToken.args[i]!.length;
            parentTokens.splice(parentCursor.index - 1, 1, ...flattenedToken);
            parentCursor.index = newIndex;
            delete parentCursor.arg;
        } else if (childToken.args.length !== 0) { // enters token
            childCursor.index++;
            childCursor.arg = { index: 0, pos: { index: 0 } };
        } else {
            childTokens.splice(childCursor.index, 1);
        }

        this.updateMath();
        /*
        if (!cursor.arg) {
            const deletingToken = tokens[cursor.index] as InputMathToken;
            if (deletingToken && deletingToken.args.length !== 0) {
                cursor.index++;
                cursor.arg = { index: 0, pos: { index: 0 } };
                this.updateMath();
                return;
            }
            
            if (cursor.index === tokens.length) return (nested ? "flatten" : undefined);
            tokens.splice(cursor.index, 1);

            this.cursorDirection = 0;
            this.cursorSelection = 0;
            this.updateMath();

            return;
        }

        const cursorToken = tokens[cursor.index - 1] as InputMathToken;
        const argument = cursorToken.args[cursor.arg.index] as InputMathToken[];

        if (cursor.arg.index < 0 || cursor.arg.index >= cursorToken.args.length) return;
        if (this.deleteRight(cursor.arg.pos, argument) === "flatten") {
            const flattenedToken: InputMathToken[] = [];
            for (const argument of cursorToken.args) flattenedToken.push(...argument);
            let newIndex = cursor.index - 1;
            for (let i = 0; i <= cursor.arg.index; i++) {
                newIndex += (cursorToken.args[i] as InputMathToken[]).length;
            }

            tokens.splice(cursor.index - 1, 1, ...flattenedToken);
            delete cursor.arg;
            cursor.index = newIndex;
            this.updateMath();
            // token flattening implies theres no selection so pls work
            // ys i did copy paste ts
        }

        this.resetValues(tokens);
        */
    }

    /**
     * copy tokens :3
     */
    public copy(): void {
        if (!this.cursor) return;
        const tokens = this.cursorSelection ? this.getSelection() : this.mathTokens;
        copyToClipboard(tokensToString(tokens));
        MathInput.clipboard = this.deepCopy(tokens);
    }

    /**
     * deletes the whole thing if yeaa
     */
    public cut(): void {
        this.copy();
        if (this.cursorSelection) this.deleteLeft();
        else this.clear();
    }

    /**
     * ctrl + v the tokens
     */
    public paste(): void {
        this.insertTokens(this.deepCopy(MathInput.clipboard));
    }

    /**
     * returns a (formatted) string to display of the mathTokens or the tokens if provided.
     * this seems so unoptimized but whatever but
     * Also adds cursor and selection tokens
     * @param tokens the tokens to turn into a string, default to mathTokens
     * @returns the string
     */
    public getString(): string {
        if (this.mathTokens.length === 0)
            return `\\[${this.cursor ? tokensToString(this.cursorToken, this.emptyArgumentString) : ''}\\]`;
        if (!this.cursor)
            return `\\[${tokensToString(this.mathTokens, this.emptyArgumentString)}\\]`;
        else if (this.cursorSelection === 0) {
            const tmpTokens = this.deepCopy();
            this.insertToken(this.cursorToken, tmpTokens, true);
            return `\\[${tokensToString(tmpTokens, this.emptyArgumentString)}\\]`;
        } else {
            const tmpTokens = this.deepCopy();
            const selectionToken = this.deepCopyToken(this.cursorSelectionToken);
            this.insertToken(selectionToken, tmpTokens, true);
            const string = tokensToString(tmpTokens, this.emptyArgumentString);
            return `\\[${string}\\]`;
        }
    }

    public getMathTokens(): MathToken[] { return this.mathTokens; }
}