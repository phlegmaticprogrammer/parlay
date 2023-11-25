import { freeze, nat } from "things";

export class Id {
    id : string
    constructor(id : string) {
        this.id = id;
        freeze(this);
    }
}
freeze(Id);

export interface DataContext {

    acquireId() : Id

    releaseId(id : Id) : void

}

export class Dot {
    id : Id
    logical_clock : nat
    physical_clock : nat
    constructor(id : Id, logical : nat, timestamp : number) {
        this.id = id;
        this.logical_clock = logical;
        this.physical_clock = timestamp;
        freeze(this);
    }
}
freeze(Dot);






