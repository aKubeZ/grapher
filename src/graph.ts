export class graph {
    private element: HTMLCanvasElement;
    private context: CanvasRenderingContext2D;
    private offsetX: number;
    private offsetY: number;
    constructor(element: HTMLElement) {
        if (!element) throw new Error("Graph not found");
        if (element.nodeName !== "CANVAS") throw new Error("Graph element not canvas");
        this.element = <HTMLCanvasElement> element;
        this.context = <CanvasRenderingContext2D> this.element.getContext('2d');
        const rect = this.element.getBoundingClientRect();
        this.offsetX = rect.width / 2;
        this.offsetY = rect.height / 2;
        this.initCanvas();
    }

    initCanvas() {
        this.context.fillStyle = 'red';
        this.context.fillRect(30, 30, 50, 50);
    }
}