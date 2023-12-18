import { Test, nat } from "things";

function tween(start : number, stop : number) : nat {
    if (start < stop) {
        const flip = 1;
        const middle = (start + stop) / 2;
        if (flip < 0.5) return tween(start, middle) + 1;
        else return tween(middle, stop) + 1;
    } else {
        return 0;
    }
}

Test(() => {
    console.log("tweens: " + tween(0, 1));
}, "Numbers as Stable Identifiers");