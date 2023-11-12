import { assertTrue, nat } from "things"
import { Properties, Render, lookupComponent } from "./component.js"
import { removeAllChildNodes } from "../compound/utils.js";

export type PrimitiveNode = {
    primitive : true
    name : string,
    props : Properties,
    children : ComponentNode[],
    node : Node
}

export type CompoundNode = {
    primitive : false
    name : string,
    props : Properties,
    children : Render[],
    derivative : ComponentNode
    node : Node
}

export type ComponentNode = PrimitiveNode | CompoundNode

export function PrimitiveNode(name : string, props : Properties, 
    children : ComponentNode[], node : Node) : PrimitiveNode 
{
    return {
        primitive : true,
        name : name,
        props : props,
        children : children,
        node : node
    };
}

export function CompoundNode(name : string, props : Properties, children : Render[],
    render : ComponentNode) : CompoundNode
{
    return {
        primitive : false,
        name : name,
        props : props,
        children : children,
        derivative : render,
        node : render.node
    };
}

function renderAsNode(render : Render) : ComponentNode {
    const name = render.name;
    const component = lookupComponent(name);
    if (!component) throw new Error("Cannot render, no such component: '" + name + "'.");
    if (component.isPrimitive) {
        const node = component.render(render.props);
        const children = render.children.map(renderAsNode);
        for (const child of children) {
            node.appendChild(child.node);
        }
        return PrimitiveNode(name, render.props, children, node);
    } else {
        const derivative = renderAsNode(component.render(render.props, render.children));
        return CompoundNode(name, render.props, render.children, derivative);
    }
}

export class Compound {
    #root : HTMLElement
    #render : Render | undefined
    #topNode! : CompoundNode
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
        const c = renderAsNode(r);
        if (c.primitive) throw new Error("Top component must be compound."); 
        this.#topNode = c;
        removeAllChildNodes(this.#root);
        this.#root.appendChild(this.#topNode.node);
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
        //this.log("-------------- mutation");
    }    

    #selectionChanged() {
        //this.log("-------------- selection");
    }
}

export function createCompound(elem : HTMLElement, log : (s : string) => void = console.log) : Compound {
    return new Compound(elem, log);
}

