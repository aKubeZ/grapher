import type { Drawer } from "./drawer.js";
import { FunctionGraph } from "./functiongraph.js";
import type { Graph } from "./graph.js";

class ContextDrawer implements Drawer {
    private color: string | undefined ;
    private fillColor: string | undefined;
    private thickness: number = 0;
    private context: CanvasRenderingContext2D;
    private x = 0;
    private y = 0;
    private drawing = false;
    public dx = 1;
    public dy = 1;
    public startX: number = 0;
    public endX: number = 0;
    public startY: number = 0;
    public endY: number = 0;
    public scaleX: number = 0;
    public scaleY: number = 0;
    public centerX: number = 0;
    public centerY: number = 0;

    constructor(context: CanvasRenderingContext2D) {
        this.context = context;
    }

    private toPixel(x: number, y: number): {x: number; y: number} {
        return {
            x: Math.round(this.centerX + this.scaleX * x),
            y: Math.round(this.centerY + this.scaleY * y),
        };
    }

    // interface methods
    public setColor(color: string | undefined): void { this.color = color; }
    public setFillColor(color: string | undefined): void { this.fillColor = color; }
    public setThickness(thickness: number): void { this.thickness = thickness; }
    public getStartX(): number { return this.startX; }
    public getEndX(): number { return this.endX; }
    public getStartY(): number { return this.startY; }
    public getEndY(): number { return this.endY; }
    public getDX(): number { return this.dx; }
    public getDY(): number { return this.dy; }
    public getX(): number { return this.x; }
    public getY(): number { return this.y; }

    private prevPixelX : number | undefined;
    private prevPixelY : number | undefined;

    public moveTo(x: number, y: number): void {
        const pixelCoords = this.toPixel(x, y);
        if (pixelCoords.x === this.prevPixelX && this.prevPixelY === this.y) return;
        this.prevPixelX = pixelCoords.x;
        this.prevPixelY = pixelCoords.y;
        this.x = x;
        this.y = y;

        if (this.drawing)
            this.context.lineTo(pixelCoords.x, pixelCoords.y);
        else
            this.context.lineTo(pixelCoords.x, pixelCoords.y);
    }

    public start(x: number, y: number): void {
        this.drawing = true;
        this.prevPixelX = undefined;
        this.prevPixelY = undefined;
        this.context.beginPath();
        this.moveTo(x, y);
    }

    public end(): void {
        this.drawing = false;
        if (this.color)
            this.context.strokeStyle = this.color;
        if (this.thickness)
            this.context.lineWidth = this.thickness;
        if (this.fillColor) {
            this.context.fillStyle = this.fillColor;
            this.context.fill("evenodd");
        }

        this.context.stroke();
    }

    public reset(): void {
        if (this.drawing) this.end();
        this.color = undefined;
        this.fillColor = undefined;
        this.thickness = 0;
    }

    public isDrawing(): boolean { return this.drawing; }
}

export class Grapher {
    private element: HTMLCanvasElement;
    private context: CanvasRenderingContext2D;
    private centerX: number;
    private centerY: number;
    private scaleX: number =  50;
    private scaleY: number = -50;
    private graphs: Graph[] = [];
    private drawer: ContextDrawer;

    private gridAxesWidth: number = 2;
    private gridLineWidth: number = 1;
    private minorMinorGridLineColor: string = '#222';
    private minorGridLineColor: string = '#444';
    private gridLineColor: string = '#777';
    private axesColor: string = '#fff';

    constructor(element: HTMLElement) {
        if (!element) throw new Error("Graph not found");
        if (element.nodeName !== "CANVAS") throw new Error("Graph element not canvas");
        this.element = element as HTMLCanvasElement;
        this.context = this.element.getContext('2d') as CanvasRenderingContext2D;
        const rect = this.element.getBoundingClientRect();
        this.centerX = Math.round(rect.width / 2);
        this.centerY = Math.round(rect.height / 2);
        this.drawer = new ContextDrawer(this.context);

        this.initCanvas();
    }

