import { Mstring, UniformObserver } from "../model/index.js";
import { Component, ComponentHost, UniformComponent } from "./component.js";
import { Compound, MutationInfo } from "./compound.js";
import { Cursor, Position, adjustCursor } from "./cursor.js";
import { textOf } from "./flatnode.js";
import { getUniqueObjectId } from "./utils.js";

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
        console.log("MODEL MUTATION!");
        this.#host?.endMutation();
    }

    completed(): void {}

    aborted(): void {}

    get main() : Node {
        return this.#node;
    }

    #update(s : string) {
        this.#node.data = s;
        console.log("MUTATION!");
        this.model.update(s);
    }

    surroundWith(cursor : Cursor, prefix : Node[], suffix : Node[]) {
        console.log("surround with");
        const nodes = [...prefix, this.#node, ...suffix]
        this.#cursor = adjustCursor(cursor, nodes, this.#node);
        this.#update(textOf(nodes));
    }

    get cursor() : Cursor {
        return this.#cursor;
    }

    replaceWith(cursor : Cursor, replacements : Node[]) {
        console.log("replace with");
        this.#cursor = adjustCursor(cursor, replacements, this.#node);
        this.#update(textOf(replacements));
    }

    mutationsObserved(cursor : Cursor, mutations: MutationInfo[]) {
        console.log("mutations observed: " + mutations.length + ", '" + this.#node.data + "'");
        for (const m of mutations) {
            console.log("  mutation, target = N" + getUniqueObjectId(m.target) + ", kind = " + m.kind);
        }
        this.#cursor = adjustCursor(cursor, [this.#node], this.#node);
        this.#update(this.#node.data);
    }

    cursorChanged(cursor : Cursor) {
        console.log("cursor changed");
        this.#cursor = adjustCursor(cursor, [this.#node], this.#node);        
    }

}

export function textComponent(text : Mstring) : UniformComponent<string> {
    return new TextComponent(text);
}
