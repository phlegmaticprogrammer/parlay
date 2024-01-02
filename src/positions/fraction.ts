import { Relation, nat } from "things";

export type Fraction = number[]

export const FMIN : Fraction = [];
export const FMAX : Fraction = [1];

export function displayFraction(fraction : Fraction) {
    return "[" + fraction.map(n => "" + n).join(", ") + "]";
}

export function compareFractions(f : Fraction, g : Fraction) : Relation {
    let m = Math.min(f.length, g.length);
    for (let i = 0; i < m; i++) {
        if (f[i] < g[i]) return Relation.LESS;
        if (f[i] > g[i]) return Relation.GREATER;
        if (f[i] !== g[i]) return Relation.UNRELATED;
    }
    return nat.compare(f.length, g.length);
}

function middle(a : number, b : number) : number | undefined {
    const c = (a + b) / 2;
    if (a < c && c < b) return c;
    return undefined;
}

export function fractionInBetween(f : Fraction, g : Fraction) : Fraction {
    let h : Fraction = [];
    let m = Math.min(f.length, g.length);
    for (let i = 0; i < m; i++) {
        const x = middle(f[i], g[i]);
        if (x !== undefined) {
            h.push(x);
            const r = Math.random() * 0.8 + 0.1;
            h.push(r);
            return h;
        }
        if (f[i] < g[i]) {
            h.push(f[i]);
            h.push(...fractionInBetween(f.slice(i+1), FMAX));
            return h;
        } else if (f[i] > g[i]) {
            h.push(g[i]);
            h.push(...fractionInBetween(g.slice(i+1), FMAX));
            return h;
        } else if (f[i] === g[i]) {
            h.push(f[i]);
        } else throw new Error("internal error");
    }
    throw new Error("fractions are the same");
}


