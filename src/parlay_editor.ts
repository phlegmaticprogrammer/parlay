import { createTextLines } from "@practal/parsing";
import { parseSyntax } from "alogic";

export class ParlayEditor { 
    
    root : HTMLDivElement
    observer : MutationObserver | undefined

    constructor(root : HTMLDivElement) {
        this.root = root;
        this.setup();
    }

    setup() {
        let style = this.root.style;
        this.root.contentEditable = "true";
        this.root.spellcheck = false;
        style.overflowX = "scroll";
        style.whiteSpace = "pre";
        style.width = "400px";
        style.height = "100px";
        style.border = "2px solid violet";
        style.padding = "5px";
        //style.margin = "10px";
        this.root.innerText = "Parlay-Editor!";
        this.startObserving();
        this.parse();
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
        }
        this.observer.observe(this.root, { childList: true, characterData: true, subtree: true });
    }

    stopObserving() {
        if (this.observer) {
            this.observer.disconnect();
        }
    }

    parse() {
        const text = extractText(this.root);
        //this.stopObserving();
        //this.root.innerHTML = text;
        //this.startObserving();
        //console.log("<<<<<<<<<<<<<<<<<<<<<<<<");
        //console.log(text);
        console.log("<<<<<<<<<<<<<<<<<<<<<<<<");
        const lines = createTextLines(text);
        const [env, syntax] = parseSyntax(lines);
        this.log("parsed until " + syntax.endLine + ":" + syntax.endColumn);
        env.displayResult(syntax, (line:string) => this.log(line));
        console.log(">>>>>>>>>>>>>>>>>>>>>>>>");
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