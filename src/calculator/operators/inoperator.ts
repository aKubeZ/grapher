import { DoubleOperator } from "./doubleoperator.js";

/**
 * An operator in between its arguments, such as + or ,
 * also includes the multiplication without the multiplication symbol
 */
export class InOperator extends DoubleOperator {
    public static type: string = "INOPERATOR";
    protected type: string = InOperator.type;
}