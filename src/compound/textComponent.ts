import { Mstring, UniformObserver } from "../model/index.js";
import { Component, UniformComponent } from "./component.js";
import { MutationInfo } from "./compound.js";
import { Cursor, Position, adjustCursor } from "./cursor.js";
import { textOf } from "./flatnode.js";

class TextComponent implements Component<string, string>, UniformObserver<string> {

    isPrimitive : true = true
    model : Mstring
    #node : Text
    #cursor : Cursor

    constructor(text : Mstring) {
        this.model = text;
        this.#node = new Text();
        this.model.subscribe(this);
        this.#cursor = null;
    }

    initialized(data: string): void {
        this.#node.data = data;
    }

    updated(u: string): void {
        if (u !== this.#node.data) {
            this.#node.data = u;
        }
        // What about the cursor? How do I update that after a model update comes?
    }

    completed(): void {}

    aborted(): void {}

    get DOMNode() : Node {
        return this.#node;
    }

    #update(s : string) {
        this.updated(s);
        this.model.update(s);
    }

    surroundWith(cursor : Cursor, prefix : Node[], suffix : Node[]) {
        const nodes = [...prefix, this.#node, ...suffix]
        this.#cursor = adjustCursor(cursor, nodes, this.#node);
        this.#update(textOf(nodes));
    }

    get cursor() : Cursor {
        return this.#cursor;
    }

    replaceWith(cursor : Cursor, replacements : Node[]) {
        this.#cursor = adjustCursor(cursor, replacements, this.#node);
        this.#update(textOf(replacements));
    }

    mutationsObserved(cursor : Cursor, mutations: MutationInfo[]) {
        console.log("mutations observed: " + mutations.length + ", '" + this.#node.data + "'");
        this.#cursor = adjustCursor(cursor, [this.#node], this.#node);
        this.#update(this.#node.data);
    }

    cursorChanged(cursor : Cursor) {
        this.#cursor = adjustCursor(cursor, [this.#node], this.#node);        
    }

}

export function textComponent(text : Mstring) : UniformComponent<string> {
    return new TextComponent(text);
}
