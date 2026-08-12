type FunctionGraph = {
    f: (x: number) => number;
    color: string;
    lineWidth: number;
};

export class Graph {
    private element: HTMLCanvasElement;
    private context: CanvasRenderingContext2D;
    private centerX: number;
    private centerY: number;
    private scaleX: number =  50;
    private scaleY: number = -50;
    private functionGraphs: FunctionGraph[] = [];
    private gridAxesWidth: number = 2;
    private gridLineWidth: number = 1;
    private minorMinorGridLineColor: string = '#222';
    private minorGridLineColor: string = '#444';
    private gridLineColor: string = '#777';
    private axesColor: string = '#fff';

    constructor(element: HTMLElement) {
        if (!element) throw new Error("Graph not found");
        if (element.nodeName !== "CANVAS") throw new Error("Graph element not canvas");
        this.element = <HTMLCanvasElement> element;
        this.context = <CanvasRenderingContext2D> this.element.getContext('2d');
        const rect = this.element.getBoundingClientRect();
        this.centerX = Math.round(rect.width / 2);
        this.centerY = Math.round(rect.height / 2);
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

        this.element.addEventListener('wheel', (event) => {
            const mult = (1.1) ** (-event.deltaY / 100);
            this.centerX = event.offsetX + (this.centerX - event.offsetX) * mult;
            this.centerY = event.offsetY + (this.centerY - event.offsetY) * mult;
            this.scaleX *= mult;
            this.scaleY *= mult;
            this.updateCanvas();
        });

        this.addFunctionGraph({
            f: (x) => Math.exp(-(x ** 2)),
            color: '#f00',
            lineWidth: 3,
        })

        this.addFunctionGraph({
            f: (x) => 1 / x,
            color: '#0f0',
            lineWidth: 3,
        })

        this.addFunctionGraph({
            f: (x) => Math.sqrt(x),
            color: '#00f',
            lineWidth: 3,
        })

        this.resizeCanvas();
        this.updateCanvas();
    }

    private resizeCanvas() {
        const rect = this.element.getBoundingClientRect();
        this.element.width = Math.round(rect.width);
        this.element.height = Math.round(rect.height);
        this.updateCanvas();
    }

    public addFunctionGraph(functionGraph: FunctionGraph) {
        this.functionGraphs.push(functionGraph);
        this.updateCanvas();
    }

    private toPixel(x: number, y: number): {x: number; y: number} {
        return {
            x: Math.round(this.centerX + this.scaleX * x),
            y: Math.round(this.centerY + this.scaleY * y),
        };
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

    private updateCanvas() {
        this.context.clearRect(
            0, 0, this.element.width, this.element.height
        );

        const startX = (0 - this.centerX) / this.scaleX;
        const endX   = (this.element.width - this.centerX) / this.scaleX;
        const endY   = (0 - this.centerY) / this.scaleY;
        const startY = (this.element.height - this.centerY) / this.scaleY;

        const gridLineXDistance =
            10 ** (1 - Math.floor(Math.log10(Math.abs(this.scaleX))));
        const gridLineYDistance =
            10 ** (1 - Math.floor(Math.log10(Math.abs(this.scaleY))));

        console.log((endX - startX) / gridLineXDistance);
        
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

        const dx = 1 / this.scaleX;
        const differenceTolerance = 100;
        for (const functionGraph of this.functionGraphs) {
            this.context.strokeStyle = functionGraph.color;
            this.context.lineWidth = functionGraph.lineWidth;
            this.context.beginPath();
            this.context.moveTo(0, this.centerY + this.scaleY * functionGraph.f(startX));
            let prevY: number | undefined;
            let prevYDiff: number | undefined;
            let maySkip: boolean = false;
            for (let x = startX; x <= endX + dx; x += dx) {
                const y = functionGraph.f(x);
                const point = this.toPixel(x, y);
                const yDiff = prevY ? y - prevY : undefined;
                const nextMaySkip = (y > endY || y < startY);

                if (
                    (maySkip && nextMaySkip) || (
                        prevYDiff && yDiff &&
                        Math.abs(yDiff) >= differenceTolerance &&
                        (Math.sign(prevYDiff) * Math.sign(yDiff) === -1)
                    )
                ) {
                    this.context.stroke();
                    this.context.beginPath();
                    this.context.moveTo(point.x, point.y);
                } else
                    this.context.lineTo(point.x, point.y);
                
                maySkip = nextMaySkip;
                prevYDiff = yDiff;
                prevY = y;
            }

            this.context.stroke();
        }
    }
}