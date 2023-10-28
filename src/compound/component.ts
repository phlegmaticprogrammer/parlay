import { assertNever } from "things";
import { Model, Mstring, UniformModel, UniformObserver, varModel } from "../model/index.js";
import { isAncestorOf, nodesOfList, removeAllChildNodes, removeChildNodes } from "./utils.js";

export interface ComponentBase<Init, Update> {

    isPrimitive : boolean

    model : Model<Init, Update>

}

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

export interface PrimitiveComponent<Init, Update> extends ComponentBase<Init, Update> {

    isPrimitive : true

    get DOMNode() : Node

    /**
     * The DOMNode is guaranteed not to be a part of the prefix or suffix trees.
     */
    surroundWith(prefix : Node[], suffix : Node[]) : void

    /**
     * While the DOMNode is not one of the replacements, 
     * it may be a direct or indirect child of one of the replacements.
     */    
    replaceWith(replacements : Node[]) : void

    mutationsObserved(mutations : MutationInfo[]) : void
}

export interface CompoundComponent<Init, Update> extends ComponentBase<Init, Update> {
    isPrimitive : false
}

export type Component<Init, Update> = 
    PrimitiveComponent<Init, Update> | 
    CompoundComponent<Init, Update>

export type AnyComponent = Component<any, any>
export type UniformComponent<Value> = Component<Value, Value>

export class Compound {
    #root : HTMLElement
    #top : AnyComponent | undefined
    #observer : MutationObserver | undefined
    #log : (s : string) => void 

    constructor(root : HTMLElement, log : (s : string) => void = console.log) {
        this.#root = root;
        this.#observer = undefined;
        this.#log = log;
        this.#top = undefined;
    }

    render(component : AnyComponent) {
        if (component.isPrimitive) {
            const node = component.DOMNode;
            removeAllChildNodes(this.#root);
            this.#root.appendChild(node);
            this.#top = component;
            this.#startObserving();
        } else {
            throw new Error("Cannot render compound components yet.");
        }
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

    log(s : string) {
        this.#log(s);
    }

    #adjustChildren() {
        this.log("-------------------");
        const children = nodesOfList(this.#root.childNodes);
        if (!this.#top?.isPrimitive) {
            this.log("need primitive component");
            return;
        }
        const topnode = this.#top.DOMNode;
        const index = children.indexOf(topnode);
        if (index >= 0) {
            if (children.length === 1) {
                this.log("strange, child list changed, but still 1 child, which is the top");
            } else {
                this.#stopObserving();
                const prefix = children.slice(0, index);
                removeChildNodes(this.#root, prefix);
                const suffix = children.slice(index+1);
                removeChildNodes(this.#root, suffix);
                this.#top.surroundWith(prefix, suffix);
                this.log("integrated");
                this.#startObserving();
            }
        } else {
            this.#stopObserving();
            removeChildNodes(this.#root, children);
            this.#top.replaceWith(children);
            this.#root.appendChild(topnode);
            this.log("replaced");
            this.#startObserving();
        }
    }

    #mutationsObserved(mutations : MutationRecord[]) {
        let changed = false;
        for (const m of mutations) {
            if (m.target === this.#root && m.type === "childList") {
                changed = true;
                break;
            }
            if (m.target === this.#root && m.type === "characterData") {
                changed = true;
            }
        }
        if (changed) {
            this.#adjustChildren();
        }
        if (!this.#top?.isPrimitive) {
            this.log("need primitive component");
            return;
        }    
        const topnode = this.#top.DOMNode;
        const remaining = mutations.filter(m => isAncestorOf(topnode, m.target)).map(createMutationInfo);
        if (remaining.length > 0) {
            this.#stopObserving();
            this.#top?.mutationsObserved(remaining);
            this.#startObserving();
        }
    }    
}

export function createCompound(elem : HTMLElement, log : (s : string) => void = console.log) : Compound {
    return new Compound(elem, log);
}

