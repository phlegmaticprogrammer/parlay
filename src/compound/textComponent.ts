import { Mstring, UniformObserver, UpdateModelSubscription, subscribeForUniformUpdate } from "../model/index.js";
import { Component, ComponentHost, UniformComponent } from "./component.js";
import { Compound, MutationInfo } from "./compound.js";
import { Cursor, Position, adjustCursor, limitCursorOffset, printCursor } from "./cursor.js";
import { textOf } from "./flatnode.js";
import { getUniqueObjectId, printNodes } from "./utils.js";

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
    #model : UpdateModelSubscription<string>
    #node : Text
    #cursor : Cursor
    #host? : ComponentHost

    constructor(text : Mstring) {
        this.model = text;
        this.#node = new Text();
        this.#cursor = null;
        this.#host = undefined;
        this.#model = subscribeForUniformUpdate(text, this);
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
        this.log("MODEL MUTATION!");
        this.#host?.endMutation();
    }

    completed(): void {}

    aborted(): void {}

    get main() : Node {
        return this.#node;
    }

    log(s : string) {
        if (!this.#host) {
            console.log("no host: " + s);
        } else {
            this.#host.log(s);
        }
    }

    #update(s : string) {
        if (this.#node.data !== s) {
            this.#host?.beginMutation();        
            this.#node.data = s;
            this.log("MUTATION!");
            this.#host?.endMutation();
        }
        this.#model.update(s);
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
        this.log("surround with: " + prefix.length + " / " + suffix.length);
        this.log("  cursor: " + printCursor(cursor));
        this.log("  this.node:");
        printNodes([this.#node], s => this.log("    " + s));
        this.log("  suffix:");
        printNodes(suffix, s => this.log("    " + s));
        const nodes = [...prefix, this.#node, ...suffix]
        this.#updateWithNodes(cursor, nodes);
        this.log("  this.node after update:");
        printNodes([this.#node], s => this.log("    " + s));
    }

    get cursor() : Cursor {
        return this.#cursor;
    }

    replaceWith(cursor : Cursor, replacements : Node[]) {
        this.log("replace with");
        this.log("  cursor: " + printCursor(cursor));
        this.log("  this.node:");
        printNodes([this.#node], s => this.log("    " + s));
        this.log("  replacements:");
        printNodes(replacements, s => this.log("    " + s));
        this.#updateWithNodes(cursor, replacements);
        this.log("  this.node after replacement:");
        printNodes([this.#node], s => this.log("    " + s));
    }

    clear(hasCursor : boolean)  {
        this.#updateWithNodes(null, []);
        if (hasCursor) this.#cursor = Cursor(Position(this.#node, 0), Position(this.#node, 0));
        else this.#cursor = null;
    }

    mutationsObserved(cursor : Cursor, mutations: MutationInfo[]) {
        this.log("textcomponent: mutations observed: " + mutations.length + ", '" + this.#node.data + "'");
        this.log("  cursor = " + printCursor(cursor));
        printNodes([this.#node], s => this.log("  " + s));
        for (const m of mutations) {
            this.log("  -- mutation, target = N" + getUniqueObjectId(m.target) + ", kind = " + m.kind);
        }
        this.#updateWithNodes(cursor, [this.#node]);
    }

    cursorChanged(cursor : Cursor) {
        this.log("cursor changed: " + printCursor(cursor));
        this.#updateCursorOnly(cursor, [this.#node]);
        //this.#cursor = adjustCursor(cursor, [this.#node], this.#node);        
    }

}

export function textComponent(text : Mstring) : UniformComponent<string> {
    return new TextComponent(text);
}
