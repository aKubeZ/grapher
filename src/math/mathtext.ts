export type MathToken = {
    name: string;
    args: MathText[];
    brackets?: [string, string];
};

export function isToken(object: any): object is MathToken {
    return (
        "name" in object && typeof object.name === "string"
        && "args" in object && Array.isArray(object.args) && (object.args.length === 0 || object.args[0] instanceof MathText)
    );
}

/**
 * shorthands, like s,q,r,t -> \sqrt
 * mathtext to a mathtext supplier yay
*/
export type Shorthand = { shorthand: MathText, value: () => MathText };

export class MathText {
    private mathText: MathToken[];
    private mathString: string | undefined;
    private mathSize: number | undefined;
    private shorthands: Shorthand[] = [];
    private firstEmptyArgument: number | undefined;
    private static superscriptMathText = new MathText([mathToken('^', [new MathText([])])]);
    private static subscriptMathText = new MathText([mathToken('_', [new MathText([])])]);

    constructor(mathText: MathToken[]) {
        this.mathText = mathText;
    }

    /**
     * returns the math text array
     */
    public getMathTokens() { return this.mathText; }

    /**
     * note that this does not compare brackets
     */
    private equals(other: MathText): boolean {
        if (this.mathText.length !== other.mathText.length) return false;
        for (let i = 0; i < this.mathText.length; i++) {
            const thisToken = this.mathText[i] as MathToken;
            const otherToken = other.mathText[i] as MathToken;
            if (thisToken.name !== otherToken.name) return false;
            if (thisToken.args.length !== otherToken.args.length) return false;
            for (let j = 0; j < thisToken.args.length; j++) {
                const thisArgument = thisToken.args[j] as MathText;
                const otherArgument = otherToken.args[j] as MathText;
                if (!thisArgument.equals(otherArgument)) return false;
            }
        }

        return true;
    }

    private reset(): void {
        this.mathString = undefined;
        this.mathSize = undefined;
        this.firstEmptyArgument = undefined;
        this.setShorthands(this.shorthands);
    }

    public clear(): void {
        this.mathText = [];
        this.reset();
    }

    /**
     * copies the entire thing deeep yayaayayayayaayayayaayay
     */
    public deepCopy(): MathText {
        const newMathText: MathToken[] = [];
        for (const token of this.mathText) {
            const newArgs: MathText[] = [];
            for (const argument of token.args)
                newArgs.push(argument.deepCopy())
            const newToken: MathToken = {
                name: token.name,
                args: newArgs,
            }
            if (token.brackets) newToken['brackets'] = token.brackets;
            newMathText.push(newToken);
        }

        return new MathText(newMathText);
    }

    /**
     * sets the shorthands ofc ofc
     * and also inherits it to the children
     */
    public setShorthands(shorthands: Shorthand[]): void {
        this.shorthands = shorthands;
        for (const token of this.mathText)
            for (const argument of token.args)
                argument.setShorthands(this.shorthands);
    }

    /**
     * returns the number of indicess;
     * like if you were on the very left,
     * it returns how many times you can press the right arrow key
     * until you reach the end
     */
    public getSize(): number {
        if (this.mathSize) return this.mathSize;
        this.mathSize = 1;
        for (const token of this.mathText) {
            this.mathSize += 1;
            for (const argument of token.args)
                this.mathSize += argument.getSize();
        }

        return this.mathSize;
    }

    /**
     * returns the string (like what else vruh)
     */
    public toString(): string {
        if (this.mathString) return this.mathString;
        this.mathString = "";

        for (const token of this.mathText) {
            if (!token.brackets) this.mathString += token.name;
            const argumentOpen = token.brackets ? token.brackets[0] : "{";
            const argumentClose = token.brackets ? token.brackets[1] : "}";
            for (const argument of token.args)
                this.mathString += `${argumentOpen}${argument.toString()}${argumentClose}`;
        }

        return this.mathString;
    }

