import { Block, Line, Part, Span, Text, isLine, isSpan, readDocument } from "./xblocks.js";

function setDataAttr(elem : HTMLElement, attr : string, value : string) {
    elem.setAttribute("data-" + attr, value);
}

function setKeyAttr(elem : HTMLElement, value : string) {
    setDataAttr(elem, "key", value);
}

function getDataAttr(elem : Node, attr : string) : string | null {
    let e = elem as HTMLElement;
    if (!e.getAttribute) return null;
    return e.getAttribute("data-" + attr);
}

function getKeyAttr(elem : Node) : string | null {
    return getDataAttr(elem, "key");
}

function getNearestKeyAttr(elem : Node) : string | null {
    let key = getKeyAttr(elem);
    while (key === null && elem.parentElement !== null) {
        elem = elem.parentElement;
        key = getKeyAttr(elem);
    }
    return key;
}

function cl(css_class : string) : string {
    const prefix = "parlay";
    return prefix + "-" + css_class;
}

function generateFromBlock(top : boolean, close : boolean, block : Block) : Node {
    const div = document.createElement("div");
    setKeyAttr(div, block.ephemerals.key);
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
    const span = document.createElement("span");
    setKeyAttr(span, text.ephemerals.key);
    const node = document.createTextNode(text.text);
    span.appendChild(node);
    return span;
}

function generateFromSpan(span : Span) : Node {
    const node = document.createElement("span");
    setKeyAttr(node, span.ephemerals.key);
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
    setKeyAttr(node, line.ephemerals.key);
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
        this.#stopObserving();
        const document = readDocument(text, 2);
        this.#root.classList.add(cl("document"));
        const last_index = document.blocks.length - 1;
        for (const [i, block] of document.blocks.entries()) {
            this.#root.appendChild(generateFromBlock(true, i === last_index, block));
        }
        this.#startObserving();
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
        this.#startObserving();
    }

    #startObserving() {
        if (!this.#observer) {
            this.#observer = new MutationObserver(mutations => this.#mutationsObserved(mutations));            
            this.#observer.observe(this.#root, { childList: true, characterData: true, subtree: true });
        }
    }

    #stopObserving() {
        if (this.#observer) {
            this.#observer.disconnect();
            this.#observer = undefined;
        }
    }

    #mutationsObserved(mutations : MutationRecord[]) {
        this.log("------------------------");
        this.log("observerved " + mutations.length + " mutations");
        //console.log(mutations);
        for (const m of mutations) {
            const key = getNearestKeyAttr(m.target);
            if (key) this.log(key); else this.log("?");
            if (m.type === "childList") {
                this.log("child changed");
                const added = m.addedNodes.length;
                const deleted = m.removedNodes.length;
                this.log("added: " + added + ", deleted: " + deleted);
            } else if (m.type === "attributes") {
                this.log("attributes changed");
            } else {
                this.log("character data changed");
                const newvalue = m.target.textContent;
                this.log(`${m.oldValue} => ${newvalue}`);
            }
        }
    }    


    log(s : string) {
        if (this.#debugRoot) {
            const div = document.createElement("div");
            const n = document.createTextNode(s);
            div.appendChild(n);
            this.#debugRoot.appendChild(div);
            //div.scrollIntoView({ block: "end", behavior: "smooth" });
        } else {
            console.log("Parlay> " + s);
        }
    }

    #selectionChanged(selection : Selection | null) {
        if (!selection) {
            //this.log("no selection");
        } else {
            if (selection.anchorNode === null || selection.focusNode === null) {
                //this.log("no selection");            
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
                    //this.log("not selected");
                }
            }
        }
    }


}
