import { assertTrue, nat } from "things"
import { Render } from "./component.js"
import { getUniqueObjectId, nodeIsElement, nodeIsText, nodesOfList, removeAllChildNodes } from "../compound/utils.js";
import { ComponentNode, ComponentNodes, CompoundNode, computeNodes, printComponentNode, printComponentNodeLocation, renderAsNode } from "./componentNode.js";
import { getCurrentCursor } from "./cursor.js";

export class Compound {
    #root : HTMLElement
    #render : Render | undefined
    #nodes! : ComponentNodes
    #mutationObserver : MutationObserver | undefined
    #selectionListener : () => void
    #log : (s : string) => void 
    #in_mutation : nat
    #in_cursorchange : nat
    #lognum : nat

    constructor(root : HTMLElement, log : (s : string) => void = console.log) {
        this.#root = root;
        this.#mutationObserver = undefined;
        this.#log = log;
        this.#render = undefined;
        this.#in_mutation = 0;
        this.#in_cursorchange = 0;
        this.#lognum = 0;
        this.#selectionListener = () => this.#selectionChanged();
    }

    render(r : Render) {
        if (this.#render) throw new Error("Component has already been rendered.");
        this.#render = r;
        const c = renderAsNode(r, []);
        if (c.primitive) throw new Error("Top component must be compound."); 
        this.#nodes = new ComponentNodes(c);
        printComponentNode(this.#nodes.top);
        removeAllChildNodes(this.#root);
        this.#root.appendChild(this.#nodes.top.node);
        this.#startMutationObserving();
        this.#startSelectionListening();
    }

    beginMutation() {
        this.#beginCursorChange();
        if (this.#in_mutation === 0) {
            this.#stopMutationObserving();
        }
        this.#in_mutation += 1;
    }

    endMutation() {
        assertTrue(this.#in_mutation > 0);
        this.#in_mutation -= 1;
        if (this.#in_mutation === 0) {
            //this.#refreshCursor();
            this.#startMutationObserving();
        }
        this.#endCursorChange();
    }

    #beginCursorChange() {
        if (this.#in_cursorchange === 0) {
            this.#stopSelectionListening();
        }
        this.#in_cursorchange += 1;
    }

    #endCursorChange() {
        assertTrue(this.#in_cursorchange > 0);
        this.#in_cursorchange -= 1;
        if (this.#in_cursorchange === 0) {
            this.#startSelectionListening();
        }
    }

    #startMutationObserving() {
        //this.log("--- startMutationObserving");
        this.#mutationObserver = new MutationObserver(mutations => this.#mutationsObserved(mutations));            
        this.#mutationObserver.observe(this.#root, { childList: true, characterData: true, subtree: true });
    }

    #stopMutationObserving() {
        //this.log("--- stopMutationObserving");
        this.#mutationObserver!.disconnect();
        this.#mutationObserver = undefined;
    }

    #startSelectionListening() {
        document.addEventListener("selectionchange", this.#selectionListener);
    }

    #stopSelectionListening() {
        document.removeEventListener("selectionchange", this.#selectionListener);
    }

    log(s : string) {
        this.#log(`${this.#lognum}: ${s}`);
        this.#lognum += 1;
    }

/*    #repairRootCursor(cursor : Cursor) : Cursor {
        if (cursor === null) return null;
        const start = this.#pushdownPosition(cursor.start);
        const end = this.#pushdownPosition(cursor.end);
        if (start !== undefined) cursor.start = start;
        if (end !== undefined) cursor.end = end;
        return cursor;
    }*/

/*
    #adjustChildren() : Cursor {
        if(!this.#top) throw new Error();
        const top = this.#top;
        let cursor = getCurrentCursor(this.#root);
        const children = nodesOfList(this.#root.childNodes);
        const topnode = top.main;
        const index = children.indexOf(topnode);
        if (index >= 0) {
            cursor = this.#repairRootCursor(cursor);
            if (children.length === 1) return cursor;
            const prefix = children.slice(0, index);
            removeChildNodes(this.#root, prefix);
            const suffix = children.slice(index+1);
            removeChildNodes(this.#root, suffix);
            top.surroundWith(cursor, prefix, suffix);
            this.log("integrated");           
        } else if (children.length > 0) {
            cursor = this.#repairRootCursor(cursor);
            removeChildNodes(this.#root, children);
            top.replaceWith(cursor, children);
            this.#root.appendChild(topnode);
            this.log("replaced");
        } else {
            top.clear(cursor !== null);
            this.#root.appendChild(topnode);
            this.log("cleared");
        }
        return top.cursor;
    }

    #pushdownPosition(p : Position) : Position | undefined {
        if (p.node === this.#root) {
            const into = childNodesOf(this.#root)
            const r = findPositionInNodes(p.offset, into);
            return r?.position;
        } else {
            return p;
        }
    }

    #getCurrentCursor() : Cursor {
        if(!this.#top) return null;
        const cursor = getCurrentCursor(this.#root);
        if (cursor === null) return null;
        const start = this.#pushdownPosition(cursor.start);
        const end = this.#pushdownPosition(cursor.end);
        if (start !== undefined) cursor.start = start;
        if (end !== undefined) cursor.end = end;
        return cursor;
    }

    #disc = 0

    #refreshCursor() {
        if (!this.#top) return;
        const currentCursor = this.#getCurrentCursor();
        const cursor = this.#top.cursor;
        if (!cursorsAreEqual(cursor, currentCursor) && this.#disc < 30) {
            //this.#disc += 1;
            this.log("(" + this.#disc + ") cursor discrepancy: top=" + printCursor(cursor) + " / current=" + printCursor(currentCursor));
            this.#beginCursorChange();
            setCurrentCursor(cursor);
            this.#endCursorChange();
        }
    }*/

    #mutationsObserved(mutations : MutationRecord[]) {
        this.log("<<<<<<<<<< " + mutations.length + " mutations");
        const that = this;
        function originOfNode(node : Node) : string {
            const cn = that.#nodes.locateNode(node);
            const id = "#" + getUniqueObjectId(node);
            if (cn) return "[" + cn.name + "]" + id;
            else if (nodeIsElement(node)) {
                const attr = node.getAttribute("data-origins");
                if (attr) return "{" + attr + "}" + id;
                else return "<" + node.tagName + ">" + id;
            } else if (nodeIsText(node)) {
                return "text" + id;
            } else {
                return "?" + id;
            }
        }
        for (const mutation of mutations) {
            const cn = this.#nodes.locateNode(mutation.target);
            const loc = cn ? printComponentNodeLocation(cn) + "#" + getUniqueObjectId(cn.node) : "?";
            if (mutation.type === "attributes") {
                // ignore
            } else if (mutation.type === "characterData") {
                this.log("mutation: text of " + loc);               
            } else {
                this.log("mutation: children of " + loc);
                for (const child of nodesOfList(mutation.addedNodes)) {
                    this.log("    added " + originOfNode(child));
                }
                for (const child of nodesOfList(mutation.removedNodes)) {
                    this.log("    removed " + originOfNode(child));
                }
            }
        }
        this.log(">>>>>>>>>> ");
    }    

    #selectionChanged() {
        const cursor = getCurrentCursor();
        if (cursor === null) {
            //this.log("no selection");
            return;
        }
        const start = this.#nodes.locateNode(cursor.start.node);
        const end = this.#nodes.locateNode(cursor.end.node);
        if (start === undefined || end === undefined) {
            //this.log("no selection in this compound");
            return;
        }
        const lstart = printComponentNodeLocation(start);
        const lend = printComponentNodeLocation(end);
        if (lstart === lend) {
            //this.log("selection: " + lstart);
        } else {
            //this.log("selection: " + lstart + " - " + lend);
        }
    }
}

export function createCompound(elem : HTMLElement, log : (s : string) => void = console.log) : Compound {
    return new Compound(elem, log);
}

