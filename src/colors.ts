export type RGB = [number, number, number];

export function parseColor(hex : string) : RGB {
    let r = 0, g = 0, b = 0;

    if (hex.length == 7 && hex[0] === "#") {
        r = Number.parseInt(hex[1] + hex[2], 16);
        g = Number.parseInt(hex[3] + hex[4], 16);
        b = Number.parseInt(hex[5] + hex[6], 16);
    } else throw new Error();

    return [r, g, b];
}

export function printColor(rgb : RGB) : string {
    function hex(b : number) : string {
        b = Math.round(b);
        const s = b.toString(16);
        return (s.length < 2) ? "0" + s : s;
    }
    return `#${hex(rgb[0])}${hex(rgb[1])}${hex(rgb[2])}`;
}

export function minus(u : RGB, v : RGB) : RGB {
    return [u[0] - v[0], u[1] - v[1], u[2] - v[2]];
}

export function dot(u : RGB, v : RGB) : number {
    return u[0] * v[0] + u[1] * v[1] + u[2] * v[2];
}

export function abs(u : RGB) : number {
    return Math.sqrt(dot(u, u));
}

export function distance(u : RGB, v : RGB) : number {
    return abs(minus(u, v));
}

export const black : RGB = [0, 0, 0];
export const white : RGB = [255, 255, 255];

export function mix(from : RGB, to : RGB, alpha : number) : RGB {
    const r = (1-alpha) * from[0] + alpha * to[0];
    const g = (1-alpha) * from[1] + alpha * to[1];
    const b = (1-alpha) * from[2] + alpha * to[2];
    return [r, g, b];
}

export function closestMix(from : RGB, to : RGB, color : RGB) : number {
    if (distance(from, to) < 0.001) return 0.5;
    const v = minus(to, from);
    const alpha = dot(v, minus(color, from)) / dot(v, v);
    return alpha;
}

function closestInterpolation(from : RGB, to : RGB, color : RGB) {
    const alpha = closestMix(from, to, color);
    console.log("closest color is at " + alpha);
    const p = mix(from, to, alpha);
    console.log("c = ", color);
    console.log("p = ", p);
}

for (const color of ["#cc241d", "#98971a", "#d79921", "#458588"]) {
    const rgb = parseColor(color);
    console.log("gray: ", (rgb[0] + rgb[1] + rgb[2]) / 3);
}

const A = parseColor("#076678");
const B = parseColor("#fbf1c7");
const C = parseColor("#458588");
closestInterpolation(A, B, C);




