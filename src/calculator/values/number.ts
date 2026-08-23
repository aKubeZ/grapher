import { type Value } from "../value.js";

/**
 * real/cmplx numbers, yea very self explanatory
 */
export class NumberValue implements Value {
    public static type: string = "number";
    private realValue: number;
    private imagValue: number;
    constructor(realValue: number, imagValue?: number) {
        this.realValue = realValue;
        this.imagValue = imagValue ? imagValue : 0;
    }

    real(): number {
        return this.realValue;
    }

    imag(): number {
        return this.imagValue;
    }

    getType(): string {
        return "number";
    }
}