import { freeze } from "things"

export interface Model<Init, Update> { 

    /**
     * Guaranteed not to call the observer synchronously.
     * @param observer 
     */
    subscribe(observer : ModelObserver<Init, Update>) : ModelSubscription

    /**
     * Submits a completion request to the model. 
     * Returns whether the completion will be or has been accepted, or has been refused.
     */
    complete() : Promise<boolean>

    /**
     * Submits an abortion request to the model. 
     * Returns whether the abortion will be or has been accepted, or has been refused.
     */
    abort(reason? : any) : Promise<boolean>
    
    /**
     * Submits an update request to the model. 
     * Returns whether the update will be or has been accepted, or has been refused.
     */
    update(u : Update) : Promise<boolean>
    
}

/**
 * Allowed call sequences are:
 * * init updated* (completed | aborted)?
 * * aborted?
 */
export interface ModelObserver<Init, Update> {

    initialized(c : Init) : void

    updated(u : Update) : void

    completed() : void

    aborted(error : any) : void

}

export interface ModelSubscription {

    get active() : boolean

    unsubscribe() : void

}

export type AnyModel = Model<any, any>

/** A UniformModel does not distinguish between init and update. */
export interface UniformModel<Value> extends Model<Value, Value> {
    valuesAreEqual(value1 : Value, value2 : Value) : boolean
}
export type UniformObserver<Value> = ModelObserver<Value, Value>
export type Mstring = UniformModel<string>

/** A StaticModel has no updates. */
export type StaticModel<Value> = Model<Value, never>
export type StaticObserver<Value> = ModelObserver<Value, never>

export let finishedSubscription : ModelSubscription = {
    active: false,
    unsubscribe: () => {}
}
freeze(finishedSubscription);

