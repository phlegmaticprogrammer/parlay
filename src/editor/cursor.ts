import { assertTrue, nat } from "things";
import { getUniqueObjectId, nodeIsElement } from "../compound/utils.js";

export type Position = { node : Node, offset : nat }

export function Position(node : Node, offset : nat) : Position {
    if (!nat.is(offset)) throw new Error("Invalid offset in position: " + offset);
    return { node : node, offset : offset };
}

export type Cursor = null | { start : Position, end : Position }

export function Cursor(start : Position, end : Position) : NonNullable<Cursor> {
    return { start : start, end : end }
}

export function getCurrentCursor() : Cursor {
    const selection = document.getSelection();
    if (selection === null || selection.rangeCount === 0) return null;
    const range = selection.getRangeAt(0);
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

export function printPosition(position : Position) : string {
    let id = "" + getUniqueObjectId(position.node);
    if (nodeIsElement(position.node)) {
        id = position.node.id + "#" + id;
    }
    return `N${id}@${position.offset}`;
}

export function printCursor(cursor : Cursor) : string {
    if (cursor === null) return "<null>";
    return `<${printPosition(cursor.start)}:${printPosition(cursor.end)}>`;
}
