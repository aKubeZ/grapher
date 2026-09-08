import { Operator } from "./operator.js";
import { type Value } from "../value.js";

/**
 * An operator with only 1 argument, such as sin or exp.
 */
export abstract class SingleOperator extends Operator {
    protected tokens: string[];
    protected name: string;
    protected inputTypes: [string][];
    protected rank: number;
    
    /**
     * Constructs an operator with one input.
     * @param name Name of the operator
     * @param rank The rank (order of operation) this operator has. The higher the number the earlier this operator would be parsed.
     * @param tokens The token lists that trigger this operator.
     * @param inputTypes The types of inputs thiis operator has.
     * @param operate The operate function (the input type corresponds to `inputTypes[inputType]`)
     */
    constructor(name: string, rank: number, tokenLists: string[], inputTypes: [string][],
        operate: (args: Value[], inputType: number) => Value
    ) {
        super();
        this.rank = rank;
        this.name = name;
        this.tokens = tokenLists;
        this.inputTypes = inputTypes;
        this.localOperate = operate;
    }

    public operate(args: Value[]): Value {
        if (args.length !== 1) throw new Error("SingleOperator operated not 1 argument");
        return super.operate(args);
    }

    protected localOperate: (args: Value[], inputType: number) => Value;
}