import { nat } from "things"

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

export function isLine(part : Part) : part is Line {
    return Object.hasOwn(part, 'fragments');
}

export function isSpan(fragment : Fragment) : fragment is Span {
    return Object.hasOwn(fragment, 'fragments');
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

export function writeDocument(document : Document, indent : nat) : string[] {

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

    return wDocument(document);
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

const exampleDocument : Document = createDocument(
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
);

const lines = writeDocument(exampleDocument, 2);
for (const line of lines) {
    console.log("|" + line);
}


/*
let nextKeyBase = 0;

function newKey() : string {
    return `key-` + (nextKeyBase++);
}

export function createEphemerals() : Ephemerals {
    return { key : newKey() };
}

export function createLine(fragments : (Text | Span)[] = []) : Line {
    return { ephemerals : createEphemerals(), fragments : fragments };
}

export function createBlock(first : Line = createLine(), rest : (Line | Block)[] = []) : Block {
    return { ephemerals : createEphemerals(), first : first, rest : rest };
}

export function createSpan(fragments : (Text | Span)[] = []) : Span {
    return { ephemerals : createEphemerals(), fragments : fragments }
}

export function createText(text : string = "") : Text {
    return { ephemerals : createEphemerals(), text : text };
}

export function readBlocks(lines : string[], indent : nat) : (Line | Block)[] {
    function rBlock(row : nat, indentation : nat) : { rows : nat, result : Block } {
        let line = lines[row];        
        if (!line.startsWith(spaces(indentation))) 
            throw new Error("Block must start with " + indentation + " spaces.");
        const first = rLine(line.substring(indentation));
        let rows = 1;
        let rest : (Line | Block)[] = [];
        indentation += indent;
        while (true) {
            const blockOrLine = rBlockOrLine(row + rows, indentation);
            if (blockOrLine === null) break;
            rest.push(blockOrLine.result);
            rows += blockOrLine.rows;
        }
        return { rows : rows, result: createBlock(first, rest) };
    }
    function rBlockOrLine(row : nat, indentation : nat) : { rows : nat, result : Block | Line } | null {
        if (row >= lines.length) return null;
        let line = lines[row];
        if (!line.startsWith(spaces(indentation))) return null;
        line = line.substring(indentation);
        if (!line.startsWith(spaces(indent))) { // it's a line
            return { rows : 1, result : rLine(line) }
        } else { // it's a block
            return rBlock(row, indentation + indent);
        }
    }
    function rTextOrSpan(line : string) : { length : nat, result : Text | Span } | null {
        return null;
    }
    function rLine(line : string) : Line {
        throw new Error();
    }
    let row = 0;
    let result : Blocks = [];
    while (true) {
        const blockOrLine = rBlockOrLine(row, 0);
        if (blockOrLine === null) return result;
        result.push(blockOrLine.result);
        row += blockOrLine.rows;
    }
}

*/



