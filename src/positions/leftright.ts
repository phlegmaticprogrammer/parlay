import { Digraph, KahnTopologicalSortDepthFirst, RedBlackMap, Relation, Vertex, assertTrue, force, internalError, nat, notImplemented, transitiveReductionAndClosureOfDAG } from "things";
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
    const topsort = KahnTopologicalSortDepthFirst(g).sorted.reverse();
    const orderedState : LRState<Value> = [];
    for (const vertex of topsort) {
        insertEntry(orderedState, state[vertex]);
    }
    return orderedState;
}