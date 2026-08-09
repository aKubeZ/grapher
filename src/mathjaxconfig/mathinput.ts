import * as mathjax from "./mathjax.js";

type MathToken = {
    name: string;
    args: MathText[];
    brackets?: [string, string];
};

function isToken(object: any) {
    return (
        "name" in object && typeof object.name === "string"
        && "args" in object && Array.isArray(object.args) && (object.args.length === 0 || object.args[0] instanceof MathText)
    );
}

type MathTextData = MathToken[];

/**
 * shorthands, like s,q,r,t -> \sqrt
 * mathtext to a mathtext supplier yay
 */
type Shorthand = { shorthand: MathText, value: () => MathText };

class MathText {
    private mathText: MathTextData;
    private mathString: string | undefined;
    private mathSize: number | undefined;
    private shorthands: Shorthand[] = [];
    private firstEmptyArgument: number | undefined;
    private static superscriptMathText = new MathText([mathToken('^', [new MathText([])])]);

    constructor(mathText: MathTextData) {
        this.mathText = mathText;
    }

    /**
     * note that this does not compare brackets
     */
    private equals(other: MathText): boolean {
        if (this.mathText.length !== other.mathText.length) return false;
        for (let i = 0; i < this.mathText.length; i++) {
            const thisToken = <MathToken> this.mathText[i];
            const otherToken = <MathToken> other.mathText[i];
            if (thisToken.name !== otherToken.name) return false;
            if (thisToken.args.length !== otherToken.args.length) return false;
            for (let j = 0; j < thisToken.args.length; j++) {
                const thisArgument = <MathText> thisToken.args[j];
                const otherArgument = <MathText> otherToken.args[j];
                if (!thisArgument.equals(otherArgument)) return false;
            }
        }

        return true;
    }

    private reset(): void {
        this.mathString = undefined;
        this.mathSize = undefined;
        this.setShorthands(this.shorthands);
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
            const token = <MathToken> this.mathText[i];
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
                const argument = <MathText> token.args[j];
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
                return <number> flattenNewIndex;
            }
            
