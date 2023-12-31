import { TLPos, TLPosT, TextLines, copySliceOfTextLines, createTextLines, textOfTextLines } from "@practal/parsing";
import { ParseResult, Tag } from "alogic";
import { parseSyntax } from "alogic";
import { Relation } from "things";
import { example } from "./example.js";
import { generateBlockFromSource, generateFlatEntryFromSource, generateNodeFromBlock, printBlock } from "./blocks.js";
import { IdentifierClassification } from "alogic";
import { IdentifierClass } from "alogic";
import { AS } from "alogic";
//import type { Relation } from "things";

function special(absapp : AS.AbsApp) : { name : boolean, labels : boolean[] } | null {
    if (absapp.name.name.toString() === "theorem") {
        const labels : boolean[] = [];
        for (const label of absapp.parameters.labels) {
            const name = label.name.toString();
            console.log("checking label '" + name + "'");
            labels.push(name === "premise" || name === "conclusion");
        }
        return { name : true, labels : labels };
    } else return null;
}

export class ParlayEditor { 
    
    root : HTMLDivElement
    debugRoot : HTMLDivElement | null
    observer : MutationObserver | undefined

    constructor(root : HTMLDivElement, debugRoot : HTMLDivElement | null) {
        this.root = root;
        this.debugRoot = debugRoot;
        this.setup();
    }

    setup() {
        let style = this.root.style;
        this.root.contentEditable = "true";
        this.root.spellcheck = false;
        this.root.classList.add("parlay");
        style.overflowX = "scroll";
        style.whiteSpace = "pre";
        style.fontFamily = //"stixtwotext";
        style.margin = "10px";
        style.border = "2px solid var(--text-background-highlights)";
        this.view(example);
        document.addEventListener("selectionchange", () => {
            const selection = document.getSelection();
            this.selectionChanged(selection);
            //console.log(document.getSelection());
        });
        this.selectionChanged(document.getSelection());
    }

    selectionChanged(selection : Selection | null) {
        if (!selection) {
            this.log("no selection");
        } else {
            if (selection.anchorNode === null || selection.focusNode === null) {
                this.log("no selection");            
            } else {
                let node : Node | null = selection.anchorNode;
                let up = 0;
                while (node !== null && node !== this.root) {
                    node = node.parentNode;
                    up += 1;
                }
                if (node !== null) {
                    this.log("selected: " + up + " up");
                } else {
                    this.log("not selected");
                }
            }
        }
    }

    startObserving() {
        if (!this.observer) {
            this.observer = new MutationObserver(mutations => this.mutationsObserved(mutations));            
            this.observer.observe(this.root, { childList: true, characterData: true, subtree: true });
        }
    }

    stopObserving() {
        if (this.observer) {
            this.observer.disconnect();
            this.observer = undefined;
        }
    }

    clearDebug() {
        if (this.debugRoot !== null) {
            removeAllChildren(this.debugRoot);
        }
    }

    printDebug(s : string) {
        if (this.debugRoot !== null) {
            let node = document.createTextNode(s);
            this.debugRoot.appendChild(node);
            let br = document.createElement("br");
            this.debugRoot.appendChild(br);
        }
    }

    /*advancedSyntaxColoring(abstractSyntax : AS.AbstractSyntax) {
        function color(abstractSyntax : AS.AbstractSyntax
    }*/

    view(text : string, structure : boolean = true, plain : boolean = false) {
        this.clearDebug();
        console.log("<<<<<<<<<<<<<<<<<<<<<<<<");
        console.log(text);
        console.log("<<<<<<<<<<<<<<<<<<<<<<<<");
        const lines = createTextLines(text);
        function classifier(s : string) : IdentifierClass {
            if (s === "true") return IdentifierClass.ABS;
            else return IdentifierClass.VAR;
        }
        const [env, syntax, abstractSyntax] = parseSyntax(lines, classifier, special);
        this.printDebug("parsed until " + syntax.endLine + ":" + syntax.endColumn);
        env.displayResult(syntax, (line:string) => this.printDebug(line));        
        console.log(">>>>>>>>>>>>>>>>>>>>>>>>");
        this.stopObserving();
        removeAllChildren(this.root);
        const block = structure ? generateBlockFromSource(lines, syntax) : 
            generateFlatEntryFromSource(lines, syntax);
        printBlock(block, s => console.log(s));
        const prefix = structure ? "parlay" : "parlay-raw";
        const prefix_token = !plain ? "parlay-token" : "parlay-plain-token";
        this.root.appendChild(generateNodeFromBlock(block, prefix, prefix_token));
        console.log("~~~~~~~~~~~~~~~~~~~~");
        AS.displayAbstractSyntax(abstractSyntax, (line:string) => this.printDebug(line));
        this.startObserving();  
    }

    parse() {
        //console.log("*** PARSE");
        //const text = extractText(this.root);
        //this.view(text);
    }

    mutationsObserved(mutations : MutationRecord[]) {
        this.log("observerved " + mutations.length + " mutations");
        for (const m of mutations) {
            this.log("    - " + m.type);
        }
        this.parse();
    }

    log(msg : string) {
        console.log("* " + msg);
    }

}

function removeAllChildren(node : Node) {
    while (true) {
        const child = node.firstChild;
        if (child === null) break;
        node.removeChild(child);
    }
}

function extractText(node : Node) : string {
    let text = "";
    let in_text = false;

    function openDiv() {
        if (in_text) {
            in_text = false;
            text += "\n";
        }
    }

    function closeDiv() {
        if (in_text) {
            in_text = false;
            text += "\n";
        }
    }

    function br() {
        text += "\n";
        in_text = false;
    }

    function extractFromNodeList(nodes : NodeListOf<ChildNode>) {
        const len = nodes.length;
        for (let i = 0; i < len; i++) {
            extractFromNode(nodes.item(i));
        }
    }

    function issue(s : string) {
        text += s;
        in_text = true;
    }

    function extractFromNode(node : Node) {
        const t = node.nodeType;
        if (t === Node.ELEMENT_NODE) {
            const elemNode = node as HTMLElement;
            const tag = elemNode.tagName.toLowerCase();
            switch(tag) {
                case "div":
                    openDiv();
                    extractFromNodeList(elemNode.childNodes);
                    closeDiv();
                    break;
                case "br":
                    br();
                    break;
                case "span":
                case "b":
                case "i":
                case "font":
                    extractFromNodeList(elemNode.childNodes);
                    break;
                default: 
                    issue("⟦" + tag + "⟧");
                    break;
            }
        } else if (t === Node.TEXT_NODE) {
            const textNode = node as Text;
            const tc = textNode.textContent;
            if (tc) issue(tc);
        } else if (t === Node.COMMENT_NODE) {
            // ignore
        } else {
            issue("⦃" + t + "⦄");
        }
    }

    extractFromNode(node);

    return text;
}

