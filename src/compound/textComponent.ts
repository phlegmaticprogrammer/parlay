import { Mstring, UniformObserver } from "../model/index.js";
import { PrimitiveComponent, UniformComponent } from "./component.js";

function textOf(nodes : Node[]) : string {
    let s = "";
    for (const node of nodes) {
        const t = node.textContent;
        if (t) s += t;
    }
    return s;
}

class TextComponent implements PrimitiveComponent<string, string>, UniformObserver<string> {

    isPrimitive : true = true
    model : Mstring
    #node : Text

    constructor(text : Mstring) {
        this.model = text;
        this.#node = new Text();
        this.model.subscribe(this);
    }

    initialized(data: string): void {
        this.#node.data = data;
    }

    updated(u: string): void {
        this.#node.data = u;
    }

    completed(): void {}

    aborted(): void {}

    get DOMNode() : Node {
        return this.#node;
    }

    integrate(prefix : Node[], suffix : Node[]) {
        const nodes = [...prefix, this.#node, ...suffix]
        const s = textOf(nodes);
        this.updated(s);
        this.model.update(s);
    }

    replaceWith(replacements : Node[]) {
        const s = textOf(replacements);
        this.updated(s);
        this.model.update(s);
    }

}

export function textComponent(text : Mstring) : UniformComponent<string> {
    return new TextComponent(text);
}
