import { Order, Relation, assertTrue, freeze, nat } from "things";
import { RedBlackSet } from "./RedBlackSet.js"

export function keyValueOrder<K>(key : Order<K>) : Order<[K, any]> {
    function is(value: any): value is [K, any] {
        if (!Array.isArray(value)) return false;
        if (value.length !== 2) return false;
        return key.is(value[0]);
    }
    const order : Order<[K, any]> = {
        compare: function (x: [K, any], y: [K, any]): Relation {
            return key.compare(x[0], y[0]);
        },
        equal: function (x: [K, any], y: [K, any]): boolean {
            return key.equal(x[0], y[0]);
        },
        name: "[" + key.name + ", *]",
        is: is,
        assert: function (value: any): asserts value is [K, any] {
            assertTrue(is(value));
        },
        display: function (value: [K, any]): string {
            return key.display(value[0]) + " -> " + value[1];
        }
    };
    return order;
}

function promote<K, V>(key : K) : [K, V] {
    return [key, undefined as V];
}

/*
class RedBlackMapImpl<K, V> implements Iterable<[K, V]> {
    
    keyValues : RedBlackSet<[K, V]>

    constructor(keyValues : RedBlackSet<[K, V]>) {
        this.keyValues = keyValues;
        freeze(this);
    }

    get size() : nat { 
        return this.keyValues.size; 
    }

    has(key : K) : boolean {
        return this.keyValues.has(promote(key));
    } 

    get(elem : K) : V | undefined {
        const kv = this.keyValues.findEqual(promote(elem));
        if (kv === undefined) return undefined;
        return kv[1];
    } 

    setMultiple(...keyValuePairs : Iterable<[K, V]>) : RedBlackSet<E> {
        
    } 

    insertMultiple(elems : Iterable<E>) : RedBlackSet<E> 

    delete(...elems : E[]) : RedBlackSet<E> 

    deleteMultiple(elems : Iterable<E>) : RedBlackSet<E> 

    minimum() : E | undefined 

    maximum() : E | undefined 

    union(other : RedBlackSet<E>) : RedBlackSet<E>

    difference(other : RedBlackSet<E>) : RedBlackSet<E> 

    intersection(other : RedBlackSet<E>) : RedBlackSet<E> 

    filter(predicate : (elem : E) => boolean) : RedBlackSet<E>

}*/