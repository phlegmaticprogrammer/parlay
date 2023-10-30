import { nat } from "things";
import { isAncestorOf } from "./utils.js";

export type Position = { node : Node, offset : nat }

export function Position(node : Node, offset : number) : Position {
    return { node : node, offset : offset };
}

export type Cursor = null | { start : Position, end : Position }

export function getCurrentCursor(root : Node) : Cursor {
    const selection = document.getSelection();
    if (selection === null || selection.rangeCount === 0) return null;
    const range = selection.getRangeAt(0);
    if (!isAncestorOf(root, range.startContainer) || !isAncestorOf(root, range.endContainer))
        return null;
    return { 
        start : Position(range.startContainer, range.startOffset),
        end : Position(range.endContainer, range.endOffset)
    };
}

export function setCurrentCursor(cursor : Cursor) {
    const selection = getSelection();
    if (selection === null) return;
    selection.removeAllRanges();
    if (cursor === null) return;
    const range = document.createRange();
    range.setStart(cursor.start.node, cursor.start.offset);
    range.setEnd(cursor.end.node, cursor.end.offset);
    selection.addRange(range);
}

export function positionsAreEqual(p1 : Position, p2 : Position) : boolean {
    return p1.node === p2.node && p1.offset === p2.offset;
}

export function cursorsAreEqual(cursor1 : Cursor, cursor2 : Cursor) : boolean {
    if (cursor1 === cursor2) return true;
    if (cursor1 === null || cursor2 === null) return false;
    return positionsAreEqual(cursor1.start, cursor2.start) &&
        positionsAreEqual(cursor1.end, cursor2.end);
}

export function findPositionInNodes(offset : nat, nodes : Node[]) : null | 
    { nodeIndex : nat, position : Position } 
{
    let currentOffset = 0;
    let i = 0;
    while (i < nodes.length) {
        const node = nodes[i];
        if (node.textContent !== null) {
            const len = node.textContent.length;
            if (offset <= currentOffset + len) {
                return { nodeIndex : i, position : Position(nodes[i], offset - currentOffset) };
            }
            currentOffset += len;
        }
        i += 1;
    }
    return null;
}