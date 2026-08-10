import * as mj from "./mathjax.js";
import * as mt from "./mathtext.js";

export class MathInput {
    public static defaultShorthands: mt.Shorthand[] = [
        // VERY IMPROTATN STUFF
        mt.shorthand(mt.mathTokens('('), mt.mathBrackets('(', ')', new mt.MathText([]))),
        mt.shorthand(mt.mathTokens('['), mt.mathBrackets('[', ']', new mt.MathText([]))),
        mt.shorthand([mt.mathToken('\\{ ')], mt.mathBrackets('\\{ ', '\\} ', new mt.MathText([]))),
        mt.shorthand(mt.mathTokens('|'), mt.mathBrackets('\\lvert ', '\\rvert ', new mt.MathText([]))),
        mt.shorthand(mt.mathTokens('sqrt'), mt.mathToken('\\sqrt ', [new mt.MathText([])])),
        mt.shorthand(mt.mathTokens('/'), mt.mathToken('\\frac ', [new mt.MathText([]), new mt.MathText([])])),
        mt.shorthand(mt.mathTokens('^'), mt.mathToken('^', [new mt.MathText([])])),
        mt.shorthand(mt.mathTokens('_'), mt.mathToken('_', [new mt.MathText([])])),
        mt.shorthand(mt.mathTokens('ooo'), mt.mathToken('\\infty ')),
        mt.shorthand(mt.mathTokens('dd'), mt.mathToken('\\dd ')),
        mt.shorthand(mt.mathTokens('int'), mt.mathToken('\\int ')),
        mt.shorthand(mt.mathTokens('!=='), mt.mathToken('\\neq ')),
        mt.shorthand(mt.mathTokens('<='), mt.mathToken('\\leq ')),
        mt.shorthand(mt.mathTokens('>='), mt.mathToken('\\geq ')),
        mt.shorthand(mt.mathTokens('"'), mt.mathToken('\\mathrm ', [new mt.MathText([])])),
        // TRIG STUFF
        mt.shorthand(mt.mathTokens('arcsin'), mt.mathToken('\\arcsin ')),
        mt.shorthand(mt.mathTokens('arccos'), mt.mathToken('\\arccos ')),
        mt.shorthand(mt.mathTokens('arctan'), mt.mathToken('\\arctan ')),
        mt.shorthand(mt.mathTokens('arcsec'), mt.mathToken('\\operatorname{arcsec}')),
        mt.shorthand(mt.mathTokens('arccsc'), mt.mathToken('\\operatorname{arccsc}')),
        mt.shorthand(mt.mathTokens('arccot'), mt.mathToken('\\operatorname{arccot}')),
        mt.shorthand(mt.mathTokens('sin'), mt.mathToken('\\sin ')),
        mt.shorthand(mt.mathTokens('cos'), mt.mathToken('\\cos ')),
        mt.shorthand(mt.mathTokens('tan'), mt.mathToken('\\tan ')),
        mt.shorthand(mt.mathTokens('sec'), mt.mathToken('\\sec ')),
        mt.shorthand(mt.mathTokens('csc'), mt.mathToken('\\csc ')),
        mt.shorthand(mt.mathTokens('cot'), mt.mathToken('\\cot ')),
        mt.shorthand([mt.mathToken('\\arcsin '), mt.mathToken('h')], mt.mathToken('\\operatorname{arcsinh}')),
        mt.shorthand([mt.mathToken('\\arccos '), mt.mathToken('h')], mt.mathToken('\\operatorname{arccosh}')),
        mt.shorthand([mt.mathToken('\\arctan '), mt.mathToken('h')], mt.mathToken('\\operatorname{arctanh}')),
        mt.shorthand([mt.mathToken('\\operatorname{arcsec}'), mt.mathToken('h')], mt.mathToken('\\operatorname{arcsech}')),
        mt.shorthand([mt.mathToken('\\operatorname{arccsc}'), mt.mathToken('h')], mt.mathToken('\\operatorname{arccsch}')),
        mt.shorthand([mt.mathToken('\\operatorname{arccot}'), mt.mathToken('h')], mt.mathToken('\\operatorname{arccoth}')),
        mt.shorthand([mt.mathToken('\\sin '), mt.mathToken('h')], mt.mathToken('\\sinh ')),
        mt.shorthand([mt.mathToken('\\cos '), mt.mathToken('h')], mt.mathToken('\\cosh ')),
        mt.shorthand([mt.mathToken('\\tan '), mt.mathToken('h')], mt.mathToken('\\tanh ')),
        mt.shorthand([mt.mathToken('\\sec '), mt.mathToken('h')], mt.mathToken('\\operatorname{sech}')),
        mt.shorthand([mt.mathToken('\\csc '), mt.mathToken('h')], mt.mathToken('\\operatorname{csch}')),
        mt.shorthand([mt.mathToken('\\cot '), mt.mathToken('h')], mt.mathToken('\\coth ')),
        // @ SHORTHAND GREEK LETTERS YAYAYAAYAYAYAYA
        mt.shorthand(mt.mathTokens('@a'), mt.mathToken('\\alpha ')),
        mt.shorthand(mt.mathTokens('@b'), mt.mathToken('\\beta ')),
        mt.shorthand(mt.mathTokens('@g'), mt.mathToken('\\gamma ')),
        mt.shorthand(mt.mathTokens('@G'), mt.mathToken('\\Gamma ')),
        mt.shorthand(mt.mathTokens('@d'), mt.mathToken('\\delta ')),
        mt.shorthand(mt.mathTokens('@D'), mt.mathToken('\\Delta ')),
        mt.shorthand(mt.mathTokens('@e'), mt.mathToken('\\epsilon ')),
        mt.shorthand(mt.mathTokens('@E'), mt.mathToken('\\varepsilon ')),
        mt.shorthand(mt.mathTokens('@z'), mt.mathToken('\\zeta ')),
        mt.shorthand(mt.mathTokens('@h'), mt.mathToken('\\eta ')),
        mt.shorthand(mt.mathTokens('@t'), mt.mathToken('\\theta ')),
        mt.shorthand(mt.mathTokens('@y'), mt.mathToken('\\vartheta ')),
        mt.shorthand(mt.mathTokens('@T'), mt.mathToken('\\Theta ')),
        mt.shorthand(mt.mathTokens('@i'), mt.mathToken('\\iota ')),
        mt.shorthand(mt.mathTokens('@k'), mt.mathToken('\\kappa ')),
        mt.shorthand(mt.mathTokens('@l'), mt.mathToken('\\lambda ')),
        mt.shorthand(mt.mathTokens('@L'), mt.mathToken('\\Lambda ')),
        mt.shorthand(mt.mathTokens('@m'), mt.mathToken('\\mu ')),
        mt.shorthand(mt.mathTokens('@n'), mt.mathToken('\\nu ')),
        mt.shorthand(mt.mathTokens('@x'), mt.mathToken('\\xi ')),
        mt.shorthand(mt.mathTokens('@X'), mt.mathToken('\\Xi ')),
        mt.shorthand(mt.mathTokens('@p'), mt.mathToken('\\pi ')),
        mt.shorthand(mt.mathTokens('@P'), mt.mathToken('\\Pi ')),
        mt.shorthand(mt.mathTokens('@r'), mt.mathToken('\\rho ')),
        mt.shorthand(mt.mathTokens('@R'), mt.mathToken('\\varrho ')),
        mt.shorthand(mt.mathTokens('@s'), mt.mathToken('\\sigma ')),
        mt.shorthand(mt.mathTokens('@S'), mt.mathToken('\\Sigma ')),
        mt.shorthand(mt.mathTokens('@j'), mt.mathToken('\\tau ')),
        mt.shorthand(mt.mathTokens('@u'), mt.mathToken('\\upsilon ')),
        mt.shorthand(mt.mathTokens('@U'), mt.mathToken('\\Upsilon ')),
        mt.shorthand(mt.mathTokens('@f'), mt.mathToken('\\phi ')),
        mt.shorthand(mt.mathTokens('@w'), mt.mathToken('\\varphi ')),
        mt.shorthand(mt.mathTokens('@F'), mt.mathToken('\\Phi ')),
        mt.shorthand(mt.mathTokens('@c'), mt.mathToken('\\chi ')),
        mt.shorthand(mt.mathTokens('@v'), mt.mathToken('\\psi ')),
        mt.shorthand(mt.mathTokens('@V'), mt.mathToken('\\Psi ')),
        mt.shorthand(mt.mathTokens('@o'), mt.mathToken('\\omega ')),
        mt.shorthand(mt.mathTokens('@O'), mt.mathToken('\\Omega ')),
        // COMMON GREEK LETTERS AAAAAAAAA
        mt.shorthand(mt.mathTokens('alpha'), mt.mathToken('\\alpha ')),
        mt.shorthand(mt.mathTokens('beta'), mt.mathToken('\\beta ')),
        mt.shorthand(mt.mathTokens('gamma'), mt.mathToken('\\gamma ')),
        mt.shorthand(mt.mathTokens('delta'), mt.mathToken('\\delta ')),
        mt.shorthand(mt.mathTokens('Delta'), mt.mathToken('\\Delta ')),
        mt.shorthand(mt.mathTokens('pi'), mt.mathToken('\\pi ')),
        mt.shorthand(mt.mathTokens('phi'), mt.mathToken('\\varphi ')), // varphi just looks miels cooler ok
        mt.shorthand(mt.mathTokens('omega'), mt.mathToken('\\omega ')),
        mt.shorthand(mt.mathTokens('Omega'), mt.mathToken('\\Omega ')),
        // OTHER FUNCTIONS STUFF
        mt.shorthand(mt.mathTokens('log'), mt.mathToken('\\log ')),
        mt.shorthand(mt.mathTokens('exp'), mt.mathToken('\\exp ')),
        mt.shorthand(mt.mathTokens('ln'), mt.mathToken('\\ln ')),
        mt.shorthand(mt.mathTokens('*'), mt.mathToken('\\cdot ')),
        mt.shorthand(mt.mathTokens('\\'), mt.mathToken('\\backslash ')),
        mt.shorthand(mt.mathTokens('cross'), mt.mathToken('\\times ')),
        mt.shorthand(mt.mathTokens('times'), mt.mathToken('\\times ')),
        mt.shorthand(mt.mathTokens('invs'), mt.mathToken('^{-1}')),
        mt.shorthand(mt.mathTokens('tpose'), mt.mathToken('\\!^{\\top}\\!')),
        mt.shorthand(mt.mathTokens('sum'), mt.mathToken('\\sum ')),
        mt.shorthand(mt.mathTokens('prod'), mt.mathToken('\\prod ')),
    ];

