import { configureDebugging, runTests } from "things";
import "./recursivetext/tests.js";

configureDebugging(console.log);
runTests();