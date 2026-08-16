import type { Drawer } from "./drawer.js";
import { Graph } from "./graph.js";

export class FunctionGraph extends Graph {
    private f: (x: number) => number;
    public constructor(f: (x: number) => number, color: string, thickness: number) {
        super(color, thickness);
        this.f = f;
    }

    public setFunction(f: (x: number) => number) { this.f = f; }
    public plot(drawer: Drawer): void {
        super.plot(drawer);
        const dx = drawer.getDX();
        const startX = drawer.getStartX();
        const endX = drawer.getEndX();
        const startY = drawer.getStartY();
        const endY = drawer.getEndY();

        for (let x = startX; x <= endX + dx; x += dx) {
            const y = this.f(x);
            const yDefined = y && !Number.isNaN(y);
            if (!drawer.isDrawing() && yDefined)
                drawer.start(x, y);
            else if (drawer.isDrawing() && yDefined)
                drawer.moveTo(x, y);
            else if (drawer.isDrawing() && !yDefined)
                drawer.end();
        }

        drawer.end();
    }
}