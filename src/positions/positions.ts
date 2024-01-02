import { Compare, KahnTopologicalSortDepthFirst, printGraph, relationAsNumber, Total } from "things"
import { Digraph, KahnTopologicalSortDepthFirstWithCompare, RedBlackMap, Relation, Vertex, assertFalse, assertNever, force, nat, sinkVertices, string, topologicalSort, transitiveClosure, transitiveReductionAndClosureOfDAG, transposeDigraph } from "things"
import { FMAX, FMIN, Fraction, compareFractions, displayFraction, fractionInBetween } from "./fraction.js"

export type ReplicaId = string

export type PositionId = { replica : ReplicaId, index : nat }

export function comparePositionIds(p1 : PositionId, p2 : PositionId) : Relation {
    let c = string.compare(p1.replica, p2.replica);
    assertFalse(c === Relation.UNRELATED);
    if (c !== Relation.EQUAL) return c;
    c = nat.compare(p1.index, p2.index);
    assertFalse(c === Relation.UNRELATED);
    return c;
}

export function equalPositionIds(p1 : PositionId, p2 : PositionId | null) : boolean {
    if (p2 === null) return false;
    return comparePositionIds(p1, p2) === Relation.EQUAL;
}

export function displayPositionId(p : PositionId | null) : string {
    if (p === null) return "null";
    else return p.replica + ":" + p.index;
}


export interface PositionEnv<Position> {

    comparePositions(p1 : Position, p2 : Position) : Relation.UNRELATED | Relation.LESS | Relation.GREATER 

    newPosition(left : Position | null, right : Position | null) : Position

    idOfPosition(position : Position) : PositionId

    displayPosition(position : Position) : string

}

export type LeftRightPos = { id : PositionId, left : PositionId | null, right : PositionId | null}
export type LeftPos = { id : PositionId, left : PositionId | null }
export type FractionPos = { id : PositionId, fraction : Fraction }

export class Env {
    #replica : ReplicaId
    #index : nat
    constructor(replica : ReplicaId) {
        this.#replica = replica;
        this.#index = 0;
    }
    freshPositionId() : PositionId {
        const id : PositionId = { replica : this.#replica, index : this.#index };
        this.#index++;
        return id;
    }
}


export class LeftRightEnv extends Env implements PositionEnv<LeftRightPos> {
    displayPosition(position: LeftRightPos): string {
        return displayPositionId(position.id) + "<" + 
            displayPositionId(position.left) + ", " + 
            displayPositionId(position.right) + ">";
    }
    comparePositions(p1: LeftRightPos, p2: LeftRightPos): Relation.UNRELATED | Relation.LESS | Relation.GREATER {
        if (equalPositionIds(p1.id, p2.left)) return Relation.LESS;
        if (equalPositionIds(p1.id, p2.right)) return Relation.GREATER;
        if (equalPositionIds(p2.id, p1.left)) return Relation.GREATER;
        if (equalPositionIds(p2.id, p1.right)) return Relation.LESS;
        return Relation.UNRELATED;
    }
    newPosition(left: LeftRightPos | null, right: LeftRightPos | null): LeftRightPos {
        return { id : this.freshPositionId(), left : left ? left.id : null, right : right ? right.id : null };
    }
    idOfPosition(position: LeftRightPos): PositionId {
        return position.id;
    }
}

export class LeftEnv extends Env implements PositionEnv<LeftPos> {
    displayPosition(position: LeftPos): string {
        return displayPositionId(position.id) + "<" + 
            displayPositionId(position.left) + ">";
    }
    comparePositions(p1: LeftPos, p2: LeftPos): Relation.UNRELATED | Relation.LESS | Relation.GREATER {
        if (equalPositionIds(p1.id, p2.left)) return Relation.LESS;
        if (equalPositionIds(p2.id, p1.left)) return Relation.GREATER; 
        return Relation.UNRELATED;
    }
    newPosition(left: LeftPos | null, right: LeftPos | null): LeftPos {
        return { id : this.freshPositionId(), left : left ? left.id : null };        
    }
    idOfPosition(position: LeftPos): PositionId {
        return position.id;
    }
}

export class FractionEnv extends Env implements PositionEnv<FractionPos> {
    displayPosition(position: FractionPos): string {
        return displayPositionId(position.id) + "<" + displayFraction(position.fraction) + ">";
    }
    comparePositions(p1: FractionPos, p2: FractionPos): Relation.UNRELATED | Relation.LESS | Relation.GREATER {
        let c = compareFractions(p1.fraction, p2.fraction);
        if (c !== Relation.EQUAL) return c;
        c = comparePositionIds(p1.id, p2.id);
        if (c === Relation.EQUAL) throw new Error("internal error");
        return c;
    }
    newPosition(left: FractionPos | null, right: FractionPos | null): FractionPos {
        const l = left ? left.fraction : FMIN;
        const r = right ? right.fraction : FMAX;
        const f = fractionInBetween(l, r);
        return { id : this.freshPositionId(), fraction : f };
    }
    idOfPosition(position: FractionPos): PositionId {
        return position.id;
    }
}

export type Entry<Position, Value> = { position : Position, value : Value, deleted : boolean }

export type State<Position, Value> = Entry<Position, Value>[]

export function printStateGraph<Position, Value>(
    title : string,
    env : PositionEnv<Position>,
    state : State<Position, Value>,
    graph : Digraph)
{
    function label(v : Vertex) : string {
        return "" + state[v].value;
    }
    const values = state.map(s => s.deleted ? "(" + s.value + ")" : s.value).join(" ");
    const positions = state.map(s => env.displayPosition(s.position)).join(" ");
    console.log("------------- " + title);
    console.log("values: " + values);
    console.log("positions: " + positions);
    printGraph(graph, label);    
}

export function orderOfState<Position, Value>(
    env : PositionEnv<Position>, 
    state : State<Position, Value>) : { reduction : Digraph, sorted : Vertex[] } 
{
    const graph = new Digraph();
    for (let i = 0; i < state.length; i++) {
        graph.insert(i);
        for (let j = i + 1; j < state.length; j++) {
            const c = env.comparePositions(state[i].position, state[j].position);
            switch(c) {
                case Relation.UNRELATED: break;
                case Relation.LESS: graph.connect(i, j); break;
                case Relation.GREATER: graph.connect(j, i); break;
                default: assertNever(c);
            }
        }
    }
    //printStateGraph("full current graph", env, state, graph);
    const reduction = transitiveReductionAndClosureOfDAG(graph).reduction;
    function compare(u : Vertex, v : Vertex) : number {
        const p = env.idOfPosition(state[u].position);
        const q = env.idOfPosition(state[v].position);
        return force(relationAsNumber(comparePositionIds(p, q)));
    }
    const sorted = KahnTopologicalSortDepthFirstWithCompare(reduction, compare);
    if (sorted.remaining_transposed.edgeCount > 0) throw new Error("internal error");
    return { reduction : reduction, sorted : sorted.sorted };
}

function findEntryIndex<Position, Value>(state : State<Position, Value>, i : number) : number | undefined {
    let j = -1;
    for (const [k, e] of state.entries()) {
        if (!e.deleted) {
            j += 1;
            if (j === i) return k;
        }
    }
    return undefined;
}

export function insertValue<Position, Value>(
    env : PositionEnv<Position>, state : State<Position, Value>, i : nat, value : Value) : 
    State<Position, Value>
{
    const leftIndex = findEntryIndex(state, i - 1);
    if (leftIndex === undefined) console.log("leftIndex = null");
    else console.log("leftIndex = " + leftIndex + ", value = " + state[leftIndex].value);
    const left = (leftIndex !== undefined) ? state[leftIndex].position : null;
    const rightIndex = findEntryIndex(state, i);
    const right = (rightIndex !== undefined) ? state[rightIndex].position : null;
    if (rightIndex === undefined) console.log("rightIndex = null");
    else console.log("rightIndex = " + rightIndex + ", value = " + state[rightIndex].value);
    const position = env.newPosition(left, right);
    const entry : Entry<Position, Value> = { position : position, value : value, deleted : false };
    return [...state, entry];
}

export function deleteValue<Position, Value>(state : State<Position, Value>, i : nat) : 
    State<Position, Value>
{
    const index = findEntryIndex(state, i);
    if (index === undefined) throw new Error("no such value");
    const old = state[index];
    const entry : Entry<Position, Value> = { position : old.position, value : old.value, deleted : true };
    return [...state.slice(0, index), entry, ...state.slice(index+1)];
}

export function mergeStates<Position, Value>(env : PositionEnv<Position>, 
    states : Iterable<State<Position, Value>>) : State<Position, Value> 
{
    let compare : Compare<PositionId> = { compare: comparePositionIds };
    let entries = RedBlackMap<PositionId, Entry<Position, Value>>(compare);
    for (const state of states) {
        for (const entry of state) {
            const id = env.idOfPosition(entry.position);
            const e = entries.get(id);
            if (e === undefined || entry.deleted) {
                entries = entries.set(id, entry);
            }
        }
    }
    return [...entries].map(e => e[1]);
}

