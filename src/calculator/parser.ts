import { MathText, type MathToken } from "../math/mathtext.js";
import type { Operator } from "./operator.js";
import type { NumberValue } from "./values/number.js";

/**
 * The thing parse returns if not a number
 */
type ParsedMath = NumberValue | {
    operator: Operator;
    args: ParsedMath[];
};

type Token = {
    /**
     * name of the token
     */
    name: string;

    /**
     * arguments of the token
     */
    args: Token[][];
}

export class Parser {
    private operators: Operator[];
    
    /**
     * when parsing, strings of these in a row will be merged into 1 token
     */
    private mergers: string[] = [
        "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "."
    ];

    /**
     * when parsing, one of these coming after another appends to it
     */
    private appenders: string[] = [
        "_"
    ];

    constructor(operators: Operator[]) {
        this.operators = operators;
    }

    mathToTokens(math: MathText): Token[] {
        const tokens: Token[] = [];
        let prevMathTokenMerges: boolean = false;
        for (let i = 0; i < math.getMathTokens().length; i++) {
            const mathToken = math.getMathTokens()[i] as MathToken;
            const mathTokenMerges = (this.mergers.includes(mathToken.name));
            const mathTokenAppends = (this.appenders.includes(mathToken.name));

            if (prevMathTokenMerges && mathTokenMerges) {
                const lastToken = tokens[tokens.length - 1] as Token;
                lastToken.name += mathToken.name;
            } else if (mathTokenAppends) {
                prevMathTokenMerges = false;
                const lastToken = tokens[tokens.length - 1];
                if (!lastToken) throw new Error("Attempted to append to empty string.");
                lastToken.name += new MathText([mathToken]).toString();
            } else {
                prevMathTokenMerges = mathTokenMerges;
                tokens.push({
                    name: mathToken.name,
                    args: mathToken.args.map((mathText: MathText) => this.mathToTokens(mathText)),
                });
            }
        }

        return tokens;
    }

    parse(inMathText: MathText): ParsedMath {
        const tokens = this.mathToTokens(inMathText);
        console.log(tokens);
        

        // placeholder
        return (undefined as unknown) as ParsedMath;
    }

    setOperators(operators: Operator[]): void { this.operators = operators; }
}