    /**
     * converts math index -> string index
     */
    public stringIndex(index: number): number {
        if (index === 0) return 0;
        
        let lengthCount = 0;
        let indexCount = 0;

        for (const token of this.mathText) {
            if (!token.brackets) lengthCount += token.name.length;
            indexCount++;

            const argumentOpen = token.brackets ? token.brackets[0].length : 1;
            const argumentClose = token.brackets ? token.brackets[1].length : 1;
            if (token.args.length === 0 && indexCount === index) return lengthCount;

            for (const argument of token.args) {
                lengthCount += argumentOpen;

                if (indexCount + argument.getSize() > index)
                    return lengthCount + argument.stringIndex(index - indexCount);

                indexCount += argument.getSize();
                lengthCount += argument.toString().length;

                lengthCount += argumentClose;
            }
            
            if (indexCount === index) return lengthCount;
        }

        return 0;
    }

    /**
     * backspaces and returns new math index ofc
     */
    public backspace(index: number): number {
        if (index === 0) return 0;
        
        let indexCount = 0;
        for (let i = 0; i < this.mathText.length; i++) {
            const token = this.mathText[i] as MathToken;
            indexCount++;

            if (token.args.length === 0 && indexCount === index) {
                this.mathText.splice(i, 1);
                this.reset();
                return index - 1;
            }

            let argumentStartIndex = indexCount + 0;
            let flatten = false;
            let flattenNewIndex: number | undefined;
            for (let j = 0; j < token.args.length; j++) {
                const argument = token.args[j] as MathText;
                if (index === argumentStartIndex) {
                    flatten = true;
                    flattenNewIndex = index - j - 1;
                    break;
                }

                if (indexCount + argument.getSize() > index) {
                    this.reset();
                    return indexCount + argument.backspace(index - indexCount);
                }

                indexCount += argument.getSize();
                argumentStartIndex += argument.getSize();
            }

            if (flatten) {
                let tokenList: MathToken[] = [];
                for (const argument of token.args)
                    tokenList = tokenList.concat(argument.mathText);
                this.mathText = this.mathText.toSpliced(i, 1, ...tokenList);
                this.reset();
                return flattenNewIndex as number;
            }
            
            if (indexCount === index) {
                return index - 1;
            }
        }

        return 0;
    }

    /**
     * deletes tokens all of them in the range
     */
    public delete(indexStart: number, indexEnd: number): number {
        if (indexStart === indexEnd) return indexStart;
        let indexCount = 0;
        let tokenIndex = 0;

        let indexStarted = (indexStart === 0); // if the indexStart stuffs is already defined
        let indexEnded = false; // if the indexEnd stuffs is already defined
        let indexStartNested = false; // if indexStart is nested
        let indexEndNested = false; // if indexEnd is nested
        let indicesNestedStart = 0; // like the . in a{.b[cde]f}, only if both indices nested in same place
        let indexStartArgumentIndex = 0; // which argument of the token where the start index is
        let IndexEndArgumentIndex = 0; // which argument of the token where the end index is
        let indexStartTokenIndex = 0; // the tokenIndex of where indexStart is (this & below only defined if nested)
        let indexEndTokenIndex = 0; // the tokenIndex of where indexEnd is (this & above to check if indices nested in the same place)

        mainLoop:
        for (tokenIndex = 0; tokenIndex < this.mathText.length; tokenIndex++) {
            const token = this.mathText[tokenIndex] as MathToken;
            indexCount++;

            if (token.args.length === 0 && indexCount === indexStart) {
                indexStarted = true;
                indexStartTokenIndex = tokenIndex + 1;
            }
        
            if (token.args.length === 0 && indexCount === indexEnd) {
                indexEndTokenIndex = tokenIndex + 1;
                break mainLoop;
            }

            for (let j = 0; j < token.args.length; j++) {
                const argument = token.args[j] as MathText;

                if (!indexStarted && indexCount + argument.getSize() > indexStart) {
                    indexStartTokenIndex = tokenIndex;
                    indexStartArgumentIndex = j;
                    indicesNestedStart = indexCount;
                    indexStartNested = true;
                    indexStarted = true;
                }
                
                if (!indexEnded && indexCount + argument.getSize() > indexEnd) {
                    indexEndTokenIndex = tokenIndex;
                    IndexEndArgumentIndex = j;
                    indexEndNested = true;
                    indexEnded = true;
                }

                indexCount += argument.getSize();
            }

            if (indexEndNested) {
                break mainLoop;
            }

            if (indexCount === indexStart) {
                indexStarted = true;
                indexStartTokenIndex = tokenIndex + 1;
            }

            if (indexCount === indexEnd) {
                indexEndTokenIndex = tokenIndex + 1;
                break mainLoop;
            }
        }

        if (indexStartNested && indexEndNested && indexStartTokenIndex === indexEndTokenIndex && indexStartArgumentIndex === IndexEndArgumentIndex) {
            const token = this.mathText[indexStartTokenIndex] as MathToken;
            const argument = token.args[indexStartArgumentIndex] as MathText;
            this.reset();
            return indicesNestedStart + argument.delete(
                indexStart - indicesNestedStart,
                indexEnd - indicesNestedStart
            );
        }

        this.reset();
        this.mathText = this.mathText.toSpliced(indexStartTokenIndex, indexEndTokenIndex - indexStartTokenIndex);
        return indexStart;
    }

