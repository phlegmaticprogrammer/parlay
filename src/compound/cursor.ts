import { assertTrue, nat } from "things";
import { childNodesOf, getUniqueObjectId, isAncestorOf, nodeIsElement } from "./utils.js";

export type Position = { node : Node, offset : nat }

export function Position(node : Node, offset : nat) : Position {
    if (!nat.is(offset)) throw new Error("Invalid offset in position: " + offset);
    return { node : node, offset : offset };
}

export type Cursor = null | { start : Position, end : Position }

export function Cursor(start : Position, end : Position) : NonNullable<Cursor> {
    return { start : start, end : end }
}

export function getCurrentCursor(root : Node) : Cursor {
    const selection = document.getSelection();
    if (selection === null || selection.rangeCount === 0) return null;
    const range = selection.getRangeAt(0);
    if (!isAncestorOf(root, range.startContainer) || !isAncestorOf(root, range.endContainer))
        return null;
    return Cursor( 
        Position(range.startContainer, range.startOffset),
        Position(range.endContainer, range.endOffset));
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
        const len = textLengthOfNode(node);
        if (offset <= currentOffset + len) {
            return { nodeIndex : i, position : Position(nodes[i], offset - currentOffset) };
        }
        currentOffset += len;
        i += 1;
    }
    return null;
}

export function textLengthOfNode(node : Node) : nat {
    if (!node.textContent) return 0;
    return node.textContent.length;
}

export function textLengthOfNodes(nodes : Node[]) : nat {
    return nodes.map(textLengthOfNode).reduce((x, y) => x + y, 0);
}


// returns -1 if such a position does not exist
export function findOffsetInNodes(position : Position, nodes : Node[]) : nat | -1 {
    let offset = 0;
    for (const node of nodes) {
        if (isAncestorOf(node, position.node)) {
            if (node === position.node) {
                if (nat.is(position.offset) && position.offset <= textLengthOfNode(node))
                    return offset + position.offset;
                else
                    return -1;
            } 
            assertTrue(nodeIsElement(node));
            const children = childNodesOf(node as Element);
            const offsetInNode = findOffsetInNodes(position, children);
            return offsetInNode >= 0 ? offset + offsetInNode : -1;
        } 
        offset += textLengthOfNode(node);
    }
    return -1;
}

export function printPosition(position : Position) : string {
    return `N${getUniqueObjectId(position.node)}@${position.offset}`;
}

export function printCursor(cursor : Cursor) : string {
    if (cursor === null) return "<null>";
    return `<${printPosition(cursor.start)}:${printPosition(cursor.end)}>`;
}

export function adjustCursor(cursor : Cursor, nodes : Node[], placeIn : Node) : Cursor {
    if (cursor === null) return null;
    const startOffset = findOffsetInNodes(cursor.start, nodes);
    const endOffset = findOffsetInNodes(cursor.end, nodes);
    console.log("Adjusted cursor, " + printCursor(cursor) + " => " + startOffset + " : " + endOffset);
    if (startOffset < 0 && endOffset < 0) return null;
    if (startOffset < 0) {
        return Cursor(Position(placeIn, 0), Position(placeIn, endOffset));
    } else if (endOffset < 0) {
        const len = textLengthOfNodes(nodes);
        return Cursor(Position(placeIn, startOffset), Position(placeIn, len));
    } else {
        return Cursor(Position(placeIn, startOffset), Position(placeIn, endOffset));
    }
}

export function limitPositionOffset(position : Position, maxOffset : nat) : Position {
    if (position.offset > maxOffset) {
        return Position(position.node, maxOffset);
    } else return position;
}

export function limitCursorOffset(cursor : Cursor, maxOffset : nat) : Cursor {
    if (cursor === null) return null;
    return Cursor(limitPositionOffset(cursor.start, maxOffset), 
        limitPositionOffset(cursor.end, maxOffset));
}