import { Operator } from "../operator.js";
import { type Value } from "../value.js";

/**
 * An operator with 2 arguments
 */
export abstract class DoubleOperator extends Operator {
    protected tokenLists: string[][];
    protected name: string;
    protected inputTypes: [string, string][];
    protected rank: number;
    
    /**
     * Constructs an operator with two arguments.
     * @param name Name of the operator
     * @param rank The rank (order of operation) this operator has. The higher the number the earlier this operator would be parsed.
     * @param tokens The token lists that trigger this operator.
     * @param inputTypes The types of inputs thiis operator has.
     * @param operate The operate function (the input type corresponds to `inputTypes[inputType]`)
     */
    public constructor(name: string, rank: number, tokenLists: string[][], inputTypes: [string, string][],
        operate: (args: Value[], inputType: number) => Value
    ) {
        super();
        this.rank = rank;
        this.name = name;
        this.tokenLists = tokenLists;
        this.inputTypes = inputTypes;
        this.localOperate = operate;
    }

    public operate(args: Value[]): Value {
        if (args.length !== 2) throw new Error("DoubleOperator operated not 2 arguments");
        return super.operate(args);
    }

    protected localOperate: (args: Value[], inputType: number) => Value;
}