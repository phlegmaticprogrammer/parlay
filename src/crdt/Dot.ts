import { freeze, nat } from "things";

export class Id {
    id : string
    constructor(id : string) {
        this.id = id;
        freeze(this);
    }
}
freeze(Id);

export interface DotContext {

    acquireId() : Id

    releaseId(id : Id) : void

}

export class Dot {
    id : Id
    logical_clock : nat  // consecutive clock
    timestamp : number // time in seconds since ...?
    constructor(id : Id, logical_clock : nat, timestamp : number) {
        this.id = id;
        this.logical_clock = logical_clock;
        this.timestamp = timestamp;
        freeze(this);
    }
}
freeze(Dot);






