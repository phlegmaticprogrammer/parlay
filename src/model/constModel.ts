import { ModelSubscription, StaticModel, StaticObserver, finishedSubscription } from "./model.js";

class ConstModel<Value> implements StaticModel<Value> {

    #value : Value

    constructor(value : Value) {
        this.#value = value;
    }

    async complete(): Promise<boolean> {
        return false;
    }

    async abort(): Promise<boolean> {
        return false;
    }

    async update() : Promise<boolean> {
        return false;
    }

    subscribe(observer: StaticObserver<Value>): ModelSubscription {
        observer.initialized(this.#value);
        observer.completed();
        return finishedSubscription;
    }

}

export function constModel<Value>(value : Value) : StaticModel<Value> {
    return new ConstModel(value);
}
