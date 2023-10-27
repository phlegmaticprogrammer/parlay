import { ModelSubscription, StaticModel, StaticObserver } from "./model.js";

class PromiseModel<Value> implements StaticModel<Value> {

    #promise : Promise<Value>

    constructor(promise : Promise<Value>) {
        this.#promise = promise;
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
                observer.aborted(reason);
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