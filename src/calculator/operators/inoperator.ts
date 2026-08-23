import { type MathText } from "../../math/mathtext.js";
import { Operator } from "../operator.js";
import { type Value } from "../value.js";

/**
 * An operator in between its arguments, such as + or ,
 */
export class InOperator extends Operator {
    public static type: string = "IN_OPERATOR";
    protected triggers: MathText[];
    protected type: string = "IN_OPERATOR";
    protected name: string;
    protected inputTypes: [string, string][];
    protected rank: number;
    
    /**
     * Constructs an inoperator.
     * @param name Name of the operator
     * @param rank The rank (order of operation) this operator has. The higher the number the earlier this operator would be parsed.
     * @param triggers The math text triggers that trigger this operator.
     * @param inputTypes The types of inputs thiis operator has.
     * @param operate The operate function (the input type corresponds to `inputTypes[inputType]`)
     */
    public constructor(name: string, rank: number, triggers: MathText[], inputTypes: [string, string][],
        operate: (args: Value[], inputType: number) => Value
    ) {
        super();
        this.rank = rank;
        this.name = name;
        this.triggers = triggers;
        this.inputTypes = inputTypes;
        this.localOperate = operate;
    }

    public operate(args: Value[]): Value {
        if (args.length !== 2) throw new Error("InOperator operated not 2 arguments");
        return super.operate(args);
    }

    protected localOperate: (args: Value[], inputType: number) => Value;
}