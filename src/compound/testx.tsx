/** @jsx compoundRender */
import { compoundRender, printRender } from "../editor/component.js";
console.log("testx ----- start");

const s = <div>Hello<br/>World!</div>;

printRender(s);
console.log("testx ----- end");