    /**
     * returns the index of this first empty argument,
     * returns size if none
     */
    public getFirstEmptyArgument(): number {
        if (this.firstEmptyArgument) return this.firstEmptyArgument;

        this.firstEmptyArgument = 1;
        for (const token of this.mathText) {
            this.firstEmptyArgument++;
            for (const argument of token.args) {
                if (argument.mathText.length === 0) return this.firstEmptyArgument;
                this.firstEmptyArgument += argument.getSize();
            }
        }

        this.mathSize = this.firstEmptyArgument;
        return this.firstEmptyArgument;
    }

    /**
     * sets the first empty argument ofc ofc
     * if no first empty argument it just does nothing
     */
    public setFirstEmptyArgument(argumentMathText: MathText): void {
        for (const token of this.mathText) {
            for (const argument of token.args) {
                if (argument.mathText.length === 0) {
                    argument.mathText = argumentMathText.mathText;
                    this.reset();
                    return;
                }
            }
        }
    }

    /**
     * converts like s,q,r,t -> sqrt
     * note that this inputs the newIndex
     * and returns the newindex lmaooo
     * also fills mempty arguments provavly
     */
    public convertShorthands(index: number, toArgs: boolean, argumentFill: MathText = new MathText([])): number {
        if (index === 0) return index;
        
        let indexCount = 0;
        let tokenIndex = 0;
        for (let i = 0; i < this.mathText.length; i++) {
            const token = this.mathText[i] as MathToken;
            indexCount++;

            if (token.args.length === 0 && indexCount === index) {
                tokenIndex = i;
                break;
            }

            for (let j = 0; j < token.args.length; j++) {
                const argument = token.args[j] as MathText;

                if (indexCount + argument.getSize() > index) {
                    this.reset();
                    return indexCount + argument.convertShorthands(index - indexCount, toArgs, argumentFill);
                }

                indexCount += argument.getSize();
            }

            if (indexCount === index) {
                tokenIndex = i;
                break;
            }
        }

        // if (tokenIndex === 0) return index;
        tokenIndex++;

        for (let i = 0; i < this.shorthands.length; i++) {
            const shorthand = this.shorthands[i]?.shorthand as MathText;
            const startIndex = tokenIndex - shorthand.mathText.length;
            const value = this.shorthands[i]?.value() as MathText;
            if (startIndex < 0) continue;
            const potentialShorthand = new MathText(this.mathText.slice(startIndex, tokenIndex));
            if (potentialShorthand.equals(shorthand)) {
                if (
                    startIndex !== 0
                    && value.equals(MathText.superscriptMathText)
                    && potentialShorthand.mathText.length === 1
                    && this.mathText[startIndex - 1]?.name === '^'
                ) {
                    this.mathText = this.mathText.toSpliced(startIndex, 1);
                    return index - 2;
                } // check exponentns and allat

                if (
                    startIndex !== this.mathText.length - 1
                    && value.equals(MathText.superscriptMathText)
                    && potentialShorthand.mathText.length === 1
                    && this.mathText[startIndex + 1]?.name === '^'
                ) {
                    this.mathText = this.mathText.toSpliced(startIndex, 1);
                    return index;
                }
                if (
                    startIndex !== 0
                    && value.equals(MathText.subscriptMathText)
                    && potentialShorthand.mathText.length === 1
                    && this.mathText[startIndex - 1]?.name === '_'
                ) {
                    this.mathText = this.mathText.toSpliced(startIndex, 1);
                    return index - 2;
                } // check exponentns and allat

                if (
                    startIndex !== this.mathText.length - 1
                    && value.equals(MathText.subscriptMathText)
                    && potentialShorthand.mathText.length === 1
                    && this.mathText[startIndex + 1]?.name === '_'
                ) {
                    this.mathText = this.mathText.toSpliced(startIndex, 1);
                    return index;
                }

                this.mathText = this.mathText.toSpliced(startIndex, shorthand.mathText.length, ...value.mathText);
                this.reset();
                value.setFirstEmptyArgument(argumentFill);
                if (toArgs) return index - shorthand.getSize() + value.getFirstEmptyArgument();
                else return index - shorthand.getSize() + value.getSize();
            }
        }

        return index;
    }

