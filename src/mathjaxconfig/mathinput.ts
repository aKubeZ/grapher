import * as mathjax from "./mathjax.js";

class Token {
    private arguments: TokenString[] = [];
    private name: string;
    private nameLength: number;
    private tokenString: string | undefined;
    private size: number | undefined;
    constructor(name: string, ...args: TokenString[]) {
        this.name = name;
        this.nameLength = name.length + ((name.charAt(0) === "\\") ? 1 : 0);
        this.arguments = args;
    }

    private reset() {
        this.size = undefined;
        this.tokenString = undefined;
    }

    public getSize(): number {
        if (this.size) return this.size;
        this.size = 1;
        for (const argument of this.arguments) {
            this.size += 1 + argument.getSize();
        }

        return this.size;
    }

    public toString(): string {
        if (this.tokenString) return this.tokenString;
        this.tokenString = this.name + ((this.name.charAt(0) === "\\") ? " " : "");
        for (const argument of this.arguments) {
            this.tokenString += "{";
            this.tokenString += argument.toString();
            this.tokenString += "}";
        }

        return this.tokenString;
    }

    public argumentsLength(): number { return this.arguments.length; }
    public getArguments(): TokenString[] { return this.arguments; }

    // returns a list of tokens of arguments WITHOUT the token name
    // something like this wd be backspacing 'e^{|x}'
    public flattenedArguments(): Token[] {
        let tokenList: Token[] = [];
        for (const argument of this.arguments) {
            tokenList = tokenList.concat(argument.getTokens());
        }
        return tokenList;
    }

    // size of the "substring";
    public partLength(index: number): number {
        if (index === 0) return 0;
        if (index === 1 && this.arguments.length === 0) return this.nameLength;
        
        let indexCount = 0;
        let argumentIndex = 0;
        let partLength = this.nameLength;
        for (const argument of this.arguments) {
            partLength++;
            const argumentSize = argument.getSize() + 1;
            if (indexCount + argumentSize >= index) break;
            argumentIndex++;
            indexCount += argumentSize;
            partLength += argument.toString().length;
            partLength++;
        }

        if (argumentIndex === this.arguments.length) return this.toString().length;
        partLength += (<TokenString> this.arguments[argumentIndex]).partLength(index - indexCount - 1);
        return partLength;
    }

    // returns which argument the index is in, undefined if doesnt flatten
    // for the sake of convenience for calculating the new cursor index
    public backspaceFlattensToken(index: number): number | undefined {
        let argumentStartIndex = 1;
        let argumentIndex = 0;
        for (const argument of this.arguments) {
            if (index === argumentStartIndex) return argumentIndex;
            if (index < argumentStartIndex) return undefined;
            argumentStartIndex += argument.getSize() + 1;
            argumentIndex++;
        }

        return undefined;
    }

    public backspaceDeletesToken(index: number): boolean {
        return (this.arguments.length === 0 && index === 1);
    }

    public backspace(index: number): number {
        if (index === 0) return 0;
        if (index === this.getSize()) return this.getSize();

        let indexCount = 0;
        let argumentIndex = 0;
        for (const argument of this.arguments) {
            const argumentSize = argument.getSize() + 1;
            if (indexCount + argumentSize >= index) break;
            argumentIndex++;
            indexCount += argumentSize;
        }

        const argument = <TokenString> this.arguments[argumentIndex];
        this.reset();
        return indexCount + argument.backspace(index - indexCount);
    }
}

class TokenString {
    private tokens: Token[];
    private size: number | undefined;
    private tokenString: string | undefined;
    constructor(...tokens: Token[]) {
        this.tokens = tokens;
    }

    private reset() {
        this.size = undefined;
        this.tokenString = undefined;
    }

    public getSize(): number {
        if (this.size) return this.size;
        this.size = 0;
        for (const token of this.tokens) {
            this.size += token.getSize();
        }

        return this.size;
    }

    public getTokens(): Token[] {
        return this.tokens;
    }

    public toString(): string {
        if (this.tokenString) return this.tokenString;
        this.tokenString = "";
        for (const token of this.tokens)
            this.tokenString += token.toString();
        return this.tokenString;
    }

    public partLength(index: number): number {
        if (index === 0) return 0;
        if (this.tokens.length === 0) return 0;
        let partLength = 0;
        let indexCount = 0;
        let tokenIndex = 0;
        for (const token of this.tokens) {
            const tokenSize = token.getSize();
            if (indexCount + tokenSize >= index) break;
            tokenIndex++;
            indexCount += tokenSize;
            partLength += token.toString().length;
        }

        partLength += (<Token> this.tokens[tokenIndex])
                .partLength(index - indexCount);

        return partLength;
    }

