import type { Value } from "../value";
import { NumberValue } from "../values/number";
import { InOperator } from "./inoperator";

export class Addition extends InOperator {
    protected tokens: string[] = ["+"];
    protected name: string = "ADDITION";
    protected inputTypes: string[][] = [
        ["number", "number"]
    ];
    protected localOperate(args: Value[], inputType: number): Value {
        switch (inputType) {
            case 0: return (args[0] as NumberValue).add(args[1] as NumberValue);
            default: throw new Error("how the hell did this happen");
        }
    }
}