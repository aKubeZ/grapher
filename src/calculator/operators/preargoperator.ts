import { DoubleOperator } from "./doubleoperator.js";

/**
 * An operator with an argument before and an argument in its arguments like ^
 * ts getting confusing
 */
export class PreArgOperator extends DoubleOperator {
    public static type: string = "PREARGOPERATOR";
    protected type: string = PreArgOperator.type;
}