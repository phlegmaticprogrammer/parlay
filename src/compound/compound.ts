import { assertNever } from "things";
import { AnyComponent } from "./component.js";
import { childNodesOf, isAncestorOf, nodesOfList, removeAllChildNodes, removeChildNodes } from "./utils.js";
import { Cursor, Position, cursorsAreEqual, findPositionInNodes, getCurrentCursor, setCurrentCursor } from "./cursor.js";

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



export class Compound {
    #root : HTMLElement
    #top : AnyComponent | undefined
    #observer : MutationObserver | undefined
    #listener : () => void
    #log : (s : string) => void 
    #cursor : Cursor

    constructor(root : HTMLElement, log : (s : string) => void = console.log) {
        this.#root = root;
        this.#observer = undefined;
        this.#log = log;
        this.#top = undefined;
        this.#cursor = null;
        this.#listener = () => this.#selectionChanged();
    }

    render(component : AnyComponent) {
        if (this.#top) throw new Error("Component has already been rendered.");
        const node = component.DOMNode;
        removeAllChildNodes(this.#root);
        this.#root.appendChild(node);
        this.#top = component;
        this.#startObserving();
    }

    #startObserving() {
        if (!this.#observer) {
            this.#observer = new MutationObserver(mutations => this.#mutationsObserved(mutations));            
            this.#observer.observe(this.#root, { childList: true, characterData: true, subtree: true });
            document.addEventListener("selectionchange", this.#listener);
        }
    }

    #stopObserving() {
        if (this.#observer) {
            this.#observer.disconnect();
            this.#observer = undefined;
            document.removeEventListener("selectionchange", this.#listener);
        }
    }

    log(s : string) {
        this.#log(s);
    }

    #adjustChildren() : Cursor {
        if(!this.#top) throw new Error();
        const top = this.#top;
        let cursor = this.#getCurrentCursor();
        const children = nodesOfList(this.#root.childNodes);
        const topnode = top.DOMNode;
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
            this.#stopObserving();
            removeChildNodes(this.#root, children);
            top.replaceWith(cursor, children);
            this.#root.appendChild(topnode);
            this.log("replaced");
        }
        return top.cursor;
    }

    #pushdownPosition(p : Position) : Position {
        if (p.node === this.#root) {
            const children = childNodesOf(this.#root);
            const r = findPositionInNodes(p.offset, children);
            if (r === null) throw new Error("Cannot push down position.");
            return r.position;
        } else {
            return p;
        }
    }

    #getCurrentCursor() : Cursor {
        if(!this.#top) return null;
        const cursor = getCurrentCursor(this.#root);
        if (cursor === null) return null;
        cursor.start = this.#pushdownPosition(cursor.start);
        cursor.end = this.#pushdownPosition(cursor.end);
        return cursor;
    }

    #mutationsObserved(mutations : MutationRecord[]) {
        if (!this.#top) return;  
        this.#stopObserving();            
        let cursor = this.#adjustChildren();
        const topnode = this.#top.DOMNode;
        const remaining = mutations.filter(m => isAncestorOf(topnode, m.target)).map(createMutationInfo);
        if (remaining.length > 0) {
            this.#top.mutationsObserved(cursor, remaining);
        }
        const currentCursor = this.#getCurrentCursor();
        cursor = this.#top.cursor;
        if (!cursorsAreEqual(cursor, currentCursor)) {
            setCurrentCursor(cursor);
        }
        this.#startObserving();       
    }    

    #selectionChanged() {
        if (!this.#top) return;
        let currentCursor = this.#getCurrentCursor();
        this.#top.cursorChanged(currentCursor);
        const cursor = this.#top.cursor;
        currentCursor = this.#getCurrentCursor();
        if (!cursorsAreEqual(cursor, currentCursor)) {
            this.#stopObserving();
            setCurrentCursor(cursor);
            this.#startObserving();
        }
    }
}

export function createCompound(elem : HTMLElement, log : (s : string) => void = console.log) : Compound {
    return new Compound(elem, log);
}