    public static mathInput(element: HTMLElement): void {
        MathInput.mathInputs.push(new MathInput(element));
    }

    private static mathInputs: MathInput[] = [];

    private math: mt.MathText = new mt.MathText([]);
    
    private element: HTMLElement;
    private cursorIndex: number = 0;
    private cursorRange: number = 0;
    private cursorDirection: number = 0;
    private renderingLatex: string = "";

    public constructor(element: HTMLElement) {
        this.math.setShorthands(MathInput.defaultShorthands);
        this.element = element;
        this.initElement();
        this.updateString(true);
    }

    private initElement(): void {
        this.element.contentEditable = "plaintext-only";
        this.element.spellcheck = false;
        this.element.addEventListener("keydown", (event) => {
            event.preventDefault();
            switch (event.key) {
                case "ArrowLeft": {
                    if (event.ctrlKey && event.shiftKey) {
                        const newSelection = this.math.expandSelection(0, this.cursorIndex);
                        if (newSelection[0] === newSelection[1]) break;
                        this.cursorIndex = newSelection[0];
                        this.cursorRange = newSelection[1] - newSelection[0];
                        this.cursorDirection = -1;
                    } else if (event.ctrlKey) {
                        this.collapseCursor();
                        this.cursorIndex = 0;
                    } else if (event.shiftKey) {
                        if (this.cursorIndex === 0) break;
                        let newSelection: [number, number];
                        if (this.cursorDirection === 1) {
                            this.cursorRange--;
                            if (this.cursorRange === 0) this.collapseCursor();
                            newSelection = this.math.expandSelection(this.cursorIndex, this.cursorIndex + this.cursorRange);
                        } else {
                            this.cursorDirection = -1;
                            this.cursorRange++;
                            this.cursorIndex--;
                            newSelection = this.math.expandSelection(this.cursorIndex, this.cursorIndex + this.cursorRange);
                        }

                        this.cursorIndex = newSelection[0];
                        this.cursorRange = newSelection[1] - newSelection[0];
                    } else if (this.cursorDirection) {
                        this.collapseCursor();
                    } else {
                        if (this.cursorIndex === 0) break;
                        this.cursorIndex--;
                    }
                    
                    this.updateString();
                } break;
                case "ArrowRight": {
                    if (event.ctrlKey && event.shiftKey) {
                        const newSelection = this.math.expandSelection(this.cursorIndex, this.math.getSize() - 1);
                        if (newSelection[0] === newSelection[1]) break;
                        this.cursorIndex = newSelection[0];
                        this.cursorRange = newSelection[1] - newSelection[0];
                        this.cursorDirection = 1;
                    } else if (event.ctrlKey) {
                        this.collapseCursor();
                        this.cursorIndex = this.math.getSize() - 1;
                    } else if (event.shiftKey) {
                        if (this.cursorIndex + this.cursorRange === this.math.getSize() - 1) break;
                        let newSelection: [number, number];
                        if (this.cursorDirection === -1) {
                            this.cursorRange--;
                            this.cursorIndex++;
                            if (this.cursorRange === 0) this.collapseCursor();
                            newSelection = this.math.expandSelection(this.cursorIndex, this.cursorIndex + this.cursorRange);
                        } else {
                            this.cursorRange++;
                            this.cursorDirection = 1;
                            newSelection = this.math.expandSelection(this.cursorIndex, this.cursorIndex + this.cursorRange);
                        }

                        this.cursorIndex = newSelection[0];
                        this.cursorRange = newSelection[1] - newSelection[0];
                    } else if (this.cursorDirection) {
                        this.cursorIndex = this.cursorIndex + this.cursorRange;
                        this.collapseCursor();
                    } else {
                        if (this.cursorIndex + this.cursorRange === this.math.getSize() - 1) break;
                        this.cursorIndex++;
                    }
                    
                    this.updateString();
                } break;
                case "Backspace": {
                    if (event.ctrlKey) {
                        this.cursorIndex = 0;
                        this.math.clear();
                    } else if (this.cursorDirection) {
                        this.cursorIndex = this.math.delete(this.cursorIndex, this.cursorIndex + this.cursorRange);
                    } else {
                        if (this.cursorIndex === 0) break;
                        this.cursorIndex = this.math.backspace(this.cursorIndex);
                    }

                    this.collapseCursor();
                    this.updateString();
                } break;
                case "Delete": {
                    if (event.ctrlKey) {
                        this.cursorIndex = 0;
                        this.math.clear();
                    } else if (this.cursorDirection) {
                        this.cursorIndex = this.math.delete(this.cursorIndex, this.cursorIndex + this.cursorRange);
                        this.collapseCursor();
                    } else {
                        if (this.cursorIndex === this.math.getSize() - 1) break;
                        this.cursorIndex = this.math.backspace(this.cursorIndex + 1);
                    }

                    this.collapseCursor();
                    this.updateString();
                } break;
                case "Tab": {
                    if (event.shiftKey)
                        this.cursorIndex = this.math.tabIndex(this.cursorIndex, "pre");
                    else
                        this.cursorIndex = this.math.tabIndex(this.cursorIndex, "post");
                    
                    this.collapseCursor();
                    this.updateString();
                } break;
                case "Space": {
                    this.cursorIndex = this.math.replaceInsertToken(this.cursorIndex, this.cursorIndex + this.cursorRange, "\\ ");
                    this.collapseCursor();
                    this.updateString();
                } break;
                default: {
                    if (event.key.length !== 1) return;

                    const cursorStart = this.cursorIndex;
                    const cursorEnd = this.cursorIndex + this.cursorRange;
                    this.collapseCursor();

                    if (event.key === ")" || event.key === "]" || event.key === "}" || event.key === "") {
                        if (this.cursorIndex === this.math.getSize() - 1) return;
                        this.cursorIndex++;
                        this.updateString();
                        return;
                    }

                    if ((event.key === "c" || event.key === "C") && event.ctrlKey) {
                        navigator.clipboard.writeText(this.math.toString());
                        return;
                    }
                    
                    if ((event.key === "a" || event.key === "A") && event.ctrlKey) {
                        this.cursorIndex = 0;
                        this.cursorRange = this.math.getSize() - 1;
                        this.cursorDirection = 1;
                        this.updateString();
                        return;
                    }

                    this.cursorIndex = this.math.replaceInsertToken(cursorStart, cursorEnd,
                        (event.key === "&" || event.key === "#" || event.key === "%" || event.key === " " || event.key === "{") ? `\\${event.key} `
                        : (33 <= event.key.charCodeAt(0) && event.key.charCodeAt(0) <= 127) ? `${event.key}`
                        : ''
                    );

                    this.updateString();
                }
            }
        });

        this.element.addEventListener("focus", (event) => {
            event.preventDefault();
            this.cursorIndex = 0;
            this.cursorRange = 0;
            this.updateString();
        });

        this.element.addEventListener("focusout", (event) => {
            this.updateString(true);
        });

        this.updateString();
    }

