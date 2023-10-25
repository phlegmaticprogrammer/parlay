import { freeze } from "things"

export interface Model<Init, Update> { 

    /**
     * Updates the model. 
     * Returns whether the update was or will be accepted, or has been refused.
     */
    update(u : Update) : Promise<boolean>
    
    subscribe(observer : ModelObserver<Init, Update>) : ModelSubscription

}

/**
 * Allowed call sequences are:
 * * init updated* (completed | error)?
 * * error
 */
export interface ModelObserver<Init, Update> {

    initialized(c : Init) : void

    updated(u : Update) : void

    completed() : void

    error(e : any) : void

}

export interface ModelSubscription {

    get active() : boolean

    unsubscribe() : void

}

export type AnyModel = Model<any, any>

export type UniformModel<Value> = Model<Value, Value>

export type StaticModel<Value> = Model<Value, void>

export let finishedSubscription : ModelSubscription = {
    active: false,
    unsubscribe: () => {}
}
freeze(finishedSubscription);

