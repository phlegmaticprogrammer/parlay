import { configureDebugging, runTests } from "things";
import "./recursivetext/tests.js";
import "./crdt/RedBlackTree.test.js";

/*console.log("Hey! :-)");
let called = false;
const promise = new Promise((resolve, reject) => {called = true; resolve(0)});
if (called) throw new Error("Promise has been resolved already.");*/

configureDebugging(console.log);
runTests();