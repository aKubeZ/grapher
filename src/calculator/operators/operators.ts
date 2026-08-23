import { type Value } from "../value.js";
import { InOperator } from "./inoperator.js"
import { NumberValue } from "../values/number.js"
import { MathText, mathToken } from "../../math/mathtext.js";

const NumberPair: [string, string] = [NumberValue.type, NumberValue.type];

// every rank used.

// LOGIC
const IMPLIES_IFF = 0;
const QUANTIFIER = 1;
const AND_OR = 2;
const NEGATION = 3;

// SETS
const SET_OPERATOR = 10;
const ELEMENT  = 11;

// RELATIONS
const RELATION = 20;

// SEPARATORS
const MATRIX_SEPARATOR = 30;
const LIST_SEPARATOR = 31;

// REAL/COMPLEX ARITHMETIC
const ADD_SUB = 40;
const TRIGONOMETRY = 41;
const PROD_DIV = 42;
const SUPERSCRIPT = 43

/**
 * A list of standard operators.
 */
export const operators = [
    new InOperator("ADDITION", ADD_SUB, [new MathText([mathToken("+")])], [NumberPair], (args: Value[], inputType: number) => {
        switch (inputType) {
            case 0: {
                const [a, b] = args as [NumberValue, NumberValue];
                return new NumberValue(
                    a.real() + b.real(),
                    a.imag() + b.imag(),
                );
            }
            default: throw new Error("Input invalid somehow.");
        }
    }),
    new InOperator("SUBTRACTION", ADD_SUB, [new MathText([mathToken("-")])], [NumberPair], (args: Value[], inputType: number) => {
        switch (inputType) {
            case 0: {
                const [a, b] = args as [NumberValue, NumberValue];
                return new NumberValue(
                    a.real() + b.real(),
                    a.imag() + b.imag(),
                );
            }
            default: throw new Error("Input invalid somehow.");
        }
    }),
];