import { Order, Relation, assertNever, freeze, nat } from "things";

export type RedBlackTree<E> = Red<E> | Black<E> | null;

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

function isBlack<E>(tree : RedBlackTree<E>) : tree is Black<E> {
    return tree instanceof Black;
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

export function findEqualElement<E>(order : Order<E>, x : E, tree : RedBlackTree<E>) : E | undefined {

    function find(tree : RedBlackTree<E>) : E | undefined {
        if (isEmpty(tree)) return undefined;
        const c = order.compare(x, tree.elem);
        switch(c) {
            case Relation.UNRELATED: throw new Error("RedBlackTree: Cannot compare '" + x + "' with '" + tree.elem + "'.");
            case Relation.EQUAL: return tree.elem;
            case Relation.LESS: return find(tree.left);
            case Relation.GREATER: return find(tree.right);
            default: assertNever(c);
        }
    }

    return find(tree);

}

export function findMinimumElement<E>(tree : RedBlackTree<E>) : E | undefined {

    function find(tree : RedBlackTree<E>) : E | undefined {
        if (isEmpty(tree)) return undefined;
        return find(tree.left);
    }

    return find(tree);
}

export function findMaximumElement<E>(tree : RedBlackTree<E>) : E | undefined {

    function find(tree : RedBlackTree<E>) : E | undefined {
        if (isEmpty(tree)) return undefined;
        return find(tree.right);
    }

    return find(tree);
}

function mkRed<E>(left : RedBlackTree<E>, elem : E, right : RedBlackTree<E>) : RedBlackTree<E> {
    return new Red(elem, left, right);
}

function mkBlack<E>(left : RedBlackTree<E>, elem : E, right : RedBlackTree<E>) : RedBlackTree<E> {
    return new Black(elem, left, right);
}

function forceBlack<E>(tree : RedBlackTree<E>) : RedBlackTree<E> {
    if (isRed(tree)) return mkBlack(tree.left, tree.elem, tree.right);
    else return tree;
}

function splitRed<E>(tree : Red<E>) : [RedBlackTree<E>, E, RedBlackTree<E>] {
    if (!isRed(tree)) throw new Error("splitRed");
    return [tree.left, tree.elem, tree.right];
}

function splitBlack<E>(tree : Black<E>) : [RedBlackTree<E>, E, RedBlackTree<E>] {
    if (!isBlack(tree)) throw new Error("splitBlack");
    return [tree.left, tree.elem, tree.right];
}


function balance<E>(left : RedBlackTree<E>, elem : E, right : RedBlackTree<E>) : RedBlackTree<E> {
    const leftR = isRed(left);
    const rightR = isRed(right);
    let x : E
    let y : E
    let z : E
    let a : RedBlackTree<E> 
    let b : RedBlackTree<E> 
    let c : RedBlackTree<E> 
    let d : RedBlackTree<E> 
    if (leftR && rightR) { // (T R a x b) y (T R c z d) 
        [a, x, b] = splitRed(left);
        y = elem;
        [c, z, d] = splitRed(right);
    } else if (leftR && isRed(left.left)) { // (T R (T R a x b) y c) z d
        [a, x, b] = splitRed(left.left);
        y = left.elem;
        c = left.right;
        z = elem;
        d = right;
    } else if (leftR && isRed(left.right)) { // (T R a x (T R b y c)) z d
        a = left.left;
        x = left.elem;
        [b, y, c] = splitRed(left.right);
        z = elem;
        d = right;
    } else if (rightR && isRed(right.right)) { // a x (T R b y (T R c z d))
        a = left;
        x = elem;
        b = right.left;
        y = right.elem;
        [c, z, d] = splitRed(right.right);
    } else if (rightR && isRed(right.left)) { // a x (T R (T R b y c) z d)
        a = left;
        x = elem;
        [b, y, c] = splitRed(right.left);
        z = right.elem;
        d = right.right;        
    } else {
        return mkBlack(left, elem, right);
    }
    return mkRed(mkBlack(a, x, b), y, mkBlack(c, z, d));
}

/**
 * Inserts a new element into the tree. Returns undefined if the element is already part of the tree.
 */
export function insertNewElement<E>(order : Order<E>, x : E, tree : RedBlackTree<E>) : RedBlackTree<E> | undefined {

    function insert(tree : RedBlackTree<E>) : RedBlackTree<E> | undefined {
        if (isEmpty(tree)) return mkRed(empty(), x, empty()); 
        const c = order.compare(x, tree.elem);
        switch(c) {
            case Relation.UNRELATED: throw new Error("RedBlackTree: Cannot compare '" + x + "' with '" + tree.elem + "'.");
            case Relation.EQUAL: return undefined;
            case Relation.LESS: {
                const left = insert(tree.left);
                if (left === undefined) return undefined;
                if (isRed(tree)) return mkRed(left, tree.elem, tree.right); 
                tree = tree as Black<E>;
                return balance(left, tree.elem, tree.right);
            }
            case Relation.GREATER: {
                const right = insert(tree.right);
                if (right === undefined) return undefined;
                if (isRed(tree)) return mkRed(tree.left, tree.elem, right);
                tree = tree as Black<E>;                
                return balance(tree.left, tree.elem, right);
            }
            default: assertNever(c);
        }
    }

    const result = insert(tree);
    if (result === undefined) return undefined; else return forceBlack(result);
}

export function insertElement<E>(order : Order<E>, x : E, tree : RedBlackTree<E>) : RedBlackTree<E> {
    const result = insertNewElement(order, x, tree);
    return result === undefined ? tree : result;
}

/**
 * Deletes an existing element from the tree. Returns undefined if the element is already part of the tree.
 */
export function deleteExistingElement<E>(order : Order<E>, x : E, tree : RedBlackTree<E>) : 
    RedBlackTree<E> | undefined 
{

    function sub1(tree : RedBlackTree<E>) : RedBlackTree<E> {
        if (isBlack(tree)) return mkRed(tree.left, tree.elem, tree.right);
        else throw new Error("RedBlackTree: sub1 invariant failed.");
    }

    function balleft(left : RedBlackTree<E>, elem : E, right : RedBlackTree<E>) : RedBlackTree<E> {
        if (isRed(left)) return mkRed(mkBlack(left.left, left.elem, left.right), elem, right);
        if (isBlack(right)) return balance(left, elem, mkRed(right.left, right.elem, right.right));
        // @ts-ignore right should have type Red<E> | null
        const [T, z, c] = splitRed(right as Red<E>);
        const [a, y, b] = splitBlack(T as Black<E>);
        return mkRed(mkBlack(left, elem, a), y, balance(b, z, sub1(c)));
    }

    function balright(left : RedBlackTree<E>, elem : E, right : RedBlackTree<E>) : RedBlackTree<E> {
        if (isRed(right)) return mkRed(left, elem, mkBlack(right.left, right.elem, right.right));
        if (isBlack(left)) return balance(mkRed(left.left, left.elem, left.right), elem, right);
        // @ts-ignore left should have type Red<E> | null
        const [a, x, T] = splitRed(left as Red<E>);
        const [b, y, c] = splitBlack(T as Black<E>);
        return mkRed(balance(sub1(a), x, b), y, mkBlack(c, elem, right));
    }

    function delformLeft(left : RedBlackTree<E>, elem : E, right : RedBlackTree<E>) : RedBlackTree<E> | undefined {
        const l = del(left);
        if (l === undefined) return undefined;
        if (isBlack(left)) return balleft(l, elem, right);
        else return mkRed(l, elem, right);
    }

    function delformRight(left : RedBlackTree<E>, elem : E, right : RedBlackTree<E>) : RedBlackTree<E> | undefined {
        const r = del(right);
        if (r === undefined) return undefined;
        if (isBlack(right)) return balright(left, elem, r);
        else return mkRed(left, elem, r);
    }

    function app(left : RedBlackTree<E>, right : RedBlackTree<E>) : RedBlackTree<E>  {
        if (isEmpty(left)) return right;
        if (isEmpty(right)) return left;
        if (isRed(left) && isRed(right)) {
            const [a, x, b] = splitRed(left);
            const [c, y, d] = splitRed(right);
            const bc = app(b, c);
            if (isRed(bc)) {
                const [b, z, c] = splitRed(bc);
                return mkRed(mkRed(a, x, b), z, mkRed(c, y, d));
            } else return mkRed(a, x, mkRed(bc, y, d));
        }
        if (isBlack(left) && isBlack(right)) {
            const [a, x, b] = splitBlack(left);
            const [c, y, d] = splitBlack(right);
            const bc = app(b, c);
            if (isRed(bc)) {
                const [b, z, c] = splitRed(bc);
                return mkRed(mkBlack(a, x, b), z, mkBlack(c, y, d));
            } else return balleft(a, x, mkBlack(bc, y, d));
        }
        if (isRed(right)) {
            const [b, x, c] = splitRed(right);
            return mkRed(app(left, b), x, c);
        }
        if (isRed(left)) {
            const [a, x, b] = splitRed(left);
            return mkRed(a, x, app(b, right));
        }
        throw new Error("RedBlackTree.app: unreachable reached.");
    }

    function del(tree : RedBlackTree<E>) : RedBlackTree<E> | undefined {
        if (tree === null) return undefined;
        const c = order.compare(x, tree.elem);
        switch(c) {
            case Relation.UNRELATED: throw new Error("RedBlackTree: Cannot compare '" + x + "' with '" + tree.elem + "'.");
            case Relation.LESS: return delformLeft(tree.left, tree.elem, tree.right);       
            case Relation.GREATER: return delformRight(tree.left, tree.elem, tree.right);   
            case Relation.EQUAL: return app(tree.left, tree.right);
            default: assertNever(c);  
        }
    }

    const result = del(tree);
    if (result === undefined) return undefined; else return forceBlack(result);
}

export function deleteElement<E>(order : Order<E>, x : E, tree : RedBlackTree<E>) : RedBlackTree<E> {
    const result = deleteExistingElement(order, x, tree);
    return result === undefined ? tree : result;
}

export function* iterateElements<E>(tree : RedBlackTree<E>) : Generator<E, void, void> {
    if (tree !== null) {
        yield* iterateElements(tree.left);
        yield tree.elem;
        yield* iterateElements(tree.right);
    }
}

export function blackHeight<E>(tree : RedBlackTree<E>) : nat {
    if (isEmpty(tree)) return 1;
    else if (isRed(tree)) return blackHeight(tree.left);
    else return blackHeight((tree as Black<E>).left) + 1;
}