    // backspaces that shit at that place, returns new index num
    public backspace(index: number): number {
        if (index === 0) return 0;
        let indexCount = 0;
        let tokenIndex = 0;
        for (const token of this.tokens) {
            const tokenSize = token.getSize();
            if (indexCount + tokenSize >= index) break;
            tokenIndex++;
            indexCount += tokenSize;
        }

        const token = <Token> this.tokens[tokenIndex];
        const tokenRelativeIndex = index - indexCount;
        if (tokenIndex === this.tokens.length) return index - 1; // for token{token}| => token{token|}
        const backspaceFlattensToken = token.backspaceFlattensToken(tokenRelativeIndex);
        if (token.backspaceDeletesToken(tokenRelativeIndex)) {
            this.tokens = this.tokens.toSpliced(
                tokenIndex, 1
            );
            this.reset();
            return indexCount;
        } else if (backspaceFlattensToken !== undefined) {
            const tokenArgumentsLength = token.argumentsLength();
            const flattenedToken = token.flattenedArguments();
            this.tokens = this.tokens.toSpliced(
                tokenIndex, 1, ...flattenedToken
            );
            this.reset();
            // .a{|b}... => .a|b...        c -= aL
            // .a{.b.}{|c... => .a.b|c...
            // .a{.b.}{.c.}{|d}... => .a.b.c|d...
            return index - backspaceFlattensToken - 1;
        } else {
            this.reset();
            return 1 + indexCount + token.backspace(tokenRelativeIndex - 1);
        }
    }
}

export class MathInput {
    public static mathInput(element: HTMLElement): void {
        MathInput.mathInputs.push(new MathInput(element));
    }

    private static mathInputs: MathInput[] = [];

    private math: TokenString = new TokenString(
        new Token("\\frac",
            new TokenString(
                new Token("-"),
                new Token("b"),
                new Token("\\pm"),
                new Token("\\sqrt",
                    new TokenString(
                        new Token("b"),
                        new Token("^",
                            new TokenString(
                                new Token("2")
                            )
                        ),
                        new Token("-"),
                        new Token("4"),
                        new Token("a"),
                        new Token("c"),
                    )
                )
            ),
            new TokenString(
                new Token("2"),
                new Token("a"),
            )
        )
    );
    // private math: TokenString = new TokenString(
    //     new Token("alpha,", new TokenString(
    //         new Token("alpha 1.1,"),
    //         new Token("alpha 1.2,"),
    //         new Token("alpha 1.3,"),
    //     ), new TokenString(
    //         new Token("alpha 2.1,"),
    //         new Token("alpha 2.2,"),
    //     )),
    //     new Token("beta,"),
    //     new Token("gamma,"),
    //     new Token("delta,", new TokenString(
    //         new Token("delta 1,"),
    //         new Token("delta 2,"),
    //     )),
    //     new Token("eta,", new TokenString(
    //         new Token("eta 1.1,"),
    //         new Token("eta 1.2,"),
    //     ), new TokenString(
    //         new Token("eta 2.1,"),
    //         new Token("eta 2.2,"),
    //     ), new TokenString(
    //         new Token("eta 2.1,"),
    //         new Token("eta 2.2,"),
    //     )),
    // );

    private element: HTMLElement;
    private cursorIndex: number;
    private focused: boolean = false;
    private renderingLatex: string = "";

    public constructor(element: HTMLElement) {
        this.element = element;
        this.cursorIndex = 0;
        this.initElement();
        mathjax.updateMath(this.element);
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
                    if (this.cursorIndex === this.math.getSize()) break;
                    this.cursorIndex++;
                    this.updateString();
                } break;
                case "Backspace": {
                    this.cursorIndex = this.math.backspace(this.cursorIndex);
                    this.updateString();
                } break;
                case "Delete": {
                    if (this.cursorIndex === this.math.getSize()) return;
                    this.cursorIndex = this.math.backspace(this.cursorIndex + 1);
                    this.updateString();
                } break;
            }
        });

        this.element.addEventListener("focus", (event) => {
            event.preventDefault();
            this.cursorIndex = 0;
            this.focused = true;
            this.updateString();
        });

        this.element.addEventListener("focusout", (event) => {
            // event.preventDefault();
            this.focused = false;
            this.updateString();
        });

        this.updateString();
    }

    // updates string AND cursor pos
    public updateString(): void {
        const cursorPos = 2 + this.math.partLength(this.cursorIndex);

        let mathString = `\\[${this.math.toString()}\\]`;
        mathString = mathString.slice(0, cursorPos) + (this.focused ? "\\kern -2mu {\\small \\textsf |} \\kern -2mu" : "") + mathString.slice(cursorPos);
        console.log(mathString !== this.renderingLatex);
        if (mathString !== this.renderingLatex) {
            this.renderingLatex = mathString;
            this.element.textContent = mathString;
        }
        
        this.element.focus();
        mathjax.updateMath(this.element);
    }
}