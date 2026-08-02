import { type Value } from "./value";
import { type Operator } from "./operator";
import { Addition } from "./operators/addition";
import { Multiplication } from "./operators/multiplication";
import { NumberValue } from "./values/number";
import { InOperator } from "./operators/inoperator";

/**
 * Main hub for calculations and functions and allat
 */
export class Calculator {
    private static defaultOperators: Operator[] = [
        new Addition(),
        new Multiplication()
    ];
    // vars: { [id: string]: Entry; } [] = [];
    private static Parser = class Parser {
        private constants: Map<string, NumberValue> = new Map<string, NumberValue>();
        private operators: Operator[] = [];
        private static brackets = [
            {open: String.raw`\left(`, close: String.raw`\right)`},
            {open: String.raw`\left[`, close: String.raw`\right]`},
            {open: String.raw`{`, close: String.raw`}`}
        ];

        private toNum(input: string): NumberValue | undefined {
            if (this.constants.has(input)) return this.constants.get(input);
            if (!isNaN(Number(input))) return new NumberValue(Number(input));
            return undefined;
        }

        // private parse(input: string): { [id: Operator]: any } | NumberValue {
        //     /*
        //     - if nothing kill itself
        //     - if number then yay
        //     - loop thru the entire string // inoeprator search
        //     - find unnested inoperators (+, -)
        //     - if brackets dont look right kill itself
            
        //     - if no inoperators // other operators
        //       - find pre\post operators
        //       - else find parenthetical operators
        //       - else find { }
        //       - else kill itself
            
        //     - ok back to inoperators // inoperator continuation
        //     - rule out fake minus signs
        //     - do order of operations on that shit
        //     - recurse
        //     */
        //     const num = this.toNum(input);
        //     if (num) return num;
        //     const inOperators: { index: number, operator: InOperator }[] = [];
        //     let nestCount = 0;
        //     for (let index = 0; index < input.length; index++) {
        //         for (const inOperator of this.operators) {
        //             if (inOperator.getType() !== InOperator.type) continue;
        //             for (const token of inOperator.getTokens()) { // inoperater search, index uses forward lookahead
        //                 if (token.length === 0) continue;
        //                 if (index + token.length + 1 >= input.length) continue;
        //                 if (input.substring(index, index + token.length) !== token) {
        //                     inOperators.push({
        //                         index: index,
        //                         operator: <InOperator> inOperator
        //                     });
        //                 }
        //             }
        //         }
        //     }
             
        //     input = input.trim();
        //     if (input == "") throw new Error("Syntax Error: got an empty string");

        // }

        getConstants() {
            return this.constants;
        }

        setOperators(operators: Operator[]) {
            this.operators = operators;
        }
    }

    private parser = new Calculator.Parser();
    constructor() {
        this.parser.setOperators([

        ]);
    }
}