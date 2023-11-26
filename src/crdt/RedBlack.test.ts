import { Test, assertFalseT, assertT, nat } from "things";
import * as RB from "./RedBlackTree.js";
import {RedBlackSet} from "./RedBlackSet.js";

function assertRB(tree : RB.RedBlackTree<nat>) {
    //console.log("-------------");
    //printRB(tree);

    function height(tree : RB.RedBlackTree<nat>) : nat {
        if (RB.isEmpty(tree)) return 1;
        const lh = height(tree.left);
        const rh = height(tree.right);
        assertT(lh === rh);
        if (RB.isRed(tree)) {
            assertFalseT(RB.isRed(tree.left));
            assertFalseT(RB.isRed(tree.right));
            return lh;
        } else {
            return lh + 1;
        }
    }

    height(tree);
}

function printRB(tree : RB.RedBlackTree<nat>) {

    function print(indent : string, tree : RB.RedBlackTree<nat>) {
        if (RB.isEmpty(tree)) console.log(indent + "*");
        else {
            const color = RB.isRed(tree) ? "Red" : "Black";
            console.log(indent + color + " " + tree.elem);
            print(indent + "  ", tree.left);
            print(indent + "  ", tree.right);
        }
    }

    print("", tree);
}

function assertEqualSetTree(A : Set<nat>, B : RB.RedBlackTree<nat>) {
    //console.log("number of elements: " + A.size);
    const sorted = [...RB.iterateElements(B)];
    assertT(A.size === sorted.length);
    let last = -1;
    for (const e of sorted) {
        assertT(last < e);
        last = e;
        assertT(A.has(e));    
    }
    for (const e of A) {
        assertT(RB.isElementOf(nat, e, B));
    }
    assertRB(B);
}

function insertAndDeleteTree(N : nat, MAX : nat) {
    let numbers : number[] = [];
    let t = RB.empty<nat>();
    for (let i = 0; i < N; i++) {
        const x = Math.round(Math.random() * MAX);
        numbers.push(x);
        t = RB.insertElement(nat, x, t);
    }
    let s = t;
    let deleted = new Set(numbers);
    assertEqualSetTree(deleted, s);
    for (let i = 0; i < numbers.length; i++) {
        const pos = Math.round(Math.random() * (numbers.length - 1));
        const x = numbers[pos];
        deleted.delete(x);
        s = RB.deleteElement(nat, x, s);
    }
    assertEqualSetTree(deleted, s);
}

Test(() => {
    insertAndDeleteTree(10000, 100000);
    insertAndDeleteTree(20000, 10000);
}, "RedBlackTree Insert/Delete");

function assertEqualSets(A : Set<nat>, B : RedBlackSet<nat>) {
    //console.log("number of elements: " + A.size);
    assertT(A.size === B.size);
    let last = -1;
    for (const e of B) {
        assertT(last < e);
        last = e;
        assertT(A.has(e));    
    }
    for (const e of A) {
        assertT(B.has(e));
    }
}

function insertAndDeleteSet(N : nat, MAX : nat) {
    let numbers : number[] = [];
    let t = RedBlackSet(nat);
    for (let i = 0; i < N; i++) {
        const x = Math.round(Math.random() * MAX);
        numbers.push(x);
        t = t.insert(x);
    }
    let s = t;
    let deleted = new Set(numbers);
    assertEqualSets(deleted, s);
    for (let i = 0; i < numbers.length; i++) {
        const pos = Math.round(Math.random() * (numbers.length - 1));
        const x = numbers[pos];
        deleted.delete(x);
        s = s.delete(x);
    }
    assertEqualSets(deleted, s);
}

Test(() => {
    insertAndDeleteSet(10000, 100000);
    insertAndDeleteSet(20000, 10000);
}, "RedBlackSet Insert/Delete");
