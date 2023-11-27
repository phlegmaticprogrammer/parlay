import { Order, freeze, nat } from "things"
import { RedBlackTree, deleteElement, empty, findEqualElement, findMaximumElement, findMinimumElement, 
    insertElement, isElementOf, iterateElements } from "./RedBlackTree.js"

export type Defined = Exclude<any, undefined>

export interface RedBlackSet<E extends Defined> extends Iterable<E> {
    
    order : Order<E>

    tree : RedBlackTree<E>    

    size : nat

    has(elem : E) : boolean 

    findEqual(elem : E) : E | undefined 

    insert(...elems : E[]) : RedBlackSet<E> 

    insertMultiple(elems : Iterable<E>) : RedBlackSet<E> 

    delete(...elems : E[]) : RedBlackSet<E> 

    deleteMultiple(elems : Iterable<E>) : RedBlackSet<E> 

    minimum() : E | undefined 

    maximum() : E | undefined 

    union(other : RedBlackSet<E>) : RedBlackSet<E>

    difference(other : RedBlackSet<E>) : RedBlackSet<E> 

    intersection(other : RedBlackSet<E>) : RedBlackSet<E> 

    filter(predicate : (elem : E) => boolean) : RedBlackSet<E>

}

class RedBlackSetImpl<E extends Defined> implements RedBlackSet<E> {

    order : Order<E>
    tree : RedBlackTree<E>
    size : number

    constructor(order : Order<E>, tree : RedBlackTree<E>, size : number) {
        this.order = order;
        this.tree = tree;
        this.size = size;
        freeze(this);
    }

    [Symbol.iterator]() {
        return iterateElements(this.tree);
    }

    has(elem : E) : boolean {
        return isElementOf(this.order, elem, this.tree); 
    }

    findEqual(elem : E) : E | undefined {
        return findEqualElement(this.order, elem, this.tree);
    }

    insert(...elems : E[]) : RedBlackSetImpl<E> {
        return this.insertMultiple(elems);
    }

    insertMultiple(elems : Iterable<E>) : RedBlackSetImpl<E> {
        let tree = this.tree;
        const order = this.order;
        let size = this.size;
        for (const elem of elems) {
            const t = insertElement(order, elem, tree);
            tree = t.result;
            if (t.previous === undefined) size += 1;
        }
        return new RedBlackSetImpl(order, tree, size);
    }

    delete(...elems : E[]) : RedBlackSetImpl<E> {
        return this.deleteMultiple(elems);
    }

    deleteMultiple(elems : Iterable<E>) : RedBlackSetImpl<E> {
        let tree = this.tree;
        const order = this.order;
        let size = this.size;
        for (const elem of elems) {
            const t = deleteElement(order, elem, tree);
            tree = t.result;
            if (t.deleted !== undefined) size -= 1;
        }
        return new RedBlackSetImpl(order, tree, size);
    }

    minimum() : E | undefined {
        return findMinimumElement(this.tree);
    }

    maximum() : E | undefined {
        return findMaximumElement(this.tree);
    }

    union(other : RedBlackSet<E>) : RedBlackSet<E> {
        if (this.size >= other.size) return this.insertMultiple(other);
        else return other.insertMultiple(this);
    }

    difference(other : RedBlackSet<E>) : RedBlackSet<E> {
        return this.deleteMultiple(other);
    }

    filter(predicate : (elem : E) => boolean) : RedBlackSet<E> {
        const elements : E[] = [];
        for (const elem of this) {
            if (predicate(elem)) elements.push(elem);
        }
        return RedBlackSet(this.order, elements); 
    }

    intersection(other : RedBlackSet<E>) : RedBlackSet<E> {
        if (this.size <= other.size) return this.filter(e => other.has(e));
        else return other.filter(e => this.has(e));
    }

}
freeze(RedBlackSetImpl);

export function RedBlackSet<E extends Defined>(order : Order<E>, elems? : Iterable<E>) : RedBlackSet<E> {
    const rb = new RedBlackSetImpl(order, empty(), 0);
    if (elems === undefined) return rb;
    else return rb.insertMultiple(elems);
}
freeze(RedBlackSet);