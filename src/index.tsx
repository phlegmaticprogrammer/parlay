/** @jsx compoundRender */

import { compoundRender, createCompound, printRender, renderSimpleDocument } from "./editor/index.js";
import { viewColorScheme } from "./view_colorscheme.js";
import { BaseTheoryPretty, example } from "./example.js";
import { ParlaySimpleEditor } from "./parlay_simple_editor.js";
import { readDocument, simpleRX } from "recursivetext/rx.js";

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

function registerColorschemeViewers() {
    const viewer = document.getElementById("colorscheme-viewer")!;
    viewer.appendChild(viewColorScheme("monokai-classic"));
    viewer.appendChild(viewColorScheme("monokai-pro"));
    viewer.appendChild(viewColorScheme("solarized-light"));
    viewer.appendChild(viewColorScheme("solarized-dark"));
    viewer.appendChild(viewColorScheme("gruvbox-light-hard"));
    viewer.appendChild(viewColorScheme("gruvbox-light"));
    viewer.appendChild(viewColorScheme("gruvbox-light-soft"));
    viewer.appendChild(viewColorScheme("gruvbox-dark-hard"));
    viewer.appendChild(viewColorScheme("gruvbox-dark"));
    viewer.appendChild(viewColorScheme("gruvbox-dark-soft"));
}

function setupEditor() {
    const d = readDocument(simpleRX, BaseTheoryPretty);
    const r = renderSimpleDocument(d);
    const compound = createCompound(document.getElementById("compound")!, console.log);
    compound.render(r);
    //compound.render(<div><span editable={false}>Hello</span><span editable={true}>beautiful</span><span editable={false}>World</span></div>);
}



function run() {
    setupEditor();
    const root = document.getElementById("parlay-editor") as HTMLDivElement;
    const debugRoot = document.getElementById("parlay-debug") as (HTMLDivElement | null);
    const editor = new ParlaySimpleEditor(root, debugRoot);
    editor.load(example);
    function cmd_light() {
        const body = document.getElementsByTagName("body").item(0)!;
        body.classList.replace("solarized-dark", "solarized-light");
    }
    function cmd_dark() {
        const body = document.getElementsByTagName("body").item(0)!;
        body.classList.replace("solarized-light", "solarized-dark");
    }
    function cmd_plain() {
        //model.update("plain");
    }
    function cmd_text() {
        //model.update("text");
    }
    function cmd_structure() {
        //model.update("structure");
    }
    function cmd_abort() {
        //model.abort();
    }
    function cmd_complete() {
        //model.complete();
    }
    register("cmd-plain", cmd_plain);
    register("cmd-light", cmd_light);
    register("cmd-dark", cmd_dark);
    register("cmd-text", cmd_text);
    register("cmd-structure", cmd_structure);
    register("cmd-abort", cmd_abort);
    register("cmd-complete", cmd_complete);
    /*var character = '  ';
    var font = '24px stixtwotext';
    console.log('Width of character ' + character + ' is ' + calculateCharacterWidthCh(character, font) + ' ch.');*/
}

window.addEventListener('DOMContentLoaded', () => {
    run();
});

new EventSource('/esbuild').addEventListener('change', () => location.reload());
