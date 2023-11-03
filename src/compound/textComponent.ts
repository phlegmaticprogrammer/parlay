import { Mstring, UniformObserver } from "../model/index.js";
import { Component, ComponentHost, UniformComponent } from "./component.js";
import { Compound, MutationInfo } from "./compound.js";
import { Cursor, Position, adjustCursor, limitCursorOffset } from "./cursor.js";
import { textOf } from "./flatnode.js";
import { getUniqueObjectId } from "./utils.js";

function makeTextCursor(node : Node, startOffset : number, endOffset : number, length : number) : Cursor {
    if (!Number.isInteger(startOffset)) throw new Error("Invalid start offset.");
    if (!Number.isInteger(endOffset)) throw new Error("Invalid end offset.");
    if (!Number.isInteger(length)) throw new Error("Invalid length.");

    if (startOffset < 0 && endOffset < 0) return null;
    if (startOffset < 0) {
        return Cursor(Position(node, 0), Position(node, endOffset));
    } else if (endOffset < 0) {
        return Cursor(Position(node, startOffset), Position(node, length));
    } else {
        return Cursor(Position(node, startOffset), Position(node, endOffset));
    }    
}

class TextComponent implements Component<string, string>, UniformObserver<string> {

    model : Mstring
    #node : Text
    #cursor : Cursor
    #host? : ComponentHost

    constructor(text : Mstring) {
        this.model = text;
        this.#node = new Text();
        this.#cursor = null;
        this.#host = undefined;
        this.model.subscribe(this);
    }

    attachHost(host : ComponentHost) {
        this.#host = host;
    }

    initialized(data: string): void {
        this.#node.data = data;
    }

    updated(u: string): void {
        // How do I deal with the cursor in here??
        this.#host?.beginMutation();
        this.#node.data = u;
        this.#cursor = limitCursorOffset(this.#cursor, u.length);
        console.log("MODEL MUTATION!");
        this.#host?.endMutation();
    }

    completed(): void {}

    aborted(): void {}

    get main() : Node {
        return this.#node;
    }

    #update(s : string) {
        this.#host?.beginMutation();        
        this.#node.data = s;
        console.log("MUTATION!");
        this.model.update(s);
        this.#host?.endMutation();
    }

    #updateWithNodes(cursor : Cursor, nodes : Node[]) {
        const positions = cursor === null ? [] : [cursor.start, cursor.end];
        const { text, offsets } = textOf(nodes, positions);
        if (positions.length === 0) this.#cursor = null;
        else this.#cursor = makeTextCursor(this.#node, offsets[0], offsets[1], text.length);
        this.#update(text);
    }

    #updateCursorOnly(cursor : Cursor, nodes : Node[]) {
        const positions = cursor === null ? [] : [cursor.start, cursor.end];
        const { text, offsets } = textOf(nodes, positions);
        if (positions.length === 0) this.#cursor = null;
        else this.#cursor = makeTextCursor(this.#node, offsets[0], offsets[1], text.length);
    }

    surroundWith(cursor : Cursor, prefix : Node[], suffix : Node[]) {
        console.log("surround with");
        const nodes = [...prefix, this.#node, ...suffix]
        this.#updateWithNodes(cursor, nodes);
    }

    get cursor() : Cursor {
        return this.#cursor;
    }

    replaceWith(cursor : Cursor, replacements : Node[]) {
        console.log("replace with");
        this.#updateWithNodes(cursor, replacements);
    }

    mutationsObserved(cursor : Cursor, mutations: MutationInfo[]) {
        console.log("mutations observed: " + mutations.length + ", '" + this.#node.data + "'");
        for (const m of mutations) {
            console.log("  mutation, target = N" + getUniqueObjectId(m.target) + ", kind = " + m.kind);
        }
        this.#updateWithNodes(cursor, [this.#node]);
    }

    cursorChanged(cursor : Cursor) {
        console.log("cursor changed");
        this.#updateCursorOnly(cursor, [this.#node]);
        //this.#cursor = adjustCursor(cursor, [this.#node], this.#node);        
    }

}

export function textComponent(text : Mstring) : UniformComponent<string> {
    return new TextComponent(text);
}
