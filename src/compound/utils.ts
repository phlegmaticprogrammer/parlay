/*export function childrenOfElement(parent : Element) : Element[] {
    const elems : Element[] = [];
    const len = parent.children.length;
    for (let i = 0; i < len; i++) {
        let child = parent.children.item(i);
        if (child) elems.push(child);
    }
    return elems;
}*/

import { nat } from "things";

export function childNodesOf(parent : Element) : Node[] {
    return nodesOfList(parent.childNodes);
}

export function removeAllChildNodes(parent : Element) {
    for (const c of nodesOfList(parent.childNodes)) {
        parent.removeChild(c);
    }
}

export function removeChildNodes(parent : Element, children : Node[]) {
    for (const c of children) {
        parent.removeChild(c);
    }
}

export function nodesOfList(nodelist : NodeList) : Node[] {
    const nodes : Node[] = [];
    const len = nodelist.length;
    for (let i = 0; i < len; i++) {
        const node = nodelist.item(i);
        if (node) nodes.push(node);
    }
    return nodes;
}

export function nodeIsElement(node : Node) : node is Element {
    return node.nodeType === 1;
}

export function nodeIsText(node : Node) : node is Text {
    return node.nodeType === 3;
}

/*export function getOuterDisplayType(element : Element) {
    var displayType = getComputedStyle(element, null).getPropertyValue('display');
    var outerDisplayType = displayType.split(' ')[0]; // Get the first word of the display type
    return outerDisplayType;
}*/

export function getOuterDisplayType(element : Element) : "block" | "inline" {
    const displayType = window.getComputedStyle(element, null).getPropertyValue('display');

    // If displayType is not set, use the default display type for the element
    if (!displayType) {
        if (["DIV"].includes(element.tagName)) 
            return "block";
        else 
            return "inline";
    } 
    // List of display types that behave like 'block'
    const blockTypes = ['block', 'flex', 'grid', 'table', 'list-item'];

    if (blockTypes.includes(displayType)) {
        return 'block';
    } else {
        return 'inline';
    }
}

export function printNodes(nodes : Node[], log : (s : string) => void = console.log) : void
{
    function pr(indent : string, node : Node) {
        if (nodeIsText(node)) {
            log(indent + "Text '" + node.data + "'");
        } else if (nodeIsElement(node)) {
            log(indent + node.tagName);
            indent += "  ";
            for (const child of childNodesOf(node)) {
                pr(indent, child);
            }
        }
    }
    for (const node of nodes) pr("", node);
}

export function isAncestorOf(ancestor : Node, node : Node) : boolean {
    if (ancestor === node) return true;
    while (node !== ancestor) {
        const n = node.parentNode;
        if (n === null) return false;
        node = n;
    }
    return true;
}