    /**
     * inserts token and returns new math index ofc
     */
    public insertToken(index: number, insertToken: MathText | MathToken | string, toArgs=true, shorthand=true): number {
        if (typeof insertToken === "string")
            insertToken = new MathText([mathToken(insertToken)]);
        if (isToken(insertToken))
            insertToken = new MathText([insertToken]);
        const insertTokens = insertToken as MathText;
        
        if (
            index === 0 &&
            insertTokens.getMathTokens().length === 1 &&
            (
                insertTokens.getMathTokens()[0]?.name === "^" ||
                insertTokens.getMathTokens()[0]?.name === "_"
            )
        ) return 0;

        const indexDifference = toArgs ? 1 : insertTokens.getSize() - 1;

        if (index === 0) {
            this.mathText = this.mathText.toSpliced(0, 0, ...insertTokens.mathText);
            if (shorthand) this.convertShorthands(indexDifference, true);
            this.reset();
            return indexDifference;
        }
        
        let indexCount = 0;
        for (let i = 0; i < this.mathText.length; i++) {
            const token = this.mathText[i] as MathToken;
            indexCount++;

            if (token.args.length === 0 && indexCount === index) {
                this.mathText = this.mathText.toSpliced(i + 1, 0, ...insertTokens.mathText);
                this.reset();
                if (shorthand) return this.convertShorthands(index + indexDifference, true);
                return index + indexDifference;
            }

            let argumentStartIndex = indexCount + 0;
            for (let j = 0; j < token.args.length; j++) {
                const argument = token.args[j] as MathText;

                if (indexCount + argument.getSize() > index) {
                    this.reset();
                    return indexCount + argument.insertToken(index - indexCount, insertToken, toArgs);
                }

                indexCount += argument.getSize();
                argumentStartIndex += argument.getSize();
            }

            if (indexCount === index) {
                this.mathText = this.mathText.toSpliced(i + 1, 0, ...insertTokens.mathText);
                this.reset();
                if (shorthand) return this.convertShorthands(index + indexDifference, true);
                return index + indexDifference;
            }
        }

        return 0;
    }

