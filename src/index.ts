import { hello1 } from "./module1.js";
import { ParlayEditor } from "./parlay_editor.js";

export { hello1 } from "./module1.js";


function run() {
    const root = document.getElementById("parlay-editor") as HTMLDivElement;
    new ParlayEditor(root);
}

window.addEventListener('DOMContentLoaded', () => {
    run();
});

new EventSource('/esbuild').addEventListener('change', () => location.reload());
