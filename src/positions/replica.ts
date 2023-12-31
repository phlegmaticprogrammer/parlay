import { Digraph, Vertex, force, mapVertices, nat } from "things";
import { PositionEnv, ReplicaId, State, deleteValue, insertValue, mergeStates, orderOfState } from "./positions.js";

export class Replica<Position, Value> {

    id : ReplicaId
    env : PositionEnv<Position>
    #state : State<Position, Value>
    #reduction : Digraph
    #listener : (() => void) | undefined

    constructor(id : ReplicaId, env : PositionEnv<Position>) {
        this.id = id;
        this.env = env;
        this.#state = [];
        this.#reduction = new Digraph();
        this.#listener = undefined;
    }

    update(state : State<Position, Value>) {
        const order = orderOfState(this.env, state);
        let newstate : State<Position, Value> = [];
        let sorted : Map<Vertex, Vertex> = new Map();
        for (const [i, vertex] of order.sorted.entries()) {
            newstate.push(state[vertex]);
            sorted.set(vertex, i);
        }
        this.#state = newstate;
        this.#reduction = mapVertices(order.reduction, v => force(sorted.get(v)));
        if (this.#listener) this.#listener();
    }

    delete(index : nat) {
        console.log("delete at " + index);
        this.update(deleteValue(this.#state, index));
    }

    insert(index : nat, value : Value) {
        console.log("insert at " + index, value);
        this.update(insertValue(this.env, this.#state, index, value));
    }

    values() : Value[] {
        const vs : Value[] = [];
        for (const entry of this.#state) {
            if (!entry.deleted) vs.push(entry.value);
        }
        return vs;
    }

    get reduction() : Digraph { return this.#reduction; }

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

export function editReplica<Position, Value>(replica : Replica<Position, Value>, values : Value[]) 
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
    edit(0, replica.values(), values);
}
