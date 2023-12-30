import { Digraph, Vertex, force, mapVertices, nat } from "things";
import { PositionEnv, ReplicaId, State, deleteValue, insertValue, mergeStates, orderOfState } from "./positions.js";

export class Replica<Position, Value> {

    id : ReplicaId
    env : PositionEnv<Position>
    #state : State<Position, Value>
    #reduction : Digraph

    constructor(id : ReplicaId, env : PositionEnv<Position>) {
        this.id = id;
        this.env = env;
        this.#state = [];
        this.#reduction = new Digraph();
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
    }

    delete(index : nat) {
        this.update(deleteValue(this.#state, index));
    }

    insert(index : nat, value : Value) {
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

}

export function syncReplicas<Position, Value>(replicas : Replica<Position, Value>[]) {
    if (replicas.length === 0) return;
    const env = replicas[0].env;
    const merged = mergeStates(env, replicas.map(r => r.state));
    for (const replica of replicas) {
        replica.update(merged);
    }
}
