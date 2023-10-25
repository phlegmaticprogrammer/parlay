import { ModelObserver, ModelSubscription, StaticModel } from "./model.js";

class PromiseModel<Value> implements StaticModel<Value> {

    #promise : Promise<Value>

    constructor(promise : Promise<Value>) {
        this.#promise = promise;
    }

    async update(u : void) : Promise<boolean> {
        return true;
    }    

    subscribe(observer: ModelObserver<Value, void>): ModelSubscription {
        let active = true;
        function resolved(value : Value) {
             if (active) {
                observer.initialized(value);
                observer.completed();   
                active = false;
             }
        }
        function failed(reason : any) {
            if (active) {
                observer.error(reason);
                active = false;
            }
        }
        this.#promise.then(resolved, failed);
        const s : ModelSubscription = {
            get active(): boolean { return active; },
            unsubscribe(): void {
                active = false;
            }
        };
        return s;
    }

}

export function promiseModel<Value>(promise : Promise<Value>) : StaticModel<Value> {
    return new PromiseModel(promise);
}