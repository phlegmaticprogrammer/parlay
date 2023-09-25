import { RGB, mix, parseColor, printColor } from "./colors.js";

export type Basic = {
    fg : string,
    bg : string,
    red : string,
    orange : string,
    yellow : string,
    green : string,
    cyan : string,
    blue : string,
    purple : string
}

export function generateColorScheme(basic : Basic) {
    const fg = parseColor(basic.fg);
    const bg = parseColor(basic.bg);
    function write(colorname : string, rgb : RGB) {
        console.log(`--colorscheme-${colorname}: ` + printColor(rgb) + ";");
    }
    function accent(colorname : string) {
        // @ts-ignore
        const color = parseColor(basic[colorname]);
        write(colorname, color);
        const dimmed = mix(color, bg, 0.23);
        write(colorname + "-dimmed", dimmed); 
    }
    write("bg0", bg);
    write("bg1", mix(bg, fg, 0.11));
    write("bg2", mix(bg, fg, 0.22));
    write("bg3", mix(bg, fg, 0.33));
    write("bg4", mix(bg, fg, 0.44));
    write("gray", mix(bg, fg, 0.55));
    write("fg4", mix(bg, fg, 0.66));
    write("fg3", mix(bg, fg, 0.77));
    write("fg2", mix(bg, fg, 0.88));
    write("fg1", fg);
    write("fg0", mix(bg, fg, 1.11));
    console.log("");
    accent("red");
    accent("orange");
    accent("yellow");
    accent("green");
    accent("cyan");
    accent("blue");
    accent("purple");
    console.log("");
}

const SolarizedLight : Basic = {
    fg: "#657b83",
    bg: "#fdf6e3",
    red: "#dc322f",
    orange: "#cb4b16",
    yellow: "#b58900",
    green: "#859900",
    cyan: "#2aa198",
    blue: "#268bd2",
    purple: "#d33682"
}

const SolarizedDark : Basic = {
    fg: "#839496",
    bg: "#002b36",
    red: "#dc322f",
    orange: "#cb4b16",
    yellow: "#b58900",
    green: "#859900",
    cyan: "#2aa198",
    blue: "#268bd2",
    purple: "#d33682"
}

const MonokaiPro : Basic = {
    "red": "#ff6188",
    "orange": "#fc9867",
    "yellow": "#ffd866",
    "green": "#a9dc76",
    "cyan": printColor(mix(parseColor("#a9dc76"), parseColor("#78dce8"), 0.5)),
    "blue": "#78dce8",
    "purple": "#ab9df2",
    "bg": "#2d2a2e",
    "fg": "#fcfcfa",
}

const MonokaiClassic : Basic = {
    "red": "#f92672",
    "orange": "#fd971f",
    "yellow": "#e6db74",
    "green": "#a6e22e",
    "cyan": printColor(mix(parseColor("#a6e22e"), parseColor("#66d9ef"), 0.5)),
    "blue": "#66d9ef",
    "purple": "#ae81ff",
    "bg": "#272822",
    "fg": "#fdfff1",
}


console.log("Light");
generateColorScheme(SolarizedLight);
console.log("Dark");
generateColorScheme(SolarizedDark);
console.log("Monokai Pro");
generateColorScheme(MonokaiPro);
console.log("Monokai Classic");
generateColorScheme(MonokaiClassic);