    /**
     * replaces the token at the indices, if like they arent expnaded youre cooked ok
     * IM TOO LAZY TO MAKE THIS
     */
    public replaceInsertToken(indexStart: number, indexEnd: number, insertToken: MathText | MathToken | string, toArgs=true, shorthand=true): number {
        if (indexStart === indexEnd) return this.insertToken(indexStart, insertToken, toArgs, shorthand);
        if (typeof insertToken === "string")
            insertToken = new MathText([mathToken(insertToken)]);
        if (isToken(insertToken))
            insertToken = new MathText([insertToken]);

        
        const insertTokens = insertToken as MathText;

        let indexCount = 0;
        let tokenIndex = 0;

        let indexStarted = (indexStart === 0); // if the indexStart stuffs is already defined
        let indexEnded = false; // if the indexEnd stuffs is already defined
        let indexStartNested = false; // if indexStart is nested
        let indexEndNested = false; // if indexEnd is nested
        let indicesNestedStart = 0; // like the . in a{.b[cde]f}, only if both indices nested in same place
        let indexStartArgumentIndex = 0; // which argument of the token where the start index is
        let IndexEndArgumentIndex = 0; // which argument of the token where the end index is
        let indexStartTokenIndex = 0; // the tokenIndex of where indexStart is (this & below only defined if nested)
        let indexEndTokenIndex = 0; // the tokenIndex of where indexEnd is (this & above to check if indices nested in the same place)

        mainLoop:
        for (tokenIndex = 0; tokenIndex < this.mathText.length; tokenIndex++) {
            const token = this.mathText[tokenIndex] as MathToken;
            indexCount++;

            if (token.args.length === 0 && indexCount === indexStart) {
                indexStarted = true;
                indexStartTokenIndex = tokenIndex + 1;
            }
        
            if (token.args.length === 0 && indexCount === indexEnd) {
                indexEndTokenIndex = tokenIndex + 1;
                break mainLoop;
            }

            for (let j = 0; j < token.args.length; j++) {
                const argument = token.args[j] as MathText;

                if (!indexStarted && indexCount + argument.getSize() > indexStart) {
                    indexStartTokenIndex = tokenIndex;
                    indexStartArgumentIndex = j;
                    indicesNestedStart = indexCount;
                    indexStartNested = true;
                    indexStarted = true;
                }
                
                if (!indexEnded && indexCount + argument.getSize() > indexEnd) {
                    indexEndTokenIndex = tokenIndex;
                    IndexEndArgumentIndex = j;
                    indexEndNested = true;
                    indexEnded = true;
                }

                indexCount += argument.getSize();
            }

            if (indexEndNested) {
                break mainLoop;
            }

            if (indexCount === indexStart) {
                indexStarted = true;
                indexStartTokenIndex = tokenIndex + 1;
            }

            if (indexCount === indexEnd) {
                indexEndTokenIndex = tokenIndex + 1;
                break mainLoop;
            }
        }

        if (indexStartNested && indexEndNested && indexStartTokenIndex === indexEndTokenIndex && indexStartArgumentIndex === IndexEndArgumentIndex) {
            const token = this.mathText[indexStartTokenIndex] as MathToken;
            const argument = token.args[indexStartArgumentIndex] as MathText;
            this.reset();
            return indicesNestedStart + argument.replaceInsertToken(
                indexStart - indicesNestedStart,
                indexEnd - indicesNestedStart,
                insertToken, toArgs, shorthand
            );
        }

        const replacedText = new MathText(this.mathText.slice(indexStartTokenIndex, indexEndTokenIndex));
        const newIndex = indexStart + insertTokens.getSize() - 1;
        this.reset();
        this.mathText = this.mathText.toSpliced(indexStartTokenIndex, indexEndTokenIndex - indexStartTokenIndex, ...insertTokens.mathText);
        return this.convertShorthands(newIndex, toArgs ? true : false, replacedText);
    }

    /**
     * returns where the cursor index goes when you rpess the tab or shift tab key,
     * tabTo = "pre" if shift+tab, tabTo = "post" if only tab
     * dont' worry about the other two nmbers
     */
    public tabIndex(index: number, tabTo: "pre" | "post", escapeIndex?: number, indexOffset: number = 0): number {
        if (!escapeIndex) escapeIndex = (tabTo === "pre") ? 0 : this.getSize() - 1;
        if (index === 0) return indexOffset + escapeIndex;
        
        let indexCount = 0;
        for (let i = 0; i < this.mathText.length; i++) {
            const token = this.mathText[i] as MathToken;
            indexCount++;

            if (token.args.length === 0 && indexCount === index) {
                break;
            }

            let argumentSizeCount = 0;
            for (let j = 0; j < token.args.length; j++) {
                const argument = token.args[j] as MathText;

                if (indexCount + argument.getSize() > index) {
                    return argument.tabIndex(
                        index - indexCount, tabTo,
                        (tabTo === "pre")
                            ? -1
                            : argument.getSize(),
                        indexOffset + indexCount
                    );
                }

                indexCount += argument.getSize();
                argumentSizeCount += argument.getSize();
            }

            if (indexCount === index) {
                break;
            }
        }

        return indexOffset + escapeIndex;
    }

    /**
     * returns the absolute last index of the end of the text thing
     * implemented using tabIndex bc i aint like ognna encapsluation it
     */
    public getTextEnd(index: number, textEndType: "pre" | "post"): number {
        return Math.max(0, Math.min(this.getSize() - 1, this.tabIndex(index, textEndType) + ((textEndType === "pre") ? 1 : -1)));
    }

    /**
     * expands selection, like so
     * (a[bc)] => [(abc)]
     */

