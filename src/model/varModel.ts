import { TimeOut, invokeLater } from "./utils.js";
import { ModelSubscription, UniformModel, UniformObserver, finishedSubscription } from "./model.js";

interface VarModelSubscription<Value> extends ModelSubscription {
    notify(value : Value, done : Done, reason : any) : void
}

enum Done {
    no,
    completed,
    aborted
}

class VarModel<Value> implements UniformModel<Value> {

    #value : Value 
    #eq : (x: Value, y: Value) => boolean
    #subscriptions : Set<VarModelSubscription<Value>>
    #done : Done
    #reason : any
    #timeout : TimeOut | undefined

    constructor(value : Value, eq : (x : Value, y : Value) => boolean) {
        this.#value = value;
        this.#eq = eq;
        this.#subscriptions = new Set();
        this.#timeout = undefined;
        this.#done = Done.no;
        this.#reason = undefined;
    }

    valuesAreEqual(value1: Value, value2: Value): boolean {
        return this.#eq(value1, value2);
    }

    #notify() {
        if (this.#timeout === undefined) return;
        this.#timeout = undefined;
        const value = this.#value;
        const done = this.#done;
        const reason = this.#reason;
        for (const subscription of this.#subscriptions) {
            subscription.notify(value, done, reason);
        }
    }

    #schedule() {
        if (this.#timeout !== undefined) return;
        this.#timeout = invokeLater(() => this.#notify());
    }

    async update(value : Value) : Promise<boolean> {
        if (this.#done !== Done.no) return false;
        if (this.#eq(value, this.#value)) return true;
        this.#value = value;
        this.#schedule();
        return true;
    }

    async complete() : Promise<boolean> {
        if (this.#done !== Done.no) return false;
        this.#done = Done.completed;
        this.#schedule();    
        return true;
    }

    async abort(reason : any) : Promise<boolean> {
        if (this.#done !== Done.no) return false;
        this.#done = Done.aborted;
        this.#reason = reason;
        this.#schedule();        
        return true;
    }    

    subscribe(observer: UniformObserver<Value>): ModelSubscription {
        if (this.#done !== Done.no) return finishedSubscription;
        const subscriptions : Set<VarModelSubscription<Value>> = this.#subscriptions;
        let active = true;
        let initialized = false;
        const subscription : VarModelSubscription<Value> = {
            get active() { return active; },
            unsubscribe() { remove(); },
            notify(value : Value, done : Done, reason : any) {
                if (!active) return;
                switch (done) {
                    case Done.no:
                        if (initialized)
                            observer.updated(value);
                        else {
                            initialized = true;
                            observer.initialized(value);
                        }
                        break;
                    case Done.completed:
                        if (initialized)
                            observer.completed();
                        else {
                            initialized = true;
                            observer.initialized(value);
                            observer.completed();
                        }
                        remove();
                        break;
                    case Done.aborted:
                        observer.aborted(reason);
                        remove();
                        break;
                    default: break;
                }
            }
        };
        function remove() {
            subscriptions.delete(subscription);
            active = false;
        }
        invokeLater(() => {
            if (initialized) return;
            subscription.notify(this.#value, this.#done, this.#reason);
        });
        this.#subscriptions.add(subscription);
        return subscription;
    }

}

export function varModel<Value>(
    value : Value,
    eq : (x : Value, y : Value) => boolean = (x, y) => x === y) : UniformModel<Value> 
{
    return new VarModel(value, eq);
}
