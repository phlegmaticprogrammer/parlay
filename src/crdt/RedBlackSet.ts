import { Order, freeze, nat } from "things"
import { RedBlackTree, deleteExistingElement, empty, findEqualElement, findMaximumElement, findMinimumElement, insertNewElement, isElementOf, iterateElements } from "./RedBlackTree.js"

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
            const t = insertNewElement(order, elem, tree);
            if (t !== undefined) {
                size += 1;
                tree = t;
            }
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
            const t = deleteExistingElement(order, elem, tree);
            if (t !== undefined) {
                size -= 1;
                tree = t;
            }
        }
        return new RedBlackSetImpl(order, tree, size);
    }

    minimum() : E | undefined {
        return findMinimumElement(this.tree);
    }

    maximum() : E | undefined {
        return findMaximumElement(this.tree);
    }

    [Symbol.iterator]() {
        return iterateElements(this.tree);
    }

}
freeze(RedBlackSetImpl);

export function RedBlackSet<E extends Defined>(order : Order<E>, elems? : Iterable<E>) : RedBlackSet<E> {
    const rb = new RedBlackSetImpl(order, empty(), 0);
    if (elems === undefined) return rb;
    else return rb.insertMultiple(elems);
}
freeze(RedBlackSet);