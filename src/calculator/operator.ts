import { type Value } from "./value";

export abstract class Operator {
    protected abstract tokens: string[];
    protected abstract name: string;
    protected abstract type: string;
    protected abstract inputTypes: string[][]; // array of types
    public operate(args: Value[]): Value { // func to make sure the types match
        for (let i = 0; i < this.inputTypes.length; i++) {
            const inputType = <string[]> this.inputTypes[i];
            if (args.length !== inputType.length) continue;
            let useInput: boolean = true;
            for (let j = 0; j < args.length; j++) {
                if (args[j] !== inputType[j]) {
                    useInput = false;
                    break;
                }
            }

            if (useInput) return this.localOperate(args, i);
        }

        throw new Error("Input type not found.");
    }

    protected abstract localOperate(args: Value[], inputType: number): Value; // the actual thing that claculates
    getName(): string { return this.name; }
    getType(): string { return this.type; }
    getTokens(): string[] { return this.tokens; }
}