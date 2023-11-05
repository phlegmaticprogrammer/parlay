import { NotUndefined } from "things";
import { ModelSubscription, UniformModel, UniformObserver } from "./model.js";

export interface UpdateModelSubscription<Value, R> extends ModelSubscription {

    get active() : boolean

    unsubscribe() : void

    update(value : Value, r : R) : void

}

export interface UniformUpdateObserver<Value, R> {

    initialized(c : Value, r : R | undefined) : void

    updated(u : Value, r : R | undefined) : void

    completed() : void

    aborted(error : any) : void

}

class UniformUpdateAdapter<Value, R> implements UniformObserver<Value>, UpdateModelSubscription<Value, R> {

    #model : UniformModel<Value>
    #observer : UniformUpdateObserver<Value, R>
    #subscription : ModelSubscription
    #currentValue? : Value
    #currentR? : R
    #hasValue : boolean
    #observerIsInitialized : boolean
    #dirty : boolean  // true if between update and being updated
    
    constructor(model : UniformModel<Value>, observer : UniformUpdateObserver<Value, R>) {
        this.#model = model;
        this.#observer = observer;
        this.#currentValue = undefined;
        this.#currentR = undefined;
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

    async update(value : Value, r : R) : Promise<void> {
        const oldValue = this.#currentValue;
        const oldR = this.#currentR;
        const hasOldValue = this.#hasValue;
        this.#currentValue = value;
        this.#currentR = r;
        this.#hasValue = true;
        this.#dirty = true;
        const successful = await this.#model.update(value);
        const dirty = this.#dirty;
        this.#dirty = false;
        if (successful || !dirty || !hasOldValue) return;
        this.#initialized(oldValue!, oldR);
    }

    initialized(c : Value): void {
        this.#initialized(c, undefined);
    }

    #initialized(c: Value, r : R | undefined): void {
        this.#dirty = false;
        if (r === undefined && this.#hasValue && this.#observerIsInitialized) {
            if (this.#model.valuesAreEqual(c, this.#currentValue!)) {
                this.#currentR = undefined;
                return;
            }
        }
        this.#hasValue = true;
        this.#currentValue = c;
        this.#currentR = r;
        if (this.#observerIsInitialized) {
            this.#observer.updated(c, r);
        } else {
            this.#observerIsInitialized = true;
            this.#observer.initialized(c, r);
        }
    }

    updated(u: Value): void {
        this.#dirty = false;
        if (!this.#model.valuesAreEqual(this.#currentValue!, u)) {
            this.#currentValue = u;
            this.#currentR = undefined;
            this.#observer.updated(u, undefined);
        }
    }

    completed(): void {
        this.#observer.completed();
    }

    aborted(error: any): void {
        this.#observer.aborted(error);
    }

} 

export function subscribeForUniformUpdate<Value, R>(model : UniformModel<Value>, 
    observer : UniformUpdateObserver<Value, R>) : UpdateModelSubscription<Value, R>
{
    return new UniformUpdateAdapter(model, observer);
}