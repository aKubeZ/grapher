export interface Drawer {
    setColor(color: string | undefined): void;
    setFillColor(color: string | undefined): void;
    setThickness(thickness: number): void;
    getStartX(): number;
    getEndX(): number;
    getStartY(): number;
    getEndY(): number;
    getDX(): number;
    getDY(): number;
    getX(): number;
    getY(): number;
    moveTo(x: number, y: number): void;
    start(x: number, y: number): void;
    end(): void;
    isDrawing(): boolean;
}