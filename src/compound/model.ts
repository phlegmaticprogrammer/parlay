export interface Observer<T, R> {

    next(item : T) : void

    complete(result : R) : void

}

export interface Model<C, T, R> {

    send(command : C) : Promise<void>

    subscribe(observer : Observer<T, R>) : Subscription

}

export interface Subscription {

    get isActive() : boolean

    unsubscribe() : void

}

let m : Model<any, any, any> = undefined

await m.send(3);
