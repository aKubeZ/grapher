import * as mathjax from "./mathjax.js";

type MathToken = {
    name: string;
    args: MathText[];
    brackets?: [string, string];
};

type MathTextData = MathToken[];
type Shorthand = { shorthand: MathText, value: MathText };

class MathText {
    private mathText: MathTextData;
    private mathString: string | undefined;
    private mathSize: number | undefined;
    private shorthands: Shorthand[] = [];

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
    }

    /**
     * sets the shorthands ofc ofc
     * and also inherits it to the children
     */
    public setShorthands(shorthands: Shorthand[]): void {
        this.shorthands = shorthands;
        for (const token of this.mathText) {
            for (const argument of token.args) {
                argument.setShorthands(shorthands);
            }
        }
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
     * converts like s,q,r,t -> sqrt
     * note that this inputs the newIndex
     */
    public convertShorthands(index: number): number {
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

            let argumentStartIndex = indexCount + 0;
            for (let j = 0; j < token.args.length; j++) {
                const argument = <MathText> token.args[j];

                if (indexCount + argument.getSize() > index)
                    return indexCount + argument.convertShorthands(index - indexCount);

                indexCount += argument.getSize();
                argumentStartIndex += argument.getSize();
            }

            if (indexCount === index) {
                tokenIndex = i;
                break;
            }
        }

        console.log(tokenIndex);

        if (tokenIndex === 0) return index;
        tokenIndex++;

        for (let i = 0; i < this.shorthands.length; i++) {
            const shorthand = <MathText> this.shorthands[i]?.shorthand;
            const startIndex = tokenIndex - shorthand.mathText.length;
            console.log(startIndex, tokenIndex);
            const value = <MathText> this.shorthands[i]?.value;
            if (startIndex < 0) continue;
            const potentialShorthand = new MathText(this.mathText.slice(startIndex, tokenIndex));
            if (potentialShorthand.equals(shorthand)) {
                this.mathText = this.mathText.toSpliced(startIndex, tokenIndex, ...value.mathText);
                this.reset();
                // return index - shorthand.getSize() + value.getSize();
                return index;
            }
        }

        return index;
    }

    /**
     * inserts token and returns new math index ofc
     */
<<<<<<< HEAD
    public insertToken(index: number, insertToken: MathToken | string): number {
        // if (typeof insertToken === "string") return this.insertToken(index, mathToken(insertToken));
        if (typeof insertToken === "string") insertToken = mathToken(insertToken);
        if (index === 0) {
            this.mathText = this.mathText.toSpliced(0, 0, insertToken);
            this.reset();
            return 1;
        }
        
        let indexCount = 0;
        for (let i = 0; i < this.mathText.length; i++) {
            const token = <MathToken> this.mathText[i];
            indexCount++;

            if (token.args.length === 0 && indexCount === index) {
                this.mathText = this.mathText.toSpliced(i + 1, 0, insertToken);
                this.reset();
                return index + 1;
            }

            let argumentStartIndex = indexCount + 0;
            for (let j = 0; j < token.args.length; j++) {
                const argument = <MathText> token.args[j];

                if (indexCount + argument.getSize() > index) {
                    this.reset();
                    return indexCount + argument.insertToken(index - indexCount, insertToken);
                }

                indexCount += argument.getSize();
                argumentStartIndex += argument.getSize();
            }

            if (indexCount === index) {
                this.mathText = this.mathText.toSpliced(i + 1, 0, insertToken);
                this.reset();
                return index + 1;
            }
        }

        return 0;
    }
    
    public newIndexRange(startIndex: number, endIndex: number): number {
=======
    public insertToken(index: number, insertToken: MathText | MathToken | string, toArgs?: boolean, shorthand=true): number {
        if (typeof insertToken === "string")
            return this.insertToken(index, new MathText([mathToken(insertToken)]), toArgs);
        if ((<MathToken> insertToken).name)
            return this.insertToken(index, new MathText([<MathToken> insertToken]), toArgs);
        
        const insertTokens = <MathText> insertToken;
        const indexDifference = toArgs ? 1 : insertTokens.getSize() - 1;

>>>>>>> 7aa07d46d275229d7f8e1b006a71004590d099ae
        if (index === 0) {
            this.mathText = this.mathText.toSpliced(0, 0, ...insertTokens.mathText);
            if (shorthand) this.convertShorthands(indexDifference);
            this.reset();
            return indexDifference;
        }
        
        let indexCount = 0;
        for (let i = 0; i < this.mathText.length; i++) {
            const token = <MathToken> this.mathText[i];
            indexCount++;

            if (token.args.length === 0 && indexCount === index) {
                this.mathText = this.mathText.toSpliced(i + 1, 0, ...insertTokens.mathText);
                if (shorthand) this.convertShorthands(index + indexDifference);
                this.reset();
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
                if (shorthand) this.convertShorthands(index + indexDifference);
                this.reset();
                return index + indexDifference;
            }
        }

        return 0;
    }
}

/**
 * just makes a token for the sake of convenience
 */
function mathToken(name: string, args: MathText[] = []) {
    return {
        name: name,
        args: args,
    };
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
        {
            shorthand: new MathText([
                mathToken('s'),
                mathToken('q'),
                mathToken('r'),
                mathToken('t'),
            ]),
            value: new MathText([
                mathToken('\\sqrt ', [new MathText([])]),
            ])
        }
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
    private cursorIndex: number;
    private cursorRange: number;
    private renderingLatex: string = "";

    public constructor(element: HTMLElement) {
        this.math.setShorthands(MathInput.defaultShorthands);
        this.element = element;
        this.cursorIndex = 0;
        this.cursorRange = 0;
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
                    if (this.cursorIndex === 0) break;
                    this.cursorIndex--;
                    this.updateString();
                } break;
                case "ArrowRight": {
                    if (this.cursorIndex === this.math.getSize() - 1) break;
                    this.cursorIndex++;
                    this.updateString();
                } break;
                case "Backspace": {
                    this.cursorIndex = this.math.backspace(this.cursorIndex);
                    this.updateString();
                } break;
                case "Delete": {
                    if (this.cursorIndex === this.math.getSize() - 1) break;
                    this.cursorIndex = this.math.backspace(this.cursorIndex + 1);
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
                        } else if (event.key === "|") {
                            this.cursorIndex = this.math.insertToken(this.cursorIndex, "\\vert ");
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
                        } else if (event.key === "^") {
                            this.cursorIndex = this.math.insertToken(this.cursorIndex, mathToken('^', [new MathText([])]), true);
                            this.updateString();
                            return;
                        } else if (event.key === "(" || event.key === ")" || event.key === "^") return;

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
            this.updateString();
        });

        this.element.addEventListener("focusout", (event) => {
            this.updateString(true);
        });

        this.updateString();
    }

    // updates string AND cursor pos
    public updateString(unfocus?: boolean): void {
        // const cursorPos = 0;
        const cursorPos = this.math.stringIndex(this.cursorIndex);


        let mathString = this.math.toString();
        if (this.cursorRange === 0)
            mathString = mathString.slice(0, cursorPos) + (!unfocus ? "\\mkern -1mu \\raise{0.1ex}{\\vert} \\mkern -1mu" : "") + mathString.slice(cursorPos);
        else {
            const cursorEndPos = this.math.stringIndex(this.cursorIndex + this.cursorRange);
            mathString = mathString.slice(0, cursorPos) + String.raw`\bbox[blue, 1pt]{` + mathString.slice(cursorPos, cursorEndPos) + '}' + mathString.slice(cursorEndPos);
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