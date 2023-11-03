import { assertNever, nat } from "things"
import { childNodesOf, getOuterDisplayType, nodeIsElement, nodeIsText } from "./utils.js"
import { Position } from "./cursor.js"

enum FlatNodeKind {
    block_separator,
    newline,
    text,
    marker
}

type FlatNodeSpecial = { 
    kind : FlatNodeKind.block_separator | FlatNodeKind.newline
}

type FlatNodeText = {
    kind : FlatNodeKind.text,
    text : string
}

type FlatNodeMarker = {
    kind : FlatNodeKind.marker,
    index : nat,
    offset : nat
}

type FlatNode = FlatNodeSpecial | FlatNodeText | FlatNodeMarker

function simplifyFlatNodes(flatnodes : FlatNode[]) : FlatNode[] {
    const result : FlatNode[] = [];
    function lastResult(kind : FlatNodeKind) : number {
        for (let i = result.length - 1; i >= 0; i--) {
            if (result[i].kind === kind) return i;
            if (result[i].kind !== FlatNodeKind.marker) return -1;
        }
        return -1;
    }
    for (const flatnode of flatnodes) {
        const kind = flatnode.kind;
        switch(kind) {
            case FlatNodeKind.text:
                result.push(flatnode);
                break;
            case FlatNodeKind.newline: {
                const i = lastResult(FlatNodeKind.block_separator);
                if (i >= 0) result[i] = { kind : FlatNodeKind.newline };
                else result.push(flatnode);
                break;
            }
            case FlatNodeKind.block_separator: {
                const i = lastResult(FlatNodeKind.text);
                if (i >= 0) result.push(flatnode);
                break;
            }
            case FlatNodeKind.marker: 
                result.push(flatnode);
                break;
            default: assertNever(kind);
        }
    }
    while (result.length > 0 && result[result.length-1].kind === FlatNodeKind.block_separator)
        result.pop();
    return result;
}

function consolidateFlatNodes(flatnodes : FlatNode[]) : { text : string, offsets : number[] } {
    let text = "";
    let offsets : number[] = [];
    function addOffset(index : nat, offset : nat) {
        while (index >= offsets.length) offsets.push(-1);
        offsets[index] = offset;
    }
    for (const flatnode of simplifyFlatNodes(flatnodes)) {
        const kind = flatnode.kind;
        switch(kind) {
            case FlatNodeKind.text:
                text += flatnode.text;
                break;
            case FlatNodeKind.newline:
            case FlatNodeKind.block_separator:
                text += "\n";
                break;
            case FlatNodeKind.marker:
                addOffset(flatnode.index, text.length + flatnode.offset);
                break;
            default: assertNever(kind);
        }
    }
    return { text: text, offsets : offsets };
}

function printFlatNodes(header : string, flatnodes : FlatNode[]) {
    console.log(header + ":");
    for (const flatnode of flatnodes) {
        if (flatnode.kind === FlatNodeKind.text) {
            console.log("  " + FlatNodeKind[flatnode.kind] + " '" + flatnode.text + "'");
        } else if (flatnode.kind === FlatNodeKind.marker) {
            console.log("  " + FlatNodeKind[flatnode.kind] + "@" + flatnode.index);
        } else {
            console.log("  " + FlatNodeKind[flatnode.kind]);
        }
    }
}

export function textOf(nodes : Node[], positions : Position[]) : { text : string, offsets : number[] } {
    let flatnodes : FlatNode[] = [];

    function pushMarkers(node : Node) {
        for (const [i, p] of positions.entries()) {
            if (p.node === node) {
                const marker : FlatNodeMarker = {
                    kind: FlatNodeKind.marker,
                    index: i,
                    offset: p.offset
                };    
                flatnodes.push(marker);
            }
        }
    }

    function print(nodes : Node[]) {
        for (const node of nodes) {
            if (nodeIsText(node)) {
                pushMarkers(node);
                flatnodes.push({ kind : FlatNodeKind.text, text : node.data });
            } else if (nodeIsElement(node)) {
                if (node.tagName === "BR") {
                    flatnodes.push({ kind : FlatNodeKind.newline });
                    pushMarkers(node);
                } else {
                    const block = getOuterDisplayType(node) === "block";
                    if (block) flatnodes.push({ kind : FlatNodeKind.block_separator });
                    pushMarkers(node);
                    print(childNodesOf(node));
                    if (block) flatnodes.push({ kind : FlatNodeKind.block_separator });
                }
            } 
        }
    }

    print(nodes);

    return consolidateFlatNodes(flatnodes);
}