            if (indexCount === index) {
                return index - 1;
            }
        }

        return 0;
    }

    /**
     * returns the index of this first empty argument,
     * returns size if none
     */
    public getFirstEmptyArgument(): number {
        if (this.firstEmptyArgument) return this.firstEmptyArgument;

        this.firstEmptyArgument = 1;
        for (const token of this.mathText) {
            this.firstEmptyArgument += 1;
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
     */
    public setFirstEmptyArgument(argumentMathText: MathText): void {
        for (const token of this.mathText) {
            for (const argument of token.args) {
                if (argument.mathText.length === 0) {
                    argument.mathText = argumentMathText.mathText;
                    this.reset();
                }
            }
        }
    }

    /**
     * converts like s,q,r,t -> sqrt
     * note that this inputs the newIndex
     */
    public convertShorthands(index: number, toArgs: boolean): number {
        if (index === 0) return index;
        
        let indexCount = 0;
        let tokenIndex = 0;
        for (let i = 0; i < this.mathText.length; i++) {
            const token = <MathToken> this.mathText[i];
            indexCount++;

            if (token.args.length === 0 && indexCount === index) {
                tokenIndex = i;
                break;
            }

            for (let j = 0; j < token.args.length; j++) {
                const argument = <MathText> token.args[j];

                if (indexCount + argument.getSize() > index) {
                    this.reset();
                    return indexCount + argument.convertShorthands(index - indexCount, toArgs);
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
            const shorthand = <MathText> this.shorthands[i]?.shorthand;
            const startIndex = tokenIndex - shorthand.mathText.length;
            const value = <MathText> this.shorthands[i]?.value();
            // console.log(startIndex, shorthand.toString(), value.toString());
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

                this.mathText = this.mathText.toSpliced(startIndex, shorthand.mathText.length, ...value.mathText);
                this.reset();
                if (toArgs) return index - shorthand.getSize() + value.getFirstEmptyArgument();
                else return index - shorthand.getSize() + value.getSize();
            }
        }

        return index;
    }

    /**
     * inserts token and returns new math index ofc
     */
    public insertToken(index: number, insertToken: MathText | MathToken | string, toArgs?: boolean, shorthand=true): number {
        if (typeof insertToken === "string")
            insertToken = new MathText([mathToken(insertToken)]);
        if (isToken(insertToken))
            insertToken = new MathText([<MathToken> insertToken]);
        const insertTokens = <MathText> insertToken;
        
        if (insertTokens.equals(new MathText([mathToken('^')])) && index === 0) return index;

        const indexDifference = toArgs ? 1 : insertTokens.getSize() - 1;

        if (index === 0) {
            this.mathText = this.mathText.toSpliced(0, 0, ...insertTokens.mathText);
            if (shorthand) this.convertShorthands(indexDifference, true);
            this.reset();
            return indexDifference;
        }
        
        let indexCount = 0;
        for (let i = 0; i < this.mathText.length; i++) {
            const token = <MathToken> this.mathText[i];
            indexCount++;

            if (token.args.length === 0 && indexCount === index) {
                this.mathText = this.mathText.toSpliced(i + 1, 0, ...insertTokens.mathText);
                this.reset();
                if (shorthand) return this.convertShorthands(index + indexDifference, true);
                return index + indexDifference;
            }

            let argumentStartIndex = indexCount + 0;
            for (let j = 0; j < token.args.length; j++) {
                const argument = <MathText> token.args[j];

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
     */
    public replaceInsertToken(indexStart: number, indexEnd: number, insertToken: MathText | MathToken | string, toArgs?: boolean, shorthand=true): number {
        if (indexStart === indexEnd) return this.insertToken(indexStart, insertToken, toArgs, shorthand);
        if (typeof insertToken === "string")
            insertToken = new MathText([mathToken(insertToken)]);
        if (isToken(insertToken))
            insertToken = new MathText([<MathToken> insertToken]);
        const insertTokens = <MathText> insertToken;

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
            const token = <MathToken> this.mathText[tokenIndex];
            indexCount++;

            if (token.args.length === 0 && indexCount === indexStart) {
                indexStarted = true;
            }
        
            if (token.args.length === 0 && indexCount === indexEnd) {
                break mainLoop;
            }

            for (let j = 0; j < token.args.length; j++) {
                const argument = <MathText> token.args[j];

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
            }

            if (indexCount === indexEnd) {
                break mainLoop;
            }
        }

        if (indexStartNested && indexEndNested && indexStartTokenIndex === indexEndTokenIndex && indexStartArgumentIndex === IndexEndArgumentIndex) {
            const token = <MathToken> this.mathText[indexStartTokenIndex];
            const argument = <MathText> token.args[indexStartArgumentIndex];
            this.reset();
            return indicesNestedStart + argument.replaceInsertToken(
                indexStart - indicesNestedStart,
                indexEnd - indicesNestedStart,
                insertToken, toArgs, shorthand
            );
        }

        const replacedText = this.mathText.slice(indexStartTokenIndex, indexEndTokenIndex);
        this.mathText = this.mathText.toSpliced(indexStartTokenIndex, indexEndTokenIndex - indexStartTokenIndex, ...insertTokens.mathText);
        return 0;
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
            const token = <MathToken> this.mathText[i];
            indexCount++;

            if (token.args.length === 0 && indexCount === index) {
                break;
            }

            let argumentSizeCount = 0;
            for (let j = 0; j < token.args.length; j++) {
                const argument = <MathText> token.args[j];

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
            const token = <MathToken> this.mathText[tokenIndex];
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
                const argument = <MathText> token.args[j];

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
            const token = <MathToken> this.mathText[indexStartTokenIndex];
            const argument = <MathText> token.args[indexStartArgumentIndex];
            const relativeIndices = argument.expandSelection(indexStart - indicesNestedStart, indexEnd - indicesNestedStart);
            return [indicesNestedStart + relativeIndices[0], indicesNestedStart + relativeIndices[1]];
        }

        return [newIndexStart, newIndexEnd];
    }
}

/**
 * just makes a token for the sake of convenience
 */
function mathToken(name: string, args: MathText[] = []): MathToken {
    return {
        name: name,
        args: args,
    };
}

function shorthand(tokens: MathToken[], output: MathToken | MathToken[]): Shorthand {
    output = (isToken(output)) ? [<MathToken> output] : <MathToken[]> output;
    return {
        shorthand: new MathText(tokens),
        value: () => new MathText(output).deepCopy()
    }
}

/**
 * like mathToken, makes brackets for the sake of convenience
 * note that it auto inserts '\left' and '\right' soooo
 */
function mathBrackets(open: string, close: string, argument: MathText) {
    const brackets: [string, string] = [`\\!\\left${open}`, `\\right${close}\\!`,];
    return {
        name: `${open} ${close}`,
        args: [argument],
        brackets: brackets,
    };
}

export class MathInput {
    public static defaultShorthands: Shorthand[] = [
        shorthand([
            mathToken('s'),
            mathToken('q'),
            mathToken('r'),
            mathToken('t'),
        ], mathToken('\\sqrt ', [new MathText([])])),
        shorthand([mathToken('/')],
            mathToken('\\frac ', [new MathText([]), new MathText([])])
        ), shorthand([mathToken('^')], mathToken('^', [new MathText([])])),
        shorthand([mathToken('\\_ ')], mathToken('_', [new MathText([])])),
        shorthand([
            mathToken('o'),
            mathToken('o'),
            mathToken('o'),
        ], mathToken('\\infty ')),
        shorthand([
            mathToken('i'),
            mathToken('n'),
            mathToken('t'),
        ], mathToken('\\int '))
    ];

    public static mathInput(element: HTMLElement): void {
        MathInput.mathInputs.push(new MathInput(element));
    }

    private static mathInputs: MathInput[] = [];

    private math: MathText = new MathText([
        mathToken('\\frac', [new MathText([
            mathToken('-'),
            mathToken('b'),
            mathToken('\\pm '),
            mathToken('\\sqrt ', [new MathText([
                mathToken('b'),
                mathToken('^', [new MathText([
                    mathToken('2')
                ])]),
                mathToken('-'),
                mathToken('4'),
                mathToken('a'),
                mathToken('c'),
            ])]),
        ]), new MathText([
            mathToken('2'),
            mathToken('a'),
        ])]),
    ]);
    
    private element: HTMLElement;
    private cursorIndex: number = 0;
    private cursorRange: number = 0;
    private cursorDirection: number = 0;
    private renderingLatex: string = "";

    public constructor(element: HTMLElement) {
        this.math.setShorthands(MathInput.defaultShorthands);
        this.element = element;
        this.initElement();
        this.updateString(true);
    }

    private initElement(): void {
        this.element.contentEditable = "plaintext-only";
        this.element.spellcheck = false;
        this.element.addEventListener("keydown", (event) => {
            event.preventDefault();
            switch (event.key) {
                case "ArrowLeft": {
                    if (event.shiftKey) {
                        if (this.cursorIndex === 0) break;
                        let newSelection: [number, number];
                        if (this.cursorDirection === 1) {
                            this.cursorRange--;
                            if (this.cursorRange === 0) this.collapseCursor();
                            newSelection = this.math.expandSelection(this.cursorIndex, this.cursorIndex + this.cursorRange);
                        } else {
                            this.cursorDirection = -1;
                            this.cursorRange++;
                            this.cursorIndex--;
                            newSelection = this.math.expandSelection(this.cursorIndex, this.cursorIndex + this.cursorRange);
                        }

                        this.cursorIndex = newSelection[0];
                        this.cursorRange = newSelection[1] - newSelection[0];
                    } else if (this.cursorDirection) {
                        this.collapseCursor();
                    } else {
                        if (this.cursorIndex === 0) break;
                        this.cursorIndex--;
                    }
                    
                    this.updateString();
                } break;
                case "ArrowRight": {
                    if (event.shiftKey) {
                        if (this.cursorIndex + this.cursorRange === this.math.getSize() - 1) break;
                        let newSelection: [number, number];
                        if (this.cursorDirection === -1) {
                            this.cursorRange--;
                            this.cursorIndex++;
                            if (this.cursorRange === 0) this.collapseCursor();
                            newSelection = this.math.expandSelection(this.cursorIndex, this.cursorIndex + this.cursorRange);
                        } else {
                            this.cursorRange++;
                            this.cursorDirection = 1;
                            newSelection = this.math.expandSelection(this.cursorIndex, this.cursorIndex + this.cursorRange);
                        }

                        this.cursorIndex = newSelection[0];
                        this.cursorRange = newSelection[1] - newSelection[0];
                    } else if (this.cursorDirection) {
                        this.cursorIndex = this.cursorIndex + this.cursorRange;
                        this.collapseCursor();
                    } else {
                        if (this.cursorIndex + this.cursorRange === this.math.getSize() - 1) break;
                        this.cursorIndex++;
                    }
                    
                    this.updateString();
                } break;
                case "Backspace": {
                    if (event.ctrlKey) {
                        this.cursorIndex = 0;
                        this.math = new MathText([]);
                    } else this.cursorIndex = this.math.backspace(this.cursorIndex);
                    this.updateString();
                } break;
                case "Delete": {
                    if (this.cursorIndex === this.math.getSize() - 1) break;
                    this.cursorIndex = this.math.backspace(this.cursorIndex + 1);
                    this.updateString();
                } break;
                case "Tab": {
                    if (event.shiftKey)
                        this.cursorIndex = this.math.tabIndex(this.cursorIndex, "pre");
                    else
                        this.cursorIndex = this.math.tabIndex(this.cursorIndex, "post");
                    this.updateString();
                } break;
                case "Space":
                case " ": {
                    this.cursorIndex = this.math.insertToken(this.cursorIndex, "\\ ");
                    this.updateString();
                } break;
                default: {
                    if (event.key.length === 1) {
                        if (event.key === "*") {
                            this.cursorIndex = this.math.insertToken(this.cursorIndex, "\\cdot ");
                            this.updateString();
                            return;
                        } else if (event.key === "\\") {
                            this.cursorIndex = this.math.insertToken(this.cursorIndex, `\\backslash `);
                            this.updateString();
                            return;
                        } else if (event.key === "_" || event.key === "&" || event.key === "#" || event.key === "%" || event.key === " ") {
                            this.cursorIndex = this.math.insertToken(this.cursorIndex, `\\${event.key} `);
                            this.updateString();
                            return;
                        } else if (event.key === "(") {
                            this.cursorIndex = this.math.insertToken(this.cursorIndex, mathBrackets('(', ')', new MathText([])), true);
                            this.updateString();
                            return;
                        } else if (event.key === ")") {
                            if (this.cursorIndex === this.math.getSize() - 1) return;
                            this.cursorIndex++;
                            this.updateString();
                            return;
                        } else if (event.key === "|") {
                            this.cursorIndex = this.math.insertToken(this.cursorIndex, mathBrackets('\\lvert ', '\\rvert ', new MathText([])), true);
                            this.updateString();
                            return;
                        }

                        const charCode = event.key.charCodeAt(0);
                        if (33 <= charCode && charCode <= 127) {
                            this.cursorIndex = this.math.insertToken(this.cursorIndex, `${event.key}`);
                            this.updateString();
                        }
                    }
                }
            }
        });

        this.element.addEventListener("focus", (event) => {
            event.preventDefault();
            this.cursorIndex = 0;
            this.cursorRange = 0;
            this.updateString();
        });

        this.element.addEventListener("focusout", (event) => {
            this.updateString(true);
        });

        this.updateString();
    }

    private collapseCursor(): void {
        this.cursorRange = 0;
        this.cursorDirection = 0;
    }

    // updates string AND cursor pos
    public updateString(unfocus?: boolean): void {
        // const cursorPos = 0;
        const cursorPos = this.math.stringIndex(this.cursorIndex);


        let mathString = this.math.toString();
        if (!unfocus) {
            if (this.cursorRange === 0)
                mathString = mathString.slice(0, cursorPos) + "\\mkern -1mu \\raise{0.1ex}{\\vert} \\mkern -1mu" + mathString.slice(cursorPos);
            else {
                const cursorEndPos = this.math.stringIndex(this.cursorIndex + this.cursorRange);
                // mathString = mathString.slice(0, cursorPos) + String.raw`\bbox[blue, 1pt]{` + mathString.slice(cursorPos, cursorEndPos) + '}' + mathString.slice(cursorEndPos);
                mathString = mathString.slice(0, cursorPos) + String.raw`[` + mathString.slice(cursorPos, cursorEndPos) + ']' + mathString.slice(cursorEndPos);
            }
        }

        // mathString = String.raw`six\bbox[blue, 1pt]{seven}`;
        mathString = `\\[${mathString}\\]`;

        if (mathString !== this.renderingLatex) {
            this.renderingLatex = mathString;
            this.element.textContent = mathString;
        }
        
        if (!unfocus) this.element.focus();
        mathjax.updateMath(this.element);
    }
}