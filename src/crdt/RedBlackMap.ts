import { Order, Relation, assertTrue, freeze, nat } from "things";
import { RedBlackSet } from "./RedBlackSet.js"

export interface RedBlackMap<K, V> extends Iterable<[K, V]> {
    
    keyValues : RedBlackSet<[K, V]>

    size : nat

    has(key : K) : boolean 

    get(elem : K) : V | undefined 

    set(key : K, value : V) : RedBlackMap<K, V> 

    setMultiple(keyValuePairs : Iterable<[K, V]>) : RedBlackMap<K, V> 

    delete(key : K) : RedBlackMap<K, V> 

    deleteMultiple(keys : Iterable<K>) : RedBlackMap<K, V> 

    minimum() : [K, V] | undefined 

    maximum() : [K, V] | undefined 

    filter(predicate : (key : K, value : V) => boolean) : RedBlackMap<K, V> 

}

function promote<K, V>(key : K) : [K, V] {
    return [key, undefined as V];
}

function* promoteMultiple<K, V>(keys : Iterable<K>) : Generator<[K, V], void, void> {
    for (const key of keys) yield promote(key); 
}

export function promoteOrder<K>(key : Order<K>) : Order<[K, any]> {
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

    set(key : K, value : V) : RedBlackMapImpl<K, V> {
        return new RedBlackMapImpl(this.keyValues.insert([key, value]));
    }

    setMultiple(keyValuePairs : Iterable<[K, V]>) : RedBlackMapImpl<K, V> {
        return new RedBlackMapImpl(this.keyValues.insertMultiple(keyValuePairs));
    } 

    delete(key : K) : RedBlackMapImpl<K, V> {
        return new RedBlackMapImpl(this.keyValues.delete(promote(key)));
    }

    deleteMultiple(keys : Iterable<K>) : RedBlackMapImpl<K, V> {
        return new RedBlackMapImpl(this.keyValues.deleteMultiple(promoteMultiple(keys)));
    }

    minimum() : [K, V] | undefined {
        return this.keyValues.minimum();
    } 

    maximum() : [K, V] | undefined {
        return this.keyValues.maximum();
    } 

    [Symbol.iterator]() {
        return this.keyValues[Symbol.iterator]();
    }

    filter(predicate : (key : K, value : V) => boolean) : RedBlackMapImpl<K, V> {
        return new RedBlackMapImpl(this.keyValues.filter(kv => predicate(kv[0], kv[1])));
    }

}
freeze(RedBlackMapImpl);

export function RedBlackMap<K, V>(order : Order<K>, keyValuePairs? : Iterable<[K, V]>) : RedBlackMap<K, V> {
    return new RedBlackMapImpl(RedBlackSet(promoteOrder(order), keyValuePairs));
}
freeze(RedBlackMap);
