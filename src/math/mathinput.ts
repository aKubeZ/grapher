export interface MathInput {
    clear(): void;
    toString(): string;
    moveCursorRight(): void;
    moveCursorLeft(): void;
    selectAll(): void;
}