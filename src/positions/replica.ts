import { Digraph, Vertex, assertTrue, force, internalError, mapVertices, nat, printGraph } from "things";
import { LeftRightPos, PositionEnv, ReplicaId, State, deleteValue, insertValue, mergeStates, orderOfState, printStateGraph } from "./positions.js";
import { orderState } from "./leftright.js";

export class Replica<Position, Value> {

    id : ReplicaId
    env : PositionEnv<Position>
    #state : State<Position, Value>
    //#reduction : Digraph
    #listener : (() => void) | undefined

    constructor(id : ReplicaId, env : PositionEnv<Position>) {
        this.id = id;
        this.env = env;
        this.#state = [];
        //this.#reduction = new Digraph();
        this.#listener = undefined;
    }

    update(state : State<Position, Value>) {
        // @ts-ignore
        this.#state = orderState(state);
/*        const order = orderOfState(this.env, state);
        let newstate : State<Position, Value> = [];
        let sorted : Map<Vertex, Vertex> = new Map();
        for (const [i, vertex] of order.sorted.entries()) {
            newstate.push(state[vertex]);
            sorted.set(vertex, i);
        }
        this.#state = newstate;
        //this.#reduction = mapVertices(order.reduction, v => force(sorted.get(v)));*/
        if (this.#listener) this.#listener();
    }

    delete(index : nat) {
        console.log(this.id + ": delete at " + index);
        this.update(deleteValue(this.#state, index));     
        //printStateGraph("state after delete", this.env, this.#state, this.#reduction);

    }

    insert(index : nat, value : Value) {
        console.log(this.id + ": insert at " + index, value);
        this.update(insertValue(this.env, this.#state, index, value));     
        //printStateGraph("state after insert", this.env, this.#state, this.#reduction);

    }

    values() : Value[] {
        const vs : Value[] = [];
        for (const entry of this.#state) {
            if (!entry.deleted) vs.push(entry.value);
        }
        return vs;
    }

    //get reduction() : Digraph { return this.#reduction; }

    get state() : State<Position, Value> { return this.#state; }

    onChange(listener : (() => void) | undefined) {
        this.#listener = listener;
    }

}

export function syncReplicas<Position, Value>(replicas : Replica<Position, Value>[]) {
    if (replicas.length === 0) return;
    const env = replicas[0].env;
    const merged = mergeStates(env, replicas.map(r => r.state));
    for (const replica of replicas) {
        replica.update(merged);
    }
}

function sameTail<Value>(oldValues : Value[], values : Value[], from : nat) : boolean {
    const n = values.length - values.length;
    assertTrue(n >= 0);
    if (n > oldValues.length) return false;
    for (let i = 1; i <= n; i++) {
        if (oldValues[oldValues.length - i] !== values[values.length - i]) return false;
    }
    return true;
}

export function editReplica<Position, Value>(replica : Replica<Position, Value>, values : Value[], cursor : number | null) 
{
    //console.log("oldValues: ", oldValues);
    //console.log("newValues: ", newValues);
    function edit(i : nat, oldValues : Value[], newValues : Value[]) {
        if (oldValues.length === 0) {
            for (const value of newValues) {
                replica.insert(i, value);
                i += 1;
            }  
        } else if (newValues.length === 0) {
            for (const _ of oldValues) {
                replica.delete(i);
            }
        } else if (oldValues[0] === newValues[0]) {
            edit(i+1, oldValues.slice(1), newValues.slice(1));
        } else if (oldValues[oldValues.length - 1] === newValues[newValues.length - 1]) {
            edit(i, oldValues.slice(0, oldValues.length-1), newValues.slice(0, newValues.length-1));
        } else {
            replica.delete(i);
            edit(i, oldValues.slice(1), newValues);
        }
    }
    const oldValues = replica.values();
    if (cursor !== null && sameTail(oldValues, values, cursor)) {
        const n = values.length - cursor;
        edit(0, oldValues.slice(0, oldValues.length - n), values.slice(0, values.length - n)); 
    } else {
        edit(0, oldValues, values);
    }
}
