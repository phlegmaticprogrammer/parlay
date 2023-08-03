import { hello1 } from "./module1.js";
import { ParlayEditor } from "./parlay_editor.js";

export { hello1 } from "./module1.js";

function calculateCharacterWidth(character : string, font : string) : number | undefined {
    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
    if (!context) return undefined;
    context.font = font;
    var metrics = context.measureText(character);
    return metrics.width;
}

function calculateCharacterWidthCh(character : string, font : string) : number | undefined {
    const w = calculateCharacterWidth(character, font);
    const z = calculateCharacterWidth("0", font);
    return w && z ? w/z : undefined;
}

function run() {
    const root = document.getElementById("parlay-editor") as HTMLDivElement;
    new ParlayEditor(root);
    var character = '  ';
    var font = '24px stixtwotext';
    console.log('Width of character ' + character + ' is ' + calculateCharacterWidthCh(character, font) + ' ch.');    
}

window.addEventListener('DOMContentLoaded', () => {
    run();
});

new EventSource('/esbuild').addEventListener('change', () => location.reload());
