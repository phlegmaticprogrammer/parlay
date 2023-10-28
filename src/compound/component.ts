import { Model, Mstring, UniformModel, UniformObserver, varModel } from "../model/index.js";
import { nodesOfList, removeAllChildNodes, removeChildNodes } from "./utils.js";

export interface ComponentBase<Init, Update> {

    isPrimitive : boolean

    model : Model<Init, Update>

}

export interface PrimitiveComponent<Init, Update> extends ComponentBase<Init, Update> {

    isPrimitive : true

    get DOMNode() : Node

    surroundWith(prefix : Node[], suffix : Node[]) : void
    replaceWith(replacements : Node[]) : void

    //digest(before : Node[], after : Node[]

    attributeChanged?(node : Node, attr : string, oldValue : any)  : void
    textChanged?(node : Node, oldValue : string) : void
    childrenChanged?(node : Node, added : Node[], removed : Node[]) : void

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
            this.#observer.observe(this.#root, { childList: true, characterData: true, subtree: false });
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
        if (!changed) return;
        this.log("-------------------");
        const children = nodesOfList(this.#root.childNodes);
        if (!this.#top?.isPrimitive) {
            this.log("need primitive component");
            return;
        }
        const index = children.indexOf(this.#top.DOMNode);
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
            this.#root.appendChild(this.#top.DOMNode);
            this.#top.replaceWith(children);
            this.log("replaced");
            this.#startObserving();
        }
    }    
}

export function createCompound(elem : HTMLElement, log : (s : string) => void = console.log) : Compound {
    return new Compound(elem, log);
}

