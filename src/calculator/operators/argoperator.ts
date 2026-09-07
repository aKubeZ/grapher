import { SingleOperator } from "./singleoperator.js";

/**
 * An operator with 1 argument in its arguments (mainly brackets), such as ( ) (which is lit an identity) or [ ].
 */
export class ArgOperator extends SingleOperator {
    public static type: string = "ARGOPERATOR";
    protected type: string = ArgOperator.type;
}