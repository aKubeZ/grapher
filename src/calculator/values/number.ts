/**
 * real/cmplx numbers, yea very self explanatory
 */
import { type Value } from "../value";

export class NumberValue implements Value {
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

    conjugate() {
        return new NumberValue(
            this.realValue,
            -this.imagValue
        );
    }

    add(value: NumberValue) {
        return new NumberValue(
            this.realValue + value.real(),
            this.imagValue + value.imag()
        );
    }

    subtract(value: NumberValue) {
        return new NumberValue(
            this.realValue - value.real(),
            this.imagValue - value.imag()
        );
    }

    multiply(value: NumberValue) {
        return new NumberValue(
            this.realValue * value.real() - this.imagValue * value.imag(),
            this.realValue * value.imag() + this.imagValue * value.real(),
        );
    }

    divide(value: NumberValue) {
        const multiplier = 1 / ((value.real() ** 2) + (value.imag() ** 2));
        return new NumberValue(
            (this.realValue * value.real() + this.imagValue * value.imag()) * multiplier,
            (this.imagValue * value.real() - this.realValue * value.imag()) * multiplier
        );
    }

    exp() {
        const multiplier = Math.exp(this.realValue);
        return new NumberValue(
            Math.cos(this.imagValue) * multiplier,
            Math.sin(this.imagValue) * multiplier
        );
    }
}