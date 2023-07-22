import { hello1 } from "./module1.js";

export { hello1 } from "./module1.js";

function run() {
    const elem = document.getElementById("main")!;
    elem.innerText = hello1();
}

window.addEventListener('DOMContentLoaded', () => {
    run();
});
