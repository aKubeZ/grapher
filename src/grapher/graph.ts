type FunctionGraph = {
    f: (x: number) => number;
    color: string;
};

export class Graph {
    private element: HTMLCanvasElement;
    private context: CanvasRenderingContext2D;
    private centerX: number;
    private centerY: number;
    private scale: number = 1;
    private functionGraphs: FunctionGraph[] = [];

    constructor(element: HTMLElement) {
        if (!element) throw new Error("Graph not found");
        if (element.nodeName !== "CANVAS") throw new Error("Graph element not canvas");
        this.element = <HTMLCanvasElement> element;
        this.context = <CanvasRenderingContext2D> this.element.getContext('2d');
        const rect = this.element.getBoundingClientRect();
        this.centerX = rect.width / 2;
        this.centerY = rect.height / 2;
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
            this.updateCanvas();
        });

        window.addEventListener('scroll', (event) => {
            // this.scale *= Math.pow(1.1, event.);
            this.updateCanvas();
        });

        this.resizeCanvas();
        this.updateCanvas();
    }

    private resizeCanvas() {
        const rect = this.element.getBoundingClientRect();
        this.element.width = rect.width;
        this.element.height = rect.height;
    }

    public addFunctionGraph(functionGraph: FunctionGraph) {
        this.functionGraphs.push(functionGraph);
        this.updateCanvas();
    }

    private updateCanvas() {
        this.context.clearRect(
            0, 0, this.element.width, this.element.height
        );

        // for (const functionGraph of this.functionGraphs) {
        //     this.context.fillStyle = functionGraph.color;
        //     const startX = this.centerX
        // }

        this.context.fillStyle = '#333';
        const r = 2;
        this.context.fillRect(
            0,
            this.centerY - r,
            this.element.width,
            2 * r,
        );

        this.context.fillRect(
            this.centerX - r,
            0,
            2 * r,
            this.element.height,
        );
    }
}