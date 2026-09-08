import { MathText, type MathToken } from "../math/oldmath/mathtext.js";
import type { Operator } from "./operators/operator.js";
import { ArgOperator } from "./operators/argoperator.js";
import { InOperator } from "./operators/inoperator.js";
import { PostOperator } from "./operators/postoperator.js";
import { PreArgOperator } from "./operators/preargoperator.js";
import { PreOperator } from "./operators/preoperator.js";
import type { Value } from "./value.js";

/**
 * The thing parse returns if not a number
 */
export type ParsedMath = Value | {
    operator: Operator;
    args: ParsedMath[];
};

/**
 * im sorry if this typescript is trash
 * i lwk dont know how to type
 */
enum TokenType {
    NUMBER,
    SYMBOL,
    OPERATOR,
};

/**
 * A character/variable/something in a string of math,
 */
type Token = {
    /**
     * name of the token
     */
    name: string;

    /**
     * arguments of the token
     */
    args: Token[][];
    
    /**
     * type of the token
     */
    type: TokenType;

    /**
     * the value (number/oeprator/symbol)
     */
    value: number | string | Operator;
}

/**
 * a token thats a number
 */
type NumberToken = Token & {value: number};

/**
 * a token thats a symbol
 */
type SymbolToken = Token & {value: string};

/**
 * a token thats an operator
 */
type OperatorToken = Token & {value: Operator};

export class Parser {
    private operators: Operator[];
    
    /**
     * when parsing, strings of these in a row will be merged into 1 token
     */
    private numbers: string[] = [
        "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "."
    ];

    private appenders: string[] = [
        "_"
    ]

    /**
     * parsing will discard these
     */
    private removers: string[] = [
        "\\  ", "\\mathrm "
    ];

    /**
     * operators that act like symbols for the token after it (insert blank operator after it)
     */
    private postSymbolLikeOperator: string[] = [
        ArgOperator.type, PostOperator.type, PreArgOperator.type
    ];

    /**
     * operators that act like symbols for the token before it (insert blank operator before it)
     */
    private preSymbolLikeOperator: string[] = [
        ArgOperator.type, PreOperator.type
    ];

    /**
     * the (in)operator that is placed when 2 numbers/symbols are next to one another
     */
    private blankOperator: InOperator;
    
    /**
     * Constructs a parser with the set of given operators
     * @param operators the operators that the parser will use to parse
     */
    constructor(operators: Operator[], blankOperator: InOperator) {
        this.operators = operators;
        this.blankOperator = blankOperator;
    }

    /**
     * returns if the number if input string is a number, else returns undefined
     */
    private toNumber(input: string): undefined | Number {
        let foundDecimal = false;
        for (let i = 0; i < input.length; i++) {
            const char = input.charCodeAt(i);
            console.log(char);
            if (char === 0x2e) { // period
                if (foundDecimal) return; // is not a number when there are 2 decimals
                foundDecimal = true;
            } else if (char < 0x30 || char > 0x39) // if char is not a number
                return;
        }

        return Number(input);
    }

    /**
     * returns if the token is a number token
     */
    private isNumber(token: Token): token is NumberToken { return token.type === TokenType.NUMBER; }

    /**
     * returns if the token is a symbol token
     */
    private isSymbol(token: Token): token is SymbolToken { return token.type === TokenType.SYMBOL; }

    /**
     * returns if the token is a number token
     */
    private isOperator(token: Token): token is OperatorToken { return token.type === TokenType.OPERATOR; }

    /**
     * Converts a MathText object into a list of Token, subscripts merge with the token before it.
     * This function also places the `blankOperator` in between symbols/numbers.
     * @param math the input MathText object
     * @returns the output Token[]
     */
    private mathToTokens(math: MathText): Token[] {
        /**
         * lit a type with a name and arguments
         */
        type NameArg = {
            name: string;
            args: Token[][]
        };

        const nameArgList: NameArg[] = [];
        let prevMathTokenMerges: boolean = false;
        for (let i = 0; i < math.getMathTokens().length; i++) {
            const mathToken = math.getMathTokens()[i] as MathToken;
            
            if (this.removers.includes(mathToken.name)) {
                prevMathTokenMerges = false;
                continue;
            }

            const mathTokenMerges = (this.numbers.includes(mathToken.name));
            const mathTokenAppends = (this.appenders.includes(mathToken.name));

            if (prevMathTokenMerges && mathTokenMerges) {
                const lastNameArg = nameArgList[nameArgList.length - 1] as NameArg;
                lastNameArg.name += mathToken.name;
            } else if (mathTokenAppends) {
                prevMathTokenMerges = false;
                const lastNameArg = nameArgList[nameArgList.length - 1];
                if (!lastNameArg) throw new Error("Attempted to append to empty string.");
                lastNameArg.name += new MathText([mathToken]).toString();
            } else {
                prevMathTokenMerges = mathTokenMerges;
                nameArgList.push({
                    name: mathToken.name,
                    args: mathToken.args.map((mathText: MathText) => this.mathToTokens(mathText)),
                });
            }
        }

        // TODO: make special case for additive inverses & subtraction

        // this loop converts NameArg[] to Token[]
        const tokens: Token[] = [];
        let prevTokenAllowsBlankOperator: boolean = false;

        for (const nameArg of nameArgList) {
            // adds a number if number
            const numberValue = this.toNumber(nameArg.name);
            let tokenAllowsBlankOperator!: boolean;
            let tokenWillAllowBlankOperator!: boolean;
            let tokenType!: TokenType;
            let tokenValue!: number | string | Operator;
            // console.log(numberValue);
            if (typeof numberValue === 'number') {
                tokenAllowsBlankOperator = true;
                tokenWillAllowBlankOperator = true;
                tokenType = TokenType.NUMBER;
                tokenValue = numberValue;
            } else {
                // tries to find an operator to add
                let operatorFound = false;
                for (const operator of this.operators) {
                    // console.log(operator.getTokens());
                    if (operator.getTokens().includes(nameArg.name)) {
                        tokenAllowsBlankOperator = this.preSymbolLikeOperator.includes(operator.getType());
                        tokenWillAllowBlankOperator = this.postSymbolLikeOperator.includes(operator.getType());
                        tokenType = TokenType.OPERATOR;
                        tokenValue = operator;
                        operatorFound = true;
                        break;
                    }
                }

                // adds a syjmbol
                if (!operatorFound) {
                    tokenAllowsBlankOperator = true;
                    tokenWillAllowBlankOperator = true;
                    tokenType = TokenType.SYMBOL;
                    tokenValue = nameArg.name;
                }
            }

            if (prevTokenAllowsBlankOperator && tokenAllowsBlankOperator) {
                tokens.push({
                    name: "BLANK_OPERATOR",
                    args: [],
                    type: TokenType.OPERATOR,
                    value: this.blankOperator
                });
            }

            tokens.push({
                name: nameArg.name,
                args: nameArg.args,
                type: tokenType,
                value: tokenValue,
            });

            prevTokenAllowsBlankOperator = tokenWillAllowBlankOperator;
        }

        return tokens;
    }

    /**
     * intends to parse a MathText object to a ParsedMath object;;
     * @param inMathText the input MathText object
     * @returns the ParsedMath object
     */
    public parse(inMathText: MathText): ParsedMath {
        const tokens = this.mathToTokens(inMathText);
        if (tokens.length === 0) throw new Error("Syntax Error: tried to parse an empty string.");
        console.log(tokens);

        const firstToken = tokens[0] as Token;
        const lastToken = tokens[tokens.length - 1] as Token;
        let bestOperatorIndex: number;
        if (tokens.length === 1 && this.isOperator(firstToken) && firstToken.value.getType() === ArgOperator.type)
            bestOperatorIndex = 0;
        else {
            const operatorIndices: number[] = [];
            if (this.isOperator(firstToken) && firstToken.value.getType() === PreOperator.type) operatorIndices.push(0);
            if (this.isOperator(lastToken) && lastToken.value.getType() === PostOperator.type) operatorIndices.push(tokens.length - 1);
    
            for (let i = 0; i < tokens.length; i++) {
                const token = tokens[i] as Token;
                if (!this.isOperator(token)) continue;
                const operator = token.value;
                if (operator.getType() === InOperator.type || operator.getType() === PreArgOperator.type) operatorIndices.push(i);
            }

            if (operatorIndices.length === 0) throw new Error("Syntax Error: couldn't find an operator.");

            // finds the operator with the least rank
            bestOperatorIndex = operatorIndices[0] as number;
            let bestOperatorRank = (tokens[bestOperatorIndex] as OperatorToken).value.getRank();
            for (let i = 1; i < operatorIndices.length; i++) {
                const operatorIndex = operatorIndices[i] as number;
                const operator = (tokens[operatorIndex] as OperatorToken).value;
                const operatorRank = operator.getRank();
                if (operatorRank < bestOperatorRank) {
                    bestOperatorIndex = operatorIndex;
                    bestOperatorRank = operatorRank;
                }
            }
        }

        return (undefined as unknown) as ParsedMath;
    }

    public setOperators(operators: Operator[]): void { this.operators = operators; }
}