import { Operator } from "../operator";
import { type Value } from "../value";

export abstract class InOperator extends Operator {
    public static type: string = "IN_OPERATOR";
    protected type: string = "IN_OPERATOR";
    public operate(args: Value[]): Value {
        if (args.length !== 2) throw new Error("InOperator operated not 2 arguments");
        return super.operate(args);
    }
}