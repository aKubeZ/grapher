import type { Drawer } from "./drawer";

export abstract class Graph {
    protected color: string;
    protected thickness: number;
    public constructor(color: string, thickness: number) {
        this.color = color;
        this.thickness = thickness;
    }

    public setColor(color: string): void { this.color = color; }
    public setThickness(thickness: number): void { this.thickness = thickness; }
    public setDrawer(drawer: Drawer): void { drawer = drawer; }
    public plot(drawer: Drawer): void {
        if (drawer.getStartX() > drawer.getEndX() || drawer.getStartY() > drawer.getEndY()) return;
        drawer.setColor(this.color);
        drawer.setThickness(this.thickness);
    }
}