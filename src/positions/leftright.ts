import { ArrayHash, Digraph, HashSet, KahnTopologicalSortDepthFirst, RedBlackMap, Relation, Vertex, arrayEqual, arrayHash, assertTrue, force, int, internalError, nat, notImplemented, sinkVertices, transitiveReductionAndClosureOfDAG, transposeDigraph } from "things";
import { Entry, LeftRightPos, PositionEnv, PositionId, State, comparePositionIds, displayPositionId, equalPositionIds } from "./positions.js";

type LRState<Value> = State<LeftRightPos, Value>
type LREntry<Value> = Entry<LeftRightPos, Value>

function buildIndexOfPositions<Value>(state : LRState<Value>) : RedBlackMap<PositionId, nat> {
    let m = RedBlackMap<PositionId, nat>({ compare : comparePositionIds });
    for (const [i, entry] of state.entries()) {
        m = m.set(entry.position.id, i);
    }
    return m;
}

function insertEntry<Value>(state : LRState<Value>, entry : LREntry<Value>) {
    function posOf(id : PositionId | null, defaultPos : number) : number {
        if (id === null) return defaultPos;
        for (let i = 0; i < state.length; i++) {
            if (equalPositionIds(state[i].position.id, id)) return i;
        }
        throw new Error("Cannot find id: " + displayPositionId(id));
    }    
    const id = entry.position.id;
    const origin = posOf(entry.position.left, -1);
    const right = posOf(entry.position.right, state.length);
    let current = origin + 1;
    while (current < right) {
        const currentPos = state[current].position;
        const currentOrigin = posOf(currentPos.left, -1);
        if (origin < currentOrigin) {
            current++;
        } else if (origin === currentOrigin) {
            const c = comparePositionIds(currentPos.id, id); 
            if (c === Relation.LESS) current++;
            else if (c === Relation.GREATER) {
                break;
            } else internalError();
        } else /* currentOrigin < origin */ { 
            break;
        } 
    }
    state.splice(current, 0, entry);
}

function insertEntryWOOT<Value>(state : LRState<Value>, entry : LREntry<Value>) {
    function posOf(id : PositionId | null, defaultPos : number) : number {
        if (id === null) return defaultPos;
        for (let i = 0; i < state.length; i++) {
            if (equalPositionIds(state[i].position.id, id)) return i;
        }
        throw new Error("Cannot find id: " + displayPositionId(id));
    }    
    const id = entry.position.id;
    function insert(left : number, right : number) {
        if (left >= right) internalError();
        if (left + 1 === right) {
            state.splice(right, 0, entry);
            return;
        }
        function inRange(id : PositionId | null) : boolean {
            if (id === null) return false;
            for (let i = left+1; i < right; i++) {
                if (equalPositionIds(state[i].position.id, id)) return true;
            }
            return false;
        }
        const L : number[] = [left];
        let i = left + 1;
        while (i < right) {
            const s = state[i];
            if (!inRange(s.position.left) && !inRange(s.position.right)) {
                L.push(i);
            }
            i++;
        }
        L.push(right);
        i = 1;
        while (i < L.length - 1 && comparePositionIds(state[L[i]].position.id, id) === Relation.LESS)
            i++;
        insert(L[i-1], L[i]);
    }
    const origin = posOf(entry.position.left, -1);
    const right = posOf(entry.position.right, state.length);
    insert(origin, right);
}

function sinkVerticesExclude(graph : Digraph, exclude : Vertex[]) : Set<Vertex> {
    const sinks : Set<Vertex> = new Set();
    for (const vertex of graph.vertices) {
        if (exclude.indexOf(vertex) >= 0) continue;
        let isSink = true;
        for (const w of graph.outgoing(vertex)) {
            if (exclude.indexOf(w) < 0) {
                isSink = false;
                break;
            }
        }
        if (isSink) sinks.add(vertex);
    }
    return sinks;
}


function KahnAllTopologicalSorts(graph : Digraph) : Vertex[][]
{
    const transposed = transposeDigraph(graph);
    const prefix : Vertex[] = [];
    const allSorts : Vertex[][] = [];
    const N = graph.vertexCount;

    function listAll() {
        if (prefix.length === N) {
            allSorts.push([...prefix]);
            return;
        }
        const sources = [...sinkVerticesExclude(transposed, prefix)];
        for (const source of sources) {
            prefix.push(source);
            listAll();
            prefix.pop();
        }
    }

    listAll();
    return allSorts;
}

function statesAreEqual<Value>(state1 : LRState<Value>, state2 : LRState<Value>) : boolean {
    const N = state1.length;
    if (state1.length !== state2.length) return false;
    for (let i = 0; i < N; i++) {
        if (!equalPositionIds(state1[i].position.id, state2[i].position.id)) return false;
    }
    return true;
}

export function orderState<Value>(state : LRState<Value>) : LRState<Value> {
    const g = new Digraph();
    const indexOfPositions = buildIndexOfPositions(state);
    for (let i = 0; i < state.length; i++) {
        g.insert(i);
        const p = state[i].position;
        if (p.left !== null) {
            const left = force(indexOfPositions.get(p.left));
            g.connect(i, left);
        }
        if (p.right !== null) {
            const right = force(indexOfPositions.get(p.right));
            g.connect(i, right);
        }
    }
    //const topsort = KahnTopologicalSortDepthFirst(g).sorted.reverse();
    const allTopSorts = KahnAllTopologicalSorts(g);
    console.log("There are " + allTopSorts.length + " topological sorts");
    function computeOrder(topsort : Vertex[]) : LRState<Value> {
        const orderedState : LRState<Value> = [];
        for (const vertex of topsort.reverse()) {
            insertEntryWOOT(orderedState, state[vertex]);
        }
        return orderedState;
    }
    const states : LRState<Value>[] = [];
    for (const sort of allTopSorts) {
        const order = computeOrder(sort);
        let found = false;
        for (let i = 0; i < states.length; i++) {
            if (statesAreEqual(order, states[i])) {
                found = true;
                break;
            }
        }
        if (!found) states.push(order);
    }
    if (states.length !== 1) {
        console.log("Found multiple orders: " + states.length);
        for (const state of states) {
            console.log("  order: " + state.map(s => new String(s.value)).join(","));
        }
    } else {
        console.log("Unique state");
    }
    return states[0];
}