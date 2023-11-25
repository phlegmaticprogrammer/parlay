import { Order, Relation, assertNever, freeze } from "things";

export type RedBlackTree<E> = Red<E> | Black<E> | null

export class Red<E> {
    elem : E
    left : RedBlackTree<E>
    right : RedBlackTree<E>
    constructor(elem : E, left : RedBlackTree<E>, right : RedBlackTree<E>) {
        this.elem = elem;
        this.left = left;
        this.right = right;
        freeze(this);
    }
}
freeze(Red);

export class Black<E> {
    elem : E
    left : RedBlackTree<E>
    right : RedBlackTree<E>
    constructor(elem : E, left : RedBlackTree<E>, right : RedBlackTree<E>) {
        this.elem = elem;
        this.left = left;
        this.right = right;
        freeze(this);
    }
}
freeze(Black);

export function isRed<E>(tree : RedBlackTree<E>) : tree is Red<E> {
    return tree instanceof Red;
}

export function isEmpty<E>(tree : RedBlackTree<E>) : tree is null {
    return tree === null;
}

export function empty<E>() : RedBlackTree<E> {
    return null;
}

export function isElementOf<E>(order : Order<E>, x : E, tree : RedBlackTree<E>) : boolean {

    function member(tree : RedBlackTree<E>) : boolean {
        if (isEmpty(tree)) return false;
        const c = order.compare(x, tree.elem);
        switch(c) {
            case Relation.UNRELATED: throw new Error("RedBlackTree: Cannot compare '" + x + "' with '" + tree.elem + "'.");
            case Relation.EQUAL: return true;
            case Relation.LESS: return member(tree.left);
            case Relation.GREATER: return member(tree.right);
            default: assertNever(c);
        }
    }

    return member(tree);
}

function mkTree<E>(red : boolean, elem : E, left : RedBlackTree<E>, right : RedBlackTree<E>) : RedBlackTree<E> {
    return red ? new Red(elem, left, right) : new Black(elem, left, right);
}

function balanced<E>(x : E, y : E, z : E, a : RedBlackTree<E>, b : RedBlackTree<E>, 
    c : RedBlackTree<E>, d : RedBlackTree<E>) : RedBlackTree<E> 
{
    const left = new Black(x, a, b);
    const right = new Black(z, c, d);
    return new Red(y, left, right);
}

function forceBlack<E>(tree : RedBlackTree<E>) : RedBlackTree<E> {
    if (isRed(tree)) return new Black(tree.elem, tree.left, tree.right);
    else return tree;
}

/**
 * Inserts a new element into the tree. Returns undefined if the element is already part of the tree.
 */
export function insertNewElement<E>(order : Order<E>, x : E, tree : RedBlackTree<E>) : RedBlackTree<E> | undefined {

    function balanceLeft(red : boolean, elem : E, left : RedBlackTree<E>, right : RedBlackTree<E>) : RedBlackTree<E> {
        if (red || !isRed(left)) return mkTree(red, elem, left, right);
        if (isRed(left.left)) return balanced(left.left.elem, left.elem, elem, 
            left.left.left, left.left.right, left.right, right);
        if (isRed(left.right)) return balanced(left.elem, left.right.elem, elem, 
            left.left, left.right.left, left.right.right, right);
        return mkTree(red, elem, left, right);
    }

    function balanceRight(red : boolean, elem : E, left : RedBlackTree<E>, right : RedBlackTree<E>) : RedBlackTree<E> {
        if (red || !isRed(right)) return mkTree(red, elem, left, right);
        if (isRed(right.left)) return balanced(elem, right.left.elem, right.elem,
            left, right.left.left, right.left.right, right.right);
        if (isRed(right.right)) return balanced(elem, right.elem, right.right.elem,
            left, right.left, right.right.left, right.right.right);
        return mkTree(red, elem, left, right);
    }

    function insert(tree : RedBlackTree<E>) : RedBlackTree<E> | undefined {
        if (isEmpty(tree)) return new Red(x, empty(), empty()); 
        const c = order.compare(x, tree.elem);
        switch(c) {
            case Relation.UNRELATED: throw new Error("RedBlackTree: Cannot compare '" + x + "' with '" + tree.elem + "'.");
            case Relation.EQUAL: return undefined;
            case Relation.LESS: {
                const left = insert(tree.left);
                if (left === undefined) return undefined;
                else return balanceLeft(isRed(tree), tree.elem, left, tree.right);
            }
            case Relation.GREATER: {
                const right = insert(tree.right);
                if (right === undefined) return undefined;
                else return balanceRight(isRed(tree), tree.elem, tree.left, right);
            }
            default: assertNever(c);
        }
    }

    const result = insert(tree);
    if (result === undefined) return undefined; else return forceBlack(result);
}

// Not sure if I need this at all actually.
export function deleteExistingElement<E>(order : Order<E>, x : E, tree : RedBlackTree<E>) : 
    RedBlackTree<E> | undefined 
{
    
    throw new Error();
}