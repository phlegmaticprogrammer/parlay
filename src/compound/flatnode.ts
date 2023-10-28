import { assertNever } from "things"
import { childNodesOf, getOuterDisplayType, nodeIsElement, nodeIsText } from "./utils.js"

enum FlatNodeKind {
    block_separator,
    newline,
    text
}

type FlatNodeSpecial = { 
    kind : FlatNodeKind.block_separator | FlatNodeKind.newline
}

type FlatNodeText = {
    kind : FlatNodeKind.text,
    text : string
}

type FlatNode = FlatNodeSpecial | FlatNodeText

function simplifyFlatNodes(flatnodes : FlatNode[]) : FlatNode[] {
    const result : FlatNode[] = [];
    for (const flatnode of flatnodes) {
        const kind = flatnode.kind;
        switch(kind) {
            case FlatNodeKind.text:
                result.push(flatnode);
                break;
            case FlatNodeKind.newline:
                if (result.length > 0) {
                    const lastkind = result[result.length - 1].kind;
                    if (lastkind === FlatNodeKind.block_separator) {
                        result[result.length - 1] = { kind : FlatNodeKind.newline };
                    } else result.push(flatnode);
                } else {
                    result.push(flatnode);
                }
                break;
            case FlatNodeKind.block_separator:
                if (result.length > 0) {
                    const lastkind = result[result.length - 1].kind;
                    if (lastkind === FlatNodeKind.text)
                        result.push(flatnode);
                }
                break;
            default: assertNever(kind);
        }
    }
    while (result.length > 0 && result[result.length-1].kind === FlatNodeKind.block_separator)
        result.pop();
    return result;
}

function consolidateFlatNodes(flatnodes : FlatNode[]) : string[] {
    let lines = [""];
    for (const flatnode of simplifyFlatNodes(flatnodes)) {
        const kind = flatnode.kind;
        switch(kind) {
            case FlatNodeKind.text:
                lines[lines.length-1] += flatnode.text;
                break;
            case FlatNodeKind.newline:
            case FlatNodeKind.block_separator:
                lines.push("");
                break;
            default: assertNever(kind);
        }
    }
    return lines;
}

function printFlatNodes(header : string, flatnodes : FlatNode[]) {
    console.log(header + ":");
    for (const flatnode of flatnodes) {
        if (flatnode.kind === FlatNodeKind.text) {
            console.log("  " + FlatNodeKind[flatnode.kind] + " '" + flatnode.text + "'");
        } else {
            console.log("  " + FlatNodeKind[flatnode.kind]);
        }
    }
}

export function textOf(nodes : Node[]) : string {
    let flatnodes : FlatNode[] = [];

    function print(nodes : Node[]) {
        for (const node of nodes) {
            if (nodeIsText(node)) {
                flatnodes.push({ kind : FlatNodeKind.text, text : node.data });
            } else if (nodeIsElement(node)) {
                if (node.tagName === "BR")
                    flatnodes.push({ kind : FlatNodeKind.newline });
                else {
                    const block = getOuterDisplayType(node) === "block";
                    if (block) flatnodes.push({ kind : FlatNodeKind.block_separator });
                    print(childNodesOf(node));
                    if (block) flatnodes.push({ kind : FlatNodeKind.block_separator });
                }
            } 
        }
    }

    print(nodes);

    return consolidateFlatNodes(flatnodes).join("\n");
}