    private initCanvas() {
        addEventListener('resize', () => this.resizeCanvas());

        let dragging = false;
        this.element.addEventListener('mousedown', (event) => {
            dragging = true;
        });

        window.addEventListener('mouseup', (event) => {
            dragging = false;
        });

        window.addEventListener('mousemove', (event) => {
            if (!dragging) return;
            this.centerX += event.movementX;
            this.centerY += event.movementY;
            this.update();
        });

        this.element.addEventListener('wheel', (event) => {
            const mult = (1.1) ** (-event.deltaY / 100);
            // console.log(maxScaleX);
            // if (mult < 1 || (Math.abs(this.scaleX) < maxScaleX && Math.abs(this.scaleY) < maxScaleY)) {
                this.centerX = event.offsetX + (this.centerX - event.offsetX) * mult;
                this.scaleX *= mult;
                this.centerY = event.offsetY + (this.centerY - event.offsetY) * mult;
                this.scaleY *= mult;
            // }

            this.update();
        });

        this.addGraph(new FunctionGraph(Math.sin, '#0f9', 2));
        this.resizeCanvas();
        this.update();
    }

    private resizeCanvas() {
        const rect = this.element.getBoundingClientRect();
        this.element.width = Math.round(rect.width);
        this.element.height = Math.round(rect.height);
        this.update();
    }
    
    public addGraph(graph: Graph) {
        this.graphs.push(graph);
    }

    private setColor(colorCount: number) {
            colorCount++;
            if (colorCount === 100) {
                this.context.fillStyle = this.gridLineColor;
                return 0;
            } else if (colorCount % 10 === 0) {
                this.context.fillStyle = this.minorGridLineColor;
            } else this.context.fillStyle = this.minorMinorGridLineColor;
            return colorCount;
    }

    public update() {
        this.context.clearRect(
            0, 0, this.element.width, this.element.height
        );

        const startX = (0 - this.centerX) / this.scaleX;
        const endX   = (this.element.width - this.centerX) / this.scaleX;
        const endY   = (0 - this.centerY) / this.scaleY;
        const startY = (this.element.height - this.centerY) / this.scaleY;

        // i think the math for this is wrong but who gives a shitttt
        const gridLineXDistance =
            10 ** (1 - Math.floor(Math.log10(Math.abs(this.scaleX))));
        const gridLineYDistance =
            10 ** (1 - Math.floor(Math.log10(Math.abs(this.scaleY))));

        let colorCount = 0;
        for (let x = -gridLineXDistance; x >= startX; x -= gridLineXDistance) {
            const pixelX = Math.round(this.centerX + this.scaleX * x);

            colorCount = this.setColor(colorCount);
            this.context.fillRect(
                pixelX - (this.gridLineWidth >> 1),
                0,
                this.gridLineWidth,
                this.element.height,
            );
        }

        colorCount = 0;
        for (let x = gridLineXDistance; x <= endX; x += gridLineXDistance) {
            const pixelX = Math.round(this.centerX + this.scaleX * x);
            colorCount = this.setColor(colorCount);
            this.context.fillRect(
                pixelX - (this.gridLineWidth >> 1),
                0,
                this.gridLineWidth,
                this.element.height,
            );
        }

        colorCount = 0;
        for (let y = -gridLineYDistance; y >= startY; y -= gridLineYDistance) {
            const pixelY = Math.round(this.centerY + this.scaleY * y);
            colorCount = this.setColor(colorCount);
            this.context.fillRect(
                0,
                pixelY - (this.gridLineWidth >> 1),
                this.element.width,
                this.gridLineWidth,
            );
        }

        colorCount = 0;
        for (let y = gridLineYDistance; y <= endY; y += gridLineYDistance) {
            const pixelY = Math.round(this.centerY + this.scaleY * y);
            colorCount = this.setColor(colorCount);
            this.context.fillRect(
                0,
                pixelY - (this.gridLineWidth >> 1),
                this.element.width,
                this.gridLineWidth,
            );
        }

        this.context.fillStyle = this.axesColor;
        this.context.fillRect(
            0,
            this.centerY - (this.gridAxesWidth >> 1),
            this.element.width,
            this.gridAxesWidth
        );

        this.context.fillRect(
            this.centerX - (this.gridAxesWidth >> 1),
            0,
            this.gridAxesWidth,
            this.element.height,
        );

        this.drawer.dx = 0.1 / Math.abs(this.scaleX);
        this.drawer.dy = 0.1 / Math.abs(this.scaleY);
        this.drawer.startX = startX;
        this.drawer.endX = endX;
        this.drawer.startY = startY;
        this.drawer.endY = endY;
        this.drawer.centerX = this.centerX;
        this.drawer.centerY = this.centerY;
        this.drawer.scaleX = this.scaleX;
        this.drawer.scaleY = this.scaleY;
        for (const graph of this.graphs) {
            graph.plot(this.drawer);
            this.drawer.reset();
        }
    }
}