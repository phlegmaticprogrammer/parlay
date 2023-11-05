import { ModelSubscription, UniformModel, UniformObserver } from "./model.js";

export interface UpdateModelSubscription<Value> extends ModelSubscription {

    get active() : boolean

    unsubscribe() : void

    update(value : Value) : void

}

class UniformUpdateAdapter<Value> implements UniformObserver<Value>, UpdateModelSubscription<Value> {

    #model : UniformModel<Value>
    #observer : UniformObserver<Value>
    #subscription : ModelSubscription
    #currentValue? : Value
    #hasValue : boolean
    #observerIsInitialized : boolean
    #dirty : boolean  // true if between update and being updated
    
    constructor(model : UniformModel<Value>, observer : UniformObserver<Value>) {
        this.#model = model;
        this.#observer = observer;
        this.#currentValue = undefined;
        this.#hasValue = false;
        this.#observerIsInitialized = false;
        this.#dirty = false;
        this.#subscription = this.#model.subscribe(this);
    }

    get active() : boolean {
        return this.#subscription.active;
    }

    unsubscribe() {
        this.#subscription.unsubscribe();
    }

    async update(value : Value) : Promise<void> {
        const oldValue = this.#currentValue;
        const hasOldValue = this.#hasValue;
        this.#currentValue = value;
        this.#hasValue = true;
        this.#dirty = true;
        const successful = await this.#model.update(value);
        const dirty = this.#dirty;
        this.#dirty = false;
        if (successful || !dirty || !hasOldValue) return;
        this.initialized(oldValue!);
    }

    initialized(c: Value): void {
        this.#dirty = false;
        if (this.#hasValue && this.#observerIsInitialized) {
            if (this.#model.valuesAreEqual(c, this.#currentValue!)) return;
        }
        this.#hasValue = true;
        this.#currentValue = c;
        if (this.#observerIsInitialized) {
            this.#observer.updated(c);
        } else {
            this.#observerIsInitialized = true;
            this.#observer.initialized(c);
        }
    }

    updated(u: Value): void {
        this.#dirty = false;
        if (!this.#model.valuesAreEqual(this.#currentValue!, u)) {
            this.#currentValue = u;
            this.#observer.updated(u);
        }
    }

    completed(): void {
        this.#observer.completed();
    }

    aborted(error: any): void {
        this.#observer.aborted(error);
    }

} 

export function subscribeForUniformUpdate<Value>(model : UniformModel<Value>, 
    observer : UniformObserver<Value>) : UpdateModelSubscription<Value>
{
    return new UniformUpdateAdapter(model, observer);
}