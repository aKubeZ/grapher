import { SingleOperator } from "./singleoperator.js";

/**
 * An operator before its arguments, such as sin or exp.
 */
export class PostOperator extends SingleOperator {
    public static type: string = "POSTOPERATOR";
    protected type: string = PostOperator.type;
}