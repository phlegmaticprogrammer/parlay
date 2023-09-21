import { nat } from "things"

export type Key = string
export interface Ephemerals {
    key : Key
    [key : string] : unknown;
}

export type Block = { ephemerals : Ephemerals, first : Line, rest : (Line | Block)[] }
export type Line = { ephemerals : Ephemerals, fragments : (Text | Span)[] }
export type Span = { ephemerals : Ephemerals, fragments : (Text | Span)[] }
export type Text = { ephemerals : Ephemerals, text : string }

export function isLine(potentialLine : Line | Block) : potentialLine is Line {
    return Object.hasOwn(potentialLine, 'fragments');
}

export function isSpan(potentialSpan : Text | Span) : potentialSpan is Span {
    return Object.hasOwn(potentialSpan, 'fragments');
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

export function writeBlock(block : Block, indent : nat) : string[] {
    let lines : string[] = [];
    function write(s : string) {
        lines[lines.length - 1] += s;
    }
    function newline() {
        lines.push("");
    }
    function prBlock(indentation : nat, block : Block) {
        prLine(indentation, block.first);
        indentation += indent;
        for (const item of block.rest) {
            if (isLine(item)) {
                prLine(indentation, item);
            } else {
                prBlock(indentation + indent, item);
            }
        }
    }
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
    function prText(text : string, alter_leading_space : boolean) {
        text = removeNewlines(text);
        let leading = true;
        for (const c of text) {
            if (leading && c === SPACE && alter_leading_space) write(SPACE_ALT);
            else if (c === LEFT_SPAN) write(LEFT_SPAN_ALT);
            else if (c === RIGHT_SPAN) write(RIGHT_SPAN_ALT);
            else write(c);
            leading = false;
        }
    }
    function prSpan(span : Span) {
        write(LEFT_SPAN);
        for (const fragment of span.fragments) {
            if (isSpan(fragment)) prSpan(fragment);
            else prText(fragment.text, false);
        }
        write(RIGHT_SPAN);
    }
    function prLine(indentation : nat, line : Line) {
        newline();
        write(spaces(indentation));
        let first = true;
        for (const fragment of line.fragments) {
            if (isSpan(fragment)) { 
                prSpan(fragment);
                first = false;
            } else if (fragment.text.length > 0) {
                prText(fragment.text, first);
                first = false;  
            }
        }
    }
    prBlock(0, block);
    return lines;
}

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

export function readBlock(lines : string[], indent : nat) : Block {
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
    const blockOrLine = rBlockOrLine(0, 0);
    if (blockOrLine === null) return createBlock();
    else if (isLine(blockOrLine.result)) return createBlock(blockOrLine.result);
    else return blockOrLine.result;
}





