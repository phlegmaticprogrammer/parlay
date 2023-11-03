import { assertNever, assertTrue, nat } from "things";
import { AnyComponent, ComponentHost } from "./component.js";
import { childNodesOf, isAncestorOf, nodesOfList, printNodes, removeAllChildNodes, removeChildNodes } from "./utils.js";
import { Cursor, Position, cursorsAreEqual, findPositionInNodes, getCurrentCursor, printCursor, printPosition, setCurrentCursor } from "./cursor.js";

export enum MutationKind {
    attributes,
    childList,
    characterData
}

export class MutationInfo {
    kind : MutationKind
    target : Node
    constructor (kind : MutationKind, target : Node) {
        this.kind = kind;
        this.target = target;
    }
}

function createMutationInfo(m : MutationRecord) : MutationInfo {
    const t = m.type;
    let kind : MutationKind
    switch(t) {
        case "attributes": kind = MutationKind.attributes; break;
        case "characterData": kind = MutationKind.characterData; break;
        case "childList": kind = MutationKind.childList; break;
        default: assertNever(t);
    }
    return new MutationInfo(kind, m.target);
}

export class Compound implements ComponentHost {
    #root : HTMLElement
    #top : AnyComponent | undefined
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
        this.#top = undefined;
        this.#in_mutation = 0;
        this.#in_cursorchange = 0;
        this.#lognum = 0;
        this.#selectionListener = () => this.#selectionChanged();
    }

    render(component : AnyComponent) {
        if (this.#top) throw new Error("Component has already been rendered.");
        const node = component.main;
        removeAllChildNodes(this.#root);
        this.#root.appendChild(node);
        this.#top = component;
        this.#startMutationObserving();
        this.#startSelectionListening();
        component.attachHost(this);
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
            this.#refreshCursor();
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
        this.log("--- startMutationObserving");
        this.#mutationObserver = new MutationObserver(mutations => this.#mutationsObserved(mutations));            
        this.#mutationObserver.observe(this.#root, { childList: true, characterData: true, subtree: true });
    }

    #stopMutationObserving() {
        this.log("--- stopMutationObserving");
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

    #adjustChildren() : Cursor {
        if(!this.#top) throw new Error();
        const top = this.#top;
        let cursor = this.#getCurrentCursor();
        const children = nodesOfList(this.#root.childNodes);
        const topnode = top.main;
        const index = children.indexOf(topnode);
        if (index >= 0) {
            if (children.length === 1) return cursor;
            const prefix = children.slice(0, index);
            removeChildNodes(this.#root, prefix);
            const suffix = children.slice(index+1);
            removeChildNodes(this.#root, suffix);
            top.surroundWith(cursor, prefix, suffix);
            this.log("integrated");           
        } else {
            removeChildNodes(this.#root, children);
            top.replaceWith(cursor, children);
            this.#root.appendChild(topnode);
            this.log("replaced");
        }
        return top.cursor;
    }

    #pushdownPosition(p : Position) : Position | undefined {
        if (p.node === this.#root) {
            const children = childNodesOf(this.#root);
            const r = findPositionInNodes(p.offset, children);
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
    }

    #mutationsObserved(mutations : MutationRecord[]) {
        if (!this.#top) return;  
        this.log("--------------");
        this.beginMutation();            
        let cursor = this.#adjustChildren();
        const topnode = this.#top.main;
        const remaining = mutations.filter(m => isAncestorOf(topnode, m.target)).map(createMutationInfo);
        if (remaining.length > 0) {
            this.#top.mutationsObserved(cursor, remaining);
        }
        this.endMutation();     
    }    

    #selectionChanged() {
        if (!this.#top) return;
        let currentCursor = this.#getCurrentCursor();
        this.#top.cursorChanged(currentCursor);
        this.#refreshCursor();
    }
}

export function createCompound(elem : HTMLElement, log : (s : string) => void = console.log) : Compound {
    return new Compound(elem, log);
}