    public expandSelection(indexStart: number, indexEnd: number): [number, number] {
        if (indexStart === indexEnd) return [indexStart, indexEnd];
        
        let indexCount = 0;
        let tokenIndex = 0;

        let indexStarted = (indexStart === 0); // if the indexStart stuffs is already defined
        let indexEnded = false; // if the indexEnd stuffs is already defined
        let indexStartNested = false; // if indexStart is nested
        let indexEndNested = false; // if indexEnd is nested
        let indicesNestedStart = 0; // like the . in a{.b[cde]f}, only if both indices nested in same place
        let indexStartArgumentIndex = 0; // which argument of the token where the start index is
        let IndexEndArgumentIndex = 0; // which argument of the token where the end index is
        let indexStartTokenIndex = 0; // the tokenIndex of where indexStart is (this & below only defined if nested)
        let indexEndTokenIndex = 0; // the tokenIndex of where indexEnd is (this & above to check if indices nested in the same place)
        let newIndexStart = 0; // what it returns IFF indexStart & indexEnd aren't nested in the same palce
        let newIndexEnd = 0; // what it returns IFF indexStart & indexEnd aren't nested in the same palce

        mainLoop:
        for (tokenIndex = 0; tokenIndex < this.mathText.length; tokenIndex++) {
            const token = this.mathText[tokenIndex] as MathToken;
            indexCount++;

            if (token.args.length === 0 && indexCount === indexStart) {
                indexStarted = true;
                newIndexStart = indexStart;
            }
        
            if (token.args.length === 0 && indexCount === indexEnd) {
                newIndexEnd = indexEnd;
                break mainLoop;
            }

            const tokenStartIndex = indexCount;
            for (let j = 0; j < token.args.length; j++) {
                const argument = token.args[j] as MathText;

                if (!indexStarted && indexCount + argument.getSize() > indexStart) {
                    indexStartTokenIndex = tokenIndex;
                    indexStartArgumentIndex = j;
                    indicesNestedStart = indexCount;
                    newIndexStart = tokenStartIndex - 1;
                    indexStartNested = true;
                    indexStarted = true;
                }
                
                if (!indexEnded && indexCount + argument.getSize() > indexEnd) {
                    indexEndTokenIndex = tokenIndex;
                    IndexEndArgumentIndex = j;
                    indexEndNested = true;
                    indexEnded = true;
                }

                indexCount += argument.getSize();
            }

            if (indexEndNested) {
                newIndexEnd = indexCount;
                break mainLoop;
            }

            if (indexCount === indexStart) {
                indexStarted = true;
                newIndexStart = indexStart;
            }

            if (indexCount === indexEnd) {
                newIndexEnd = indexEnd;
                break mainLoop;
            }
        }

        if (indexStartNested && indexEndNested && indexStartTokenIndex === indexEndTokenIndex && indexStartArgumentIndex === IndexEndArgumentIndex) {
            const token = this.mathText[indexStartTokenIndex] as MathToken;
            const argument = token.args[indexStartArgumentIndex] as MathText;
            const relativeIndices = argument.expandSelection(indexStart - indicesNestedStart, indexEnd - indicesNestedStart);
            return [indicesNestedStart + relativeIndices[0], indicesNestedStart + relativeIndices[1]];
        }

        return [newIndexStart, newIndexEnd];
    }
}

/**
 * just makes a token for the sake of convenience
 */
export function mathToken(name: string, args: MathText[] = []): MathToken {
    return {
        name: name,
        args: args,
    };
}

/**
 * makes mathtokens per char
 */
export function mathTokens(string: string): MathToken[] {
    const tokens: MathToken[] = [];
    for (const char of string.split("")) {
        const mathToken: MathToken = {
            name: char,
            args: [],
        };

        tokens.push(mathToken);
    }

    return tokens;
}

/**
 * make shorthand
 */
export function shorthand(tokens: MathToken[], output: MathToken | MathToken[]): Shorthand {
    output = (isToken(output)) ? [output] : output;
    return {
        shorthand: new MathText(tokens),
        value: () => new MathText(output as MathToken[]).deepCopy()
    }
}

/**
 * like mathToken, makes brackets for the sake of convenience
 * note that it auto inserts '\left' and '\right' soooo
 * wait i just realized this is redundant bc we can just make custom commands that makes brackets for us oh well im too tired for ts
 */
export function mathBrackets(open: string, close: string, argument: MathText) {
    const brackets: [string, string] = [`\\!\\left${open}`, `\\right${close}`,];
    return {
        name: `${open} ${close}`,
        args: [argument],
        brackets: brackets,
    };
}