import { Hash, Order, Relation, assertNever, boolean, combineHashes, freeze, nat, string } from "things"

export interface SemiLattice<R> extends Order<R>, Hash<R> {

    bottom : R

    join(x : R, y : R) : R
    
}

export const natR : SemiLattice<nat> = {
    
    name: "ℕ",

    bottom: 0,

    join: function (x: nat, y: nat): nat {
        return Math.max(x, y);
    },

    compare: function (x: nat, y: nat): Relation {
        return nat.compare(x, y);
    },

    equal: function (x: nat, y: nat): boolean {
        return nat.equal(x, y);
    },

    is: function (value: any): value is nat {
        return nat.is(value);
    },

    assert: function (value: any): asserts value is nat {
        nat.assert(value);
    },

    display: function (value: nat): string {
        return nat.display(value);
    },

    hash: function (value: nat): number {
        return nat.hash(value);
    }
};
freeze(natR);

export const boolR : SemiLattice<boolean> = {

    name: "𝔹",

    bottom: false,

    join: function (x: boolean, y: boolean): boolean {
        return x || y;
    },

    compare: function (x: boolean, y: boolean): Relation {
        return boolean.compare(x, y);
    },

    equal: function (x: boolean, y: boolean): boolean {
        return boolean.equal(x, y);
    },

    is: function (value: any): value is boolean {
        return boolean.is(value);
    },

    assert: function (value: any): asserts value is boolean {
        boolean.assert(value);
    },

    display: function (value: boolean): string {
        return boolean.display(value);
    },

    hash: function (value: boolean): number {
        return boolean.hash(value);
    }
}

const PairHash = string.hash("PairR");
export function PairR<A, B>(A : SemiLattice<A>, B : SemiLattice<B>) : SemiLattice<[A, B]> {
    function is(value : any) : boolean {
        if (!Array.isArray(value)) return false;
        if (value.length !== 2) return false;
        return A.is(value[0]) && B.is(value[1]);
    }
    const semilattice : SemiLattice<[A, B]> = {
        name: "(" + A.name + ", " + B.name + ")",
        bottom: [A.bottom, B.bottom],
        join: function (x: [A, B], y: [A, B]): [A, B] {
            return [A.join(x[0], y[0]), B.join(x[1], y[1])];
        },
        compare: function (x: [A, B], y: [A, B]): Relation {
            const a = A.compare(x[0], y[0]);
            if (a === Relation.UNRELATED) return Relation.UNRELATED;
            const b = B.compare(x[1], y[1]);
            if (b === Relation.UNRELATED) return Relation.UNRELATED;
            if (a === Relation.EQUAL) return b;
            if (b === Relation.EQUAL) return a;
            if (a === b) return a; else return Relation.UNRELATED;
        },
        equal: function (x: [A, B], y: [A, B]): boolean {
            return A.equal(x[0], y[0]) && B.equal(x[1], y[1]);
        },
        is: function (value: any): value is [A, B] {
            return is(value);
        },
        assert: function (value: any): asserts value is [A, B] {
            if (!is(value)) throw new Error("not a pair: " + value);
        },
        display: function (value: [A, B]): string {
            return "(" + A.display(value[0]) + ", " + B.display(value[1]) + ")";
        },
        hash: function (value: [A, B]): number {
            return combineHashes([PairHash, A.hash(value[0]), B.hash(value[1])]);
        }
    };
    return semilattice;
}

const LexPairHash = string.hash("LexPairR");
export function LexPairR<A, B>(A : SemiLattice<A>, B : SemiLattice<B>) : SemiLattice<[A, B]> {
    function is(value : any) : boolean {
        if (!Array.isArray(value)) return false;
        if (value.length !== 2) return false;
        return A.is(value[0]) && B.is(value[1]);
    }
    const semilattice : SemiLattice<[A, B]> = {
        name: "[" + A.name + ", " + B.name + "]",
        bottom: [A.bottom, B.bottom],
        join: function (x: [A, B], y: [A, B]): [A, B] {
            const a = A.compare(x[0], y[0]);
            switch(a) {
            case Relation.GREATER: return x;
            case Relation.LESS: return y;
            case Relation.EQUAL: return [x[0], B.join(x[1], y[1])];
            case Relation.UNRELATED: return [A.join(x[0], y[0]), B.bottom];
            default: assertNever(a);
            }
        },
        compare: function (x: [A, B], y: [A, B]): Relation {
            const a = A.compare(x[0], y[0]);
            if (a !== Relation.EQUAL) return a;
            return B.compare(x[1], y[1]);
        },
        equal: function (x: [A, B], y: [A, B]): boolean {
            return A.equal(x[0], y[0]) && B.equal(x[1], y[1]);
        },
        is: function (value: any): value is [A, B] {
            return is(value);
        },
        assert: function (value: any): asserts value is [A, B] {
            if (!is(value)) throw new Error("not a pair: " + value);
        },
        display: function (value: [A, B]): string {
            return "[" + A.display(value[0]) + ", " + B.display(value[1]) + "]";
        },
        hash: function (value: [A, B]): number {
            return combineHashes([LexPairHash, A.hash(value[0]), B.hash(value[1])]);
        }
    };
    return semilattice;
}

/*export function SetR<E>(E : SemiLattice<E>) : SemiLattice<PureSet<E>> {
}*/

// only hashable 