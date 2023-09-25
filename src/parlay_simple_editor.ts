import { Block, Line, Part, Span, Text, isLine, isSpan, readDocument } from "./xblocks.js";

function cl(css_class : string) : string {
    const prefix = "parlay";
    return prefix + "-" + css_class;
}

function generateFromBlock(top : boolean, close : boolean, block : Block) : Node {
    const div = document.createElement("div");
    div.classList.add(top ? cl("block") : cl("indented-block"));
    if (close) div.classList.add(cl("close-block"));
    let len = block.parts.length;
    for (const [i, part] of block.parts.entries()) {
        if (isLine(part)) {
            div.appendChild(generateFromLine(part));
        } else {
            const close_block = i+1 < len && isLine(block.parts[i+1]);
            div.appendChild(generateFromBlock(false, close_block, part));
        }
    }
    return div;
}

function generateFromText(text : Text) : Node {
    return document.createTextNode(text.text);
}

function generateFromSpan(span : Span) : Node {
    const node = document.createElement("span");
    for (const fragment of span.fragments) {
        if (isSpan(fragment)) node.appendChild(generateFromSpan(fragment));
        else node.appendChild(generateFromText(fragment));
    }
    return node;
}

function linebreakNode() : Node {
    return document.createElement("br");        
}

function generateFromLine(line : Line) : Node {
    const node = document.createElement("div");
    node.setAttribute("class", cl("line"));
    for (const fragment of line.fragments) {
        if (isSpan(fragment)) node.appendChild(generateFromSpan(fragment));
        else node.appendChild(generateFromText(fragment));
    }
    if (node.childElementCount === 0) node.appendChild(linebreakNode());
    return node;
}

export class ParlaySimpleEditor { 
    
    #root : HTMLDivElement
    #debugRoot : HTMLDivElement | null
    #observer : MutationObserver | undefined

    constructor(root : HTMLDivElement, debugRoot : HTMLDivElement | null) {
        this.#root = root;
        this.#debugRoot = debugRoot;
        this.#setup();
    }

    load(text : string) {
        const document = readDocument(text, 2);
        this.#root.classList.add(cl("document"));
        const last_index = document.blocks.length - 1;
        for (const [i, block] of document.blocks.entries()) {
            this.#root.appendChild(generateFromBlock(true, i === last_index, block));
        }
    }

    #setup() {
        //let style = this.#root.style;
        this.#root.contentEditable = "true";
        this.#root.spellcheck = false;
        this.#root.classList.add("parlay");
        document.addEventListener("selectionchange", () => {
            const selection = document.getSelection();
            this.#selectionChanged(selection);
            //console.log(document.getSelection());
        });
        this.#selectionChanged(document.getSelection());
    }

    log(s : string) {
        console.log("Parlay> " + s);
    }

    #selectionChanged(selection : Selection | null) {
        if (!selection) {
            this.log("no selection");
        } else {
            if (selection.anchorNode === null || selection.focusNode === null) {
                this.log("no selection");            
            } else {
                let node : Node | null = selection.anchorNode;
                let up = 0;
                while (node !== null && node !== this.#root) {
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


}
