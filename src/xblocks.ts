import { Relation, force, nat, string } from "things"
import { example } from "./example.js";

export type Key = string
export interface Ephemerals {
    key : Key
    [key : string] : unknown;
}

export type Document = { ephemerals : Ephemerals, blocks : Block[] }
export type Block = { ephemerals : Ephemerals, parts : Part[] }  
export type Part = Line | Block
export type Line = { ephemerals : Ephemerals, fragments : Fragment[] }
export type Fragment = Text | Span
export type Span = { ephemerals : Ephemerals, fragments : (Text | Span)[] }
export type Text = { ephemerals : Ephemerals, text : string }

export type Path = (nat | Key)[]

export function isKey(ptr : nat | Key) : ptr is Key {
    return typeof ptr === "string";
}

export function isLine(part : Part) : part is Line {
    return Object.hasOwn(part, 'fragments');
}

export function isSpan(fragment : Fragment) : fragment is Span {
    return Object.hasOwn(fragment, 'fragments');
}

function compareFragments(fragments1 : Fragment[], fragments2 : Fragment[]) : Relation {
    let c = nat.compare(fragments1.length, fragments2.length);
    if (c !== Relation.EQUAL) return c;
    for (let i = 0; i < fragments1.length; i++) {
        const fragment1 = fragments1[i];
        const fragment2 = fragments2[i];
        if (isSpan(fragment1)) {
            if (!isSpan(fragment2)) return Relation.GREATER;
            c = compareFragments(fragment1.fragments, fragment2.fragments);
            if (c !== Relation.EQUAL) return c;
        } else {
            if (isSpan(fragment2)) return Relation.LESS;
            c = string.compare(fragment1.text, fragment2.text);
            if (c !== Relation.EQUAL) return c;
        }
    }
    return Relation.EQUAL;
}

function compareLines(line1 : Line, line2 : Line) : Relation {
    return compareFragments(line1.fragments, line2.fragments);
}

function compareParts(parts1 : Part[], parts2 : Part[]) : Relation {
    let c = nat.compare(parts1.length, parts2.length);
    if (c !== Relation.EQUAL) return c;
    for (let i = 0; i < parts1.length; i++) {
        const part1 = parts1[i];
        const part2 = parts2[i];
        if (isLine(part1)) {
            if (!isLine(part2)) return Relation.LESS;
            c = compareLines(part1, part2);
            if (c !== Relation.EQUAL) return c;
        } else {
            if (isLine(part2)) return Relation.GREATER;
            c = compareParts(part1.parts, part2.parts);
            if (c !== Relation.EQUAL) return c;
        }
    }
    return Relation.EQUAL;
}

export function compareDocuments(doc1 : Document, doc2 : Document) : Relation {
    return compareParts(doc1.blocks, doc2.blocks);
}

export const LF = "\n";
export const CR = "\r";
export const SPACE = "\x20";
export const SPACE_ALT = "\xA0";
export const LEFT_SPAN = "\uFF5F"; // FULLWIDTH LEFT WHITE PARENTHESIS (U+FF5F, Ps): ｟
export const LEFT_SPAN_ALT = "\u2E28"; // LEFT DOUBLE PARENTHESIS (U+2E28, Ps): ⸨
export const RIGHT_SPAN = "\uFF60"; // FULLWIDTH RIGHT WHITE PARENTHESIS (U+FF60, Pe): ｠
export const RIGHT_SPAN_ALT = "\u2E29"; // RIGHT DOUBLE PARENTHESIS (U+2E29, Pe): ⸩

function spaces(num : nat) : string {
    let s = "";
    for (let i = 0; i < num; i++) s += " ";
    return s;
}

export function writeDocument(document : Document, indent : nat) : string {

    const prefix = spaces(indent);   
    
    function removeNewlines(text : string) : string {
        let removing = false;
        let result = "";
        for (const c of text) {
            if (c === LF || c === CR) {
                if (!removing) {
                    removing = true;
                    result += " ";
                }
            } else {
                removing = false;
                result += c;
            }
        }
        return result;
    }    

    function wText(text : Text) : string {
        let result = "";
        for (const c of removeNewlines(text.text)) {
            if (c === LEFT_SPAN) result += LEFT_SPAN_ALT;
            else if (c === RIGHT_SPAN) result += RIGHT_SPAN_ALT;
            else result += c;
        }
        return result;
    }

    function wSpan(span : Span) : string {
        let result = LEFT_SPAN;
        for (const fragment of span.fragments) {
            if (isSpan(fragment)) result += wSpan(fragment);
            else result += wText(fragment);
        }
        result += RIGHT_SPAN;
        return result;
    }

    function wLine(line : Line) : string {
        let result = "";
        for (const fragment of line.fragments) {
            if (isSpan(fragment)) result += wSpan(fragment);
            else result += fragment.text;
        }
        if (result.startsWith(SPACE)) 
            result = SPACE_ALT + result.substring(SPACE.length);
        return result;
    }

    function indentBlock(lines : string[]) {
        for (let i = 0; i < lines.length; i++) {
            lines[i] = prefix + lines[i];
            if (i > 0) lines[i] = prefix + lines[i];
        }
    }

    function wBlock(block : Block) : string[] {
        let lines : string[] = [];
        for (const part of block.parts) {
            if (isLine(part)) {
                lines.push(wLine(part));
            } else {
                const blockLines = wBlock(part);
                indentBlock(blockLines);
                lines.push(...blockLines);
            }
        }
        return lines;
    }

    function indentTopBlock(lines : string[]) {
        for (let i = 1; i < lines.length; i++) {
            if (i > 0) lines[i] = prefix + lines[i];
        }
    }

    function wDocument(document : Document) : string[] {
        let lines : string[] = [];
        for (const block of document.blocks) {
            const blockLines = wBlock(block);
            indentTopBlock(blockLines);
            lines.push(...blockLines);
        }
        return lines;    
    }

    return wDocument(document).join(LF);
}

export function displayDocument(document : Document, log : (s : string) => void) {

    const indent = "  ";

    function displayText(prefix : string, text : Text) {
        log(prefix + "'" + text.text + "'");
    }

    function displaySpan(prefix : string, span : Span) {
        log(prefix + "Span");
        prefix += indent;
        for (const fragment of span.fragments) {
            if (isSpan(fragment)) displaySpan(prefix, fragment);
            else displayText(prefix, fragment);
        }
    }

    function displayLine(prefix : string, line : Line) {
        log(prefix + "Line");
        prefix += indent;
        for (const fragment of line.fragments) {
            if (isSpan(fragment)) displaySpan(prefix, fragment);
            else displayText(prefix, fragment);
        }
    }

    function displayBlock(prefix : string, block : Block) {
        log(prefix + "Block");
        prefix += indent;
        for (const part of block.parts) {
            if (isLine(part)) displayLine(prefix, part);
            else displayBlock(prefix, part);
        }
    }

    log("Document");

    for (const block of document.blocks) {
        displayBlock(indent, block);
    }
}

let nextKeyBase = 0;

function newKey() : string {
    return `key-` + (nextKeyBase++);
}

export function createEphemerals() : Ephemerals {
    return { key : newKey() };
}

export function createDocument(...blocks : Block[]) : Document {
    return { ephemerals : createEphemerals(), blocks : blocks }
}

export function createLine(...fragments : (Text | Span)[]) : Line {
    return { ephemerals : createEphemerals(), fragments : fragments };
}

export function createBlock(...parts : Part[]) : Block {
    return { ephemerals : createEphemerals(), parts : parts };
}

export function createSpan(...fragments : (Text | Span)[]) : Span {
    return { ephemerals : createEphemerals(), fragments : fragments }
}

export function createText(text : string = "") : Text {
    return { ephemerals : createEphemerals(), text : text };
}

function line(text? : string) : Line {
    if (text === undefined) return createLine();
    else return createLine(createText(text));
}

function block(...parts : (Line | Block)[]) : Block {
    return createBlock(...parts);
}

function paragraph(text : string) : Block {
    return block(line(text));
}

const exampleDocument : Document = createDocument(block(
    block( // comment block
      line("% This is a comment."),
      line("This is the second line of the comment."),
      line("And here is the third one.")
    ),
    block( // theorem 
        line("theorem Modus-Ponens: B"),
        paragraph("premise: implies(A, B)"),
        paragraph("premise: A")
    ),
    block(
        line("theorem Universal-Introduction:"),
        paragraph("for-all(x. A[x])"),
        paragraph("premise: x. A[x]")
    ),
    block(
        line("theorem Truth-1: true")
    ),
    block(
        line("theorem Truth-2: implies(A, equals(A, true))")
    ),
    block(
        line("theorem Implication-1: implies(A, implies(B, A))")
    ),
    block(
        line("theorem Implication-2:"),
        block(
            line("implies"),
            paragraph("implies(A, implies(B, C))"),
            paragraph("implies(implies(A, B), implies(B, C))")
        )
    ),
    block(
        line("theorem Universal-1: implies(for-all(x. A[x]), A[x])"),
    ),
    block(
        line("theorem Universal-2:"),
        block(
            line("implies"),
            paragraph("for-all(x. implies(A, B[x]))"),
            paragraph("implies(A, for-all(x. B[x]))")
        )
    ),
    paragraph("theorem Equality-1: equals(x, x)"),
    paragraph("theorem Equality-2: implies(equals(x, y), implies(A[x], A[y]))")
));

const INDENT = 2;

const lines = writeDocument(exampleDocument, INDENT);
console.log("--------------------");
console.log(lines);
console.log("--------------------");

displayDocument(exampleDocument, console.log);

function makeLines(input : string) : string[] {
    let lines : string[] = [];
    function write(s : string) {
        lines[lines.length - 1] += s;
    }
    function newline() {
        lines.push("");
    }
    newline();
    // LFCR, CRLF, LF, CR are all considered newlines
    let prevNL : string | null = null;
    for (const c of input) {
        if (c === LF || c === CR) {
            if (prevNL !== null) {
                if (c === prevNL) {
                    newline();
                } else {
                    prevNL = null;
                }
            } else {
                newline();
                prevNL = c;
            }
        } else {
            prevNL = null;
            write(c);
        }
    }
    return lines;
}

function startsWithSpaces(n : nat, s : string) : boolean {
    for (const c of s) {
        if (c === SPACE) {
            if (n > 0) n--;
            else return true;
        } else {
            return n <= 0;
        }
    }
    return n <= 0;
}

export function readDocument(input : string, indent : nat) : Document {

    function rBlock(lines : string[], row : nat, indentation : nat) : { rows : nat, result : Block } {
        let line = lines[row];  
        if (!startsWithSpaces(indentation, line)) throw new Error("Missing indentation");      
        let blockLines : string[] = [line.substring(indentation)];
        let rows = 1;
        while (row + rows < lines.length && 
            startsWithSpaces(indentation + indent, lines[row + rows])) 
        {
            blockLines.push(lines[row + rows].substring(indentation + indent));
            rows += 1;
        }
        let r = 0;
        let parts : Part[] = [];
        while (r < rows) {
            let line = blockLines[r];
            if (!startsWithSpaces(indent, line)) {
                parts.push(rLine(line));
                r += 1;
            } else {
                const block = rBlock(blockLines, r, indent);
                parts.push(block.result);
                r += block.rows;
            }
        }
        return { rows : rows, result : createBlock(...parts) };
    }

    function rLine(line : string) : Line {
        const stack : Fragment[][] = [[]];
        let text = "";
        function commit() {
            if (text.length > 0) {
                stack[stack.length - 1].push(createText(text));
                text = "";
            }
        }
        function close() : boolean {
            if (stack.length > 1) {
                commit();
                const fragments = force(stack.pop());
                stack[stack.length - 1].push(createSpan(...fragments));
                return true;
            } else {
                return false;
            }
        }
        let first = true;
        for (const c of line) {
            if (first && c === SPACE_ALT) text += SPACE;
            first = false;
            if (c === LEFT_SPAN) {
                commit();
                stack.push([]);
            } else if (c === RIGHT_SPAN) {
                if (!close()) {
                    text += RIGHT_SPAN_ALT;
                }
            } else {
                text += c;
            }
        }
        while (close());
        commit();
        return createLine(...stack[0]);
    }

    let row = 0;
    let result : Block[] = [];
    const lines = makeLines(input);
    while (row < lines.length) {
        const block = rBlock(lines, row, 0);
        result.push(block.result);
        row += block.rows;
    }
    return createDocument(...result);
}

const D = readDocument(lines, INDENT);

console.log("~~~~~~~~~~~~~~~~~~");
displayDocument(D, console.log);
console.log("###############");
console.log("comparison: ", Relation[compareDocuments(exampleDocument, D)], " | ", Relation[compareDocuments(D, exampleDocument)]); 



