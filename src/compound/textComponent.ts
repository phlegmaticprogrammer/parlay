import { Mstring, UniformObserver } from "../model/index.js";
import { PrimitiveComponent, UniformComponent } from "./component.js";

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

    createDOM() : Node {
        return this.#node;
    }

    integrate(prefix : Node[], suffix : Node[]) {
    }

}

export function textComponent(text : Mstring) : UniformComponent<string> {
    return new TextComponent(text);
}
