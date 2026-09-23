import type { InputMathToken } from "./math.js";

export class MathElement {
    private element: HTMLElement;
    private token: InputMathToken;
    private args: MathElement[][] = [];
    private argumentElements: HTMLElement[] = [];

    public constructor(token: InputMathToken) {
        this.token = token;
        this.element = document.createElement("math-token");
        this.element.setAttribute('math-name', token.name);
        this.element.setAttribute('math-arg-count', `${token.args.length}`);
        this.initElement();
    }

    public initElement(): void {
        this.element.textContent = this.token.name;
        this.generateArguments();
    }

    public generateArguments(): void {
        for (const argumentTokens of this.token.args) {
            const argumentElement = document.createElement("math-argument");
            this.argumentElements.push(argumentElement);

            const argument: MathElement[] = [];
            this.args.push(argument);

            for (const token of argumentTokens) {
                const mathElement = token.mathElement || new MathElement(token);
                argument.push(mathElement);
                argumentElement.appendChild(mathElement.getElement());
            }

            this.element.appendChild(argumentElement);
        }
    }

    public getElement(): HTMLElement { return this.element; }
}

export class MathRender {
    private element: HTMLElement;
    private container: HTMLElement;
    private mathElements: MathElement[];
    private mathTokens: InputMathToken[];

    public constructor(element: HTMLElement, mathTokens: InputMathToken[]) {
        this.mathTokens = mathTokens;
        this.element = element;
        this.container = document.createElement("math-container");
        this.element.appendChild(this.container);

        this.mathElements = [];
        this.update();
    }

    public update(): void {
        this.mathElements = [];
        this.container.textContent = "";
        for (let i = 0; i < this.mathTokens.length; i++) {
            
            const token = this.mathTokens[i]!;
            const mathElement = token.mathElement || new MathElement(token);
            this.mathElements.push(mathElement);
            this.container.appendChild(mathElement.getElement());
        }
    }
}