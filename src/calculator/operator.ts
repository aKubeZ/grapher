import type { MathText } from "../math/mathtext.js";
import { type Value } from "./value.js";

/**
 * Abstract class for operators, to be extended by different operator types.
 */
export abstract class Operator {

    /**
     * The math text that triggers this operator.
     */
    protected abstract triggers: MathText[];

    /**
     * The name of this operator
     */
    protected abstract name: string;

    /**
     * The type of this operator
     */
    protected abstract type: string;

    /**
     * The order of operations this operator has.
     * If rank is higher, the earlier this operater will be evaluated.
     */
    protected abstract rank: number;

    /**
     * The types of the inputs of this operator.
     */
    protected abstract inputTypes: string[][]; // array of input types

    /**
     * Operate on arguments and return a value. Throws an error if invalid input type.
     * @param args the input
     * @returns the ouput
     */
    public operate(args: Value[]): Value { // func to make sure the types match
        for (let i = 0; i < this.inputTypes.length; i++) {
            const inputType = this.inputTypes[i] as string[];
            if (args.length !== inputType.length) continue;
            let useInput: boolean = true;
            for (let j = 0; j < args.length; j++) {
                if (args[j] !== inputType[j]) {
                    useInput = false;
                    break;
                }
            }

            if (useInput) return this.localOperate(args, i);
        }

        throw new Error("Input type not found.");
    }

    /**
     * The actual operator that operates.
     * @param args the input values
     * @param inputType the index of `inputTypes` that correspond to this input type.
     */
    protected abstract localOperate(args: Value[], inputType: number): Value;

    /**
     * Returns the name of the operator.
     * @returns name of the operator.
     */
    getName(): string { return this.name; }

    /**
     * Return the type of the operator.
     * @returns type of the operator.
     */
    getType(): string { return this.type; }

    /**
     * Return the math text triggers for this operator.
     * @returns operator triggers.
     */
    getTriggers(): MathText[] { return this.triggers; }
}