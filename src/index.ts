import { example } from "./example.js";
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

function register(id : string, handler : (id : string) => void) {
    document.getElementById(id)!.addEventListener("click", (event) => handler(id));
} 

function run() {
    const root = document.getElementById("parlay-editor") as HTMLDivElement;
    const editor = new ParlayEditor(root);
    function cmd_light() {
        const body = document.getElementsByTagName("body").item(0)!;
        body.classList.replace("solarized-dark", "solarized-light");
    }
    function cmd_dark() {
        const body = document.getElementsByTagName("body").item(0)!;
        body.classList.replace("solarized-light", "solarized-dark");
    }
    function cmd_text() {
        editor.view(example, false);
    }
    function cmd_structure() {
        editor.view(example, true);
    }
    register("cmd-light", cmd_light);
    register("cmd-dark", cmd_dark);
    register("cmd-text", cmd_text);
    register("cmd-structure", cmd_structure);
    var character = '  ';
    var font = '24px stixtwotext';
    console.log('Width of character ' + character + ' is ' + calculateCharacterWidthCh(character, font) + ' ch.');    
}

window.addEventListener('DOMContentLoaded', () => {
    run();
});

new EventSource('/esbuild').addEventListener('change', () => location.reload());
