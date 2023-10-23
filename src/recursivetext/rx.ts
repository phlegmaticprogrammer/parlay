import { Relation, nat, string } from "things"
import { createExampleDocument } from "./example.js"
import { read } from "fs"

/**
 * Abstract representation of a Recursive Text (RX) document.  
 */ 
export interface RX<Document, Block, Line> {

    isLine(lineOrBlock : Line | Block) : lineOrBlock is Line
    
    line(text? : string) : Line

    block(...items : (Line | Block)[]) : Block
    
    document(...blocks : Block[]) : Document

    fromLine(line : Line) : string

    fromBlock(block : Block) : Iterable<Line | Block>

    fromDocument(document : Document) : Iterable<Block>

}

export type SimpleDocument = SimpleBlock[]
export type SimpleBlock = (SimpleLine | SimpleBlock)[]  
export type SimpleLine = string

class SimpleRX implements RX<SimpleDocument, SimpleBlock, SimpleLine> {
    isLine(lineOrBlock: SimpleLine | SimpleBlock): lineOrBlock is string {
        return typeof lineOrBlock === "string";
    }
    line(text?: string | undefined): SimpleLine {
        return text ?? "";
    }
    block(...items: (SimpleLine | SimpleBlock)[]): SimpleBlock {
        return items;
    }
    document(...blocks: SimpleBlock[]): SimpleDocument {
        return blocks;
    }
    fromLine(line: SimpleLine): string {
        return line;
    }
    fromBlock(block: SimpleBlock): Iterable<SimpleLine | SimpleBlock> {
        return block;
    }
    fromDocument(document: SimpleDocument): Iterable<SimpleBlock> {
        return document;
    }
}
export let simpleRX = new SimpleRX();

export function displayDocument<D, B, L>(rx : RX<D, B, L>, document : D, 
    log : (s : string) => void = console.log) : void 
{

    const indent = "  ";

    function displayLine(prefix : string, line : L) {
        log(prefix + `Line "${line}"`);
    }

    function displayBlock(prefix : string, block : B) {
        log(prefix + "Block");
        prefix += indent;
        for (const p of rx.fromBlock(block)) {
            if (rx.isLine(p)) displayLine(prefix, p);
            else displayBlock(prefix, p);
        }
    }

    log("Document");

    for (const block of rx.fromDocument(document)) {
        displayBlock(indent, block);
    }
}

export function compareDocuments<D, B, L>(rx : RX<D, B, L>, doc1 : D, doc2 : D) : Relation {

    type Part = B | L

    function compareLines(line1 : L, line2 : L) : Relation {
        return string.compare(rx.fromLine(line1), rx.fromLine(line2));
    }

    function compareParts(parts1 : Part[], parts2 : Part[]) : Relation {
        let c = nat.compare(parts1.length, parts2.length);
        if (c !== Relation.EQUAL) return c;
        for (let i = 0; i < parts1.length; i++) {
            const part1 = parts1[i];
            const part2 = parts2[i];
            if (rx.isLine(part1)) {
                if (!rx.isLine(part2)) return Relation.LESS;
                c = compareLines(part1, part2);
                if (c !== Relation.EQUAL) return c;
            } else {
                if (rx.isLine(part2)) return Relation.GREATER;
                c = compareParts([...rx.fromBlock(part1)], [...rx.fromBlock(part2)]);
                if (c !== Relation.EQUAL) return c;
            }
        }
        return Relation.EQUAL;
    }
    return compareParts([...rx.fromDocument(doc1)], [...rx.fromDocument(doc2)]);
}

export const LF = "\n";
export const CR = "\r";
export const SPACE = "\x20";
export const SPACE_ALT = "\xA0";

export function writeDocument<D, B, L>(rx : RX<D, B, L>, document : D, crlf : boolean = false) : string 
{
    const newline = crlf ? CR + LF : LF;
    const prefix = SPACE + SPACE;
    function removeNewlines(text : string) : string {
        let removing = false;
        let result = "";
        for (const c of text) {
            if (c === LF || c === CR) {
                if (!removing) {
                    removing = true;
                    result += SPACE;
                }
            } else {
                removing = false;
                result += c;
            }
        }
        return result;
    }    

    function wLine(line : L) : string {
        let result = removeNewlines(rx.fromLine(line));
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

    function wBlock(block : B) : string[] {
        let lines : string[] = [];
        for (const part of rx.fromBlock(block)) {
            if (rx.isLine(part)) {
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
            lines[i] = prefix + lines[i];
        }
    }

    function wDocument(document : D) : string[] {
        let lines : string[] = [];
        for (const block of rx.fromDocument(document)) {
            const blockLines = wBlock(block);
            indentTopBlock(blockLines);
            lines.push(...blockLines);
        }
        return lines;    
    }

    return wDocument(document).join(newline);
}

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

export function readDocument<D, B, L>(rx : RX<D, B, L>, input : string) : D {
    type Part = L | B

    const indent = 2;

    function rBlock(lines : string[], row : nat, indentation : nat) : { rows : nat, result : B } {
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
        return { rows : rows, result : rx.block(...parts) };
    }

    function rLine(line : string) : L {
        if (line.startsWith(SPACE_ALT))
            return rx.line(SPACE + line.substring(SPACE_ALT.length));
        else
            return rx.line(line);
    }

    let row = 0;
    let result : B[] = [];
    const lines = makeLines(input);
    while (row < lines.length) {
        const block = rBlock(lines, row, 0);
        result.push(block.result);
        row += block.rows;
    }
    return rx.document(...result);
}

let exampleDocument = createExampleDocument(simpleRX, 3);

displayDocument(simpleRX, exampleDocument);
console.log("comparison with itself: ", compareDocuments(simpleRX, exampleDocument, exampleDocument) === Relation.EQUAL);
const text = writeDocument(simpleRX, exampleDocument);
console.log("-----------");
console.log(text);
const doc = readDocument(simpleRX, text);
console.log("-----------");
console.log("comparison with read: ", compareDocuments(simpleRX, exampleDocument, doc) === Relation.EQUAL);
console.log("-------- read");
let ex = `
hello
 world
`;
const doc2 = readDocument(simpleRX, ex);
displayDocument(simpleRX, doc2);









