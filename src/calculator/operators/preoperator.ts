import { SingleOperator } from "./singleoperator.js";

/**
 * An operator before its arguments, such as sin or exp.
 */
export class PreOperator extends SingleOperator {
    public static type: string = "PREOPERATOR";
    protected type: string = PreOperator.type;
}