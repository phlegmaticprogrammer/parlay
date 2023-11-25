import { nodeIsElement } from "../compound/utils.js"
import { Properties, Render, lookupComponent } from "./component.js"

export type ParentNode = {
    parent : ComponentNode,
    index : number // -1 means that parent is CompoundNode, >= 0 is index into children of PrimitiveNode
}

export type PrimitiveNode = {
    parent : ParentNode | null
    primitive : true
    name : string,
    props : Properties,
    children : ComponentNode[],
    node : Node
}

export type CompoundNode = {
    parent : ParentNode | null
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
        parent: null,
        primitive : true,
        name : name,
        props : props,
        children : children,
        node : node
    };
}

export function CompoundNode(name : string, props : Properties, 
    children : Render[], render : ComponentNode) : CompoundNode
{
    return {
        parent : null,
        primitive : false,
        name : name,
        props : props,
        children : children,
        derivative : render,
        node : render.node
    };
}

export function ParentNode(parent : ComponentNode, index : number) : ParentNode {
    return {
        parent : parent,
        index : index
    };
}

export function renderAsNode(render : Render, origins : string[]) : ComponentNode {
    const name = render.name;
    const component = lookupComponent(name);
    if (!component) throw new Error("Cannot render, no such component: '" + name + "'.");
    if (component.isPrimitive) {
        const node = component.render(render.props);
        if (origins.length > 0 && nodeIsElement(node)) {
            node.setAttribute("data-origins", origins.join(";"));
        }
        const children = render.children.map(r => renderAsNode(r, []));
        for (const child of children) {
            node.appendChild(child.node);
        }
        const cn = PrimitiveNode(name, render.props, children, node);
        for (const [i, child] of children.entries()) {
            child.parent = ParentNode(cn, i);
        }
        return cn;
    } else {
        origins.push(name);
        const derivative = renderAsNode(component.render(render.props, render.children), origins);
        origins.pop();
        const cn = CompoundNode(name, render.props, render.children, derivative);
        derivative.parent = ParentNode(cn, -1);
        return cn;
    }
}

export function computeNodes(cn : ComponentNode) : Map<Node, ComponentNode> {
    const m : Map<Node, ComponentNode> = new Map();
    function collect(cn : ComponentNode) {
        m.set(cn.node, cn);
        if (cn.primitive) {
            for (const child of cn.children) collect(child);
        } else {
            collect(cn.derivative);
        }
    }
    collect(cn);
    return m;
}

export type Log = (s : string) => void

export function printComponentNode(node : ComponentNode, log : Log = console.log) {
    function pr(indent : string, node : ComponentNode) {
        let head = node.name;
        while (!node.primitive) {
            node = node.derivative;
            head += " ⟶ " + node.name;
        }
        log(indent + head);
        for (const child of node.children) {
            pr(indent + "      ", child);
        }
    }
    pr("", node);
}

export function printComponentNodeLocation(node : ComponentNode) : string {
    let s = node.name;
    while (node.parent) {
        const index = node.parent.index;
        node = node.parent.parent;
        if (index < 0) {
            s = node.name + "⟶" + s;
        } else {
            s = node.name + "(" + index + ")⟶" + s;
        }
    }
    return s;
}

export class ComponentNodes {
    #top : CompoundNode
    #nodes : Map<Node, ComponentNode>
    constructor(top : CompoundNode) {
        this.#top = top;
        this.#nodes = computeNodes(top);
    }
    locateNode(node : Node) : ComponentNode | undefined {
        let n : Node | null = node;
        while (n) {
            const c = this.#nodes.get(n);
            if (c) return c;
            n = n.parentNode;
        }
        return undefined;
    }
    get top() : CompoundNode {
        return this.#top;
    }
}