    private collapseCursor(): void {
        this.cursorRange = 0;
        this.cursorDirection = 0;
    }

    // updates string AND cursor pos
    public updateString(unfocus?: boolean): void {
        // const cursorPos = 0;
        const cursorPos = this.math.stringIndex(this.cursorIndex);


        let mathString = this.math.toString();
        if (!unfocus) {
            if (this.cursorRange === 0)
                mathString = mathString.slice(0, cursorPos) + "\\mkern -1mu \\raise{0.1ex}{\\Large \\vert} \\mkern -1mu" + mathString.slice(cursorPos);
            else {
                const cursorEndPos = this.math.stringIndex(this.cursorIndex + this.cursorRange);
                mathString = mathString.slice(0, cursorPos) + String.raw`\bbox[#870099, 1pt]{` + mathString.slice(cursorPos, cursorEndPos) + '}' + mathString.slice(cursorEndPos);
                // mathString = mathString.slice(0, cursorPos) + String.raw`[` + mathString.slice(cursorPos, cursorEndPos) + ']' + mathString.slice(cursorEndPos);
            }
        }

        // mathString = String.raw`six\bbox[blue, 1pt]{seven}`;
        mathString = `\\[${mathString}\\]`;

        if (mathString !== this.renderingLatex) {
            this.renderingLatex = mathString;
            this.element.textContent = mathString;
        }
        
        if (!unfocus) this.element.focus();
        mj.updateMath(this.element);
    }
}