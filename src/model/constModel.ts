import { ModelObserver, ModelSubscription, StaticModel, UniformModel, finishedSubscription } from "./model.js";

class ConstModel<Value> implements StaticModel<Value> {

    #value : Value

    constructor(value : Value) {
        this.#value = value;
    }

    async update(u : void) : Promise<boolean> {
        return true;
    }

    subscribe(observer: ModelObserver<Value, void>): ModelSubscription {
        observer.initialized(this.#value);
        observer.completed();
        return finishedSubscription;
    }

}

export function constModel<Value>(value : Value) : StaticModel<Value> {
    return new ConstModel(value);
}
