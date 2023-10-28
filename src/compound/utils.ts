/*export function childrenOfElement(parent : Element) : Element[] {
    const elems : Element[] = [];
    const len = parent.children.length;
    for (let i = 0; i < len; i++) {
        let child = parent.children.item(i);
        if (child) elems.push(child);
    }
    return elems;
}*/

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

export function getOuterDisplayType(element : Element) {
    var displayType = window.getComputedStyle(element, null).getPropertyValue('display');
    var outerDisplayType = displayType.split(' ')[0]; // Get the first word of the display type
    return outerDisplayType;
}

