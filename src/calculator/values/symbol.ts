import { type Value } from "../value.js";

/**
 * symbols,, like variables
 */
export class SymbolValue implements Value {
    public static type: string = "symbol";
    protected tokenName: string;
    constructor(name: string) {
        this.tokenName = name;
    }
    
    public name(): string { return this.tokenName; }

    public getType(): string {
        return SymbolValue.type;
    }
}