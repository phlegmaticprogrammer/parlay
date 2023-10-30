import { Mstring, UniformObserver } from "../model/index.js";
import { Component, UniformComponent } from "./component.js";
import { MutationInfo } from "./compound.js";
import { Cursor } from "./cursor.js";
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
        this.#node.data = u;
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
        this.#update(textOf(nodes));
        return cursor;
    }

    get cursor() : Cursor {
        return this.#cursor;
    }

    replaceWith(cursor : Cursor, replacements : Node[]) {
        this.#update(textOf(replacements));
        this.#cursor = cursor;
    }

    mutationsObserved(cursor : Cursor, mutations: MutationInfo[]) {
        console.log("mutations observed: " + mutations.length + ", '" + this.#node.data + "'");
        this.#update(this.#node.data);
        this.#cursor = cursor;        
    }

    cursorChanged(cursor : Cursor) {
        this.#cursor = cursor;        
    }

}

export function textComponent(text : Mstring) : UniformComponent<string> {
    return new TextComponent(text);
}
