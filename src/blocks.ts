/**
 * Data structure representing blocks.
 * Let's do it specifically now for AbstractionLogic syntax, 
 * and generalize when we have functioning examples.
 **/

import { TLPos, TLPosT, Text as TextChars, TextLines, copySliceOfTextLines, textOfChars, textOfTextLines } from "@practal/parsing"
import { ParseResult, Tag } from "alogic"
import { Relation, assertNever, debug, nat } from "things"

export enum BlockKind {
    BLOCK, // has only Entry's as children
    ENTRY,
    TEXT,
    LINEBREAK
}

export type Block = BlockBlock | EntryBlock | TextBlock | LinebreakBlock

export type BlockBlock = {
    kind : BlockKind.BLOCK,
    children : EntryBlock[]
}

export type EntryBlock = {
    kind : BlockKind.ENTRY,
    children : (BlockBlock | TextBlock | LinebreakBlock)[]
}

export enum TextClass {
    INVALID,
    PUNCTUATION,
    PUNCTUATION_ABS,
    PUNCTUATION_VAR,
    ID,
    FREE_ID,
    BOUND_ID,
    ABS_ID,
    DOT,
    LABEL
}

export type TextBlock = {
    kind : BlockKind.TEXT,
    content : TextChars
    textClasses : TextClass[]
}

export type LinebreakBlock = {
    kind : BlockKind.LINEBREAK,
    indent : boolean
}

export function mkBlockBlock() : BlockBlock {
    return {
        kind : BlockKind.BLOCK,
        children : []
    };
}

export function mkEntryBlock() : EntryBlock {
    return {
        kind : BlockKind.ENTRY,
        children : []
    };
}

export function mkTextBlock(content : TextChars) : TextBlock {
    return {
        kind : BlockKind.TEXT,
        content : content,
        textClasses : []
    };
}

export function mkLineBreakBlock(indent : boolean) : LinebreakBlock {
    return {
        kind : BlockKind.LINEBREAK,
        indent : indent
    };
}

function startOfResult(result : ParseResult) : TLPos {
    return TLPos(result.startLine, result.startColumn);
}

function endOfResult(result : ParseResult) : TLPos {
    return TLPos(result.endLine, result.endColumn);
}

export function generateBlockFromSource(lines : TextLines, result : ParseResult) : BlockBlock {
    
    function checkTag(tag : Tag | null | undefined, ...options : Tag[]) {
        if (tag === null || tag === undefined) 
            throw new Error("missing tag (null or undefined) encountered, expected: " +
                options.map(x => Tag[x]).join(", "));
        for (const option of options) {
            if (tag === option) return;
        }
        const msg = "generateBlockFromSource: wrong tag '" + Tag[tag] + "', expected: " +
            options.map(x => Tag[x]).join(", ");
        throw new Error(msg);
    }

    function copy(indentation : nat, text : TextChars) : TextChars {
        let i = 0;
        const count = text.count;
        while (i < indentation && i < count && text.charAt(i) === " ") 
            i += 1;
        if (i < indentation && i < count) 
            throw new Error("missing indentation, expected " + indentation + ", found " + i);
        if (i < indentation) return textOfChars([]);
        return text.slice(indentation);
    }

    function generateInvalidLines(result : ParseResult, entry : EntryBlock) {
        let indentation = result.startColumn;
        for (let i = result.startLine; i <= result.endLine; i++) {
            const text = copy(indentation, lines.lineAt(i));
            const textblock = mkTextBlock(text);
            textblock.textClasses.push(TextClass.INVALID);
            entry.children.push(textblock);
            if (i < result.endLine) {
                entry.children.push(mkLineBreakBlock(true));
            }
            indentation = result.startColumn + 2;
        }
    }

    function fillWithTextLineFragment(line : nat, fromColumn : nat, toColumn : nat,
        classes : TextClass[], entry : EntryBlock)
    {
        if (fromColumn < toColumn) {
            const text = lines.lineAt(line).slice(fromColumn, toColumn);
            const textblock = mkTextBlock(text);
            textblock.textClasses.push(...classes);
            entry.children.push(textblock);
        }
    }

    function fillWithText(indentationNext : nat, from : TLPos, to : TLPos, 
        classes : TextClass[], entry : EntryBlock) 
    { 
        if (TLPosT.equal(from, to)) return;
        if (from.line > to.line) throw new Error("fillWithText: from > to");
        let start = from.column;
        for (let i = from.line; i < to.line; i++) {
            const end = lines.lineAt(i).count;
            fillWithTextLineFragment(i, start, end, classes, entry);
            start = indentationNext;
            entry.children.push(mkLineBreakBlock(true));
        }
        fillWithTextLineFragment(to.line, start, to.column, classes, entry);
    }

    function tokenClassOf(tag : Tag | undefined | null) : TextClass | undefined {
        if (tag === undefined || tag === null) return undefined;
        switch (tag) {
            case Tag.invalid: return TextClass.INVALID;
            case Tag.absname: return TextClass.ABS_ID;
            case Tag.identifier: return TextClass.ID;
            case Tag.qualified_identifier: return TextClass.ABS_ID;
            case Tag.boundvar: return TextClass.BOUND_ID;
            case Tag.varname: return TextClass.FREE_ID;
            case Tag.varname_plus: return TextClass.ID;
            case Tag.varname_star: return TextClass.ID;
            case Tag.open_round:
            case Tag.close_round:
            case Tag.comma:
                return TextClass.PUNCTUATION;
            case Tag.dot:
                return TextClass.DOT;
            case Tag.label:
                return TextClass.LABEL;
            case Tag.open_abs:
            case Tag.close_abs:
            case Tag.comma_abs:
                return TextClass.PUNCTUATION_ABS;
            case Tag.open_var:
            case Tag.close_var:
            case Tag.comma_var:
                return TextClass.PUNCTUATION_VAR;
            default:
                return undefined;
        }
    }

    function generateChildOfEntry(indentationNext : nat, child : ParseResult, entry : EntryBlock) {
        const textclass = tokenClassOf(child.type);
        if (textclass !== undefined) {
            const start = TLPos(child.startLine, child.startColumn);
            const to = TLPos(child.endLine, child.endColumn);
            fillWithText(indentationNext, start, to, [textclass], entry);
        } else if (child.type === Tag.block || child.type === Tag.param_block) {
            entry.children.push(generateBlock(child));
        } else if (child.type === Tag.spurious_linebreak) {
            //throw new Error("Hey there :-)");
            // put a linebreak in front of the block
            fillEntry(indentationNext, child, entry);
        } else {
            fillEntry(indentationNext, child, entry);
        }
    }

    function fillEntry(indentationNext : nat, result : ParseResult, entry : EntryBlock) {
        let pos = startOfResult(result);
        for (const child of result.children) {
            fillWithText(indentationNext, pos, startOfResult(child), [], entry);
            generateChildOfEntry(indentationNext, child, entry);
            pos = endOfResult(child);
        }
        fillWithText(indentationNext, pos, endOfResult(result), [], entry);
    }

    function generateEntry(line : nat, result : ParseResult) : EntryBlock {
        checkTag(result.type, Tag.entry, Tag.invalid_entry);
        const entry = mkEntryBlock();
        let diff = result.startLine - line;
        while (diff > 0) {
            entry.children.push(mkLineBreakBlock(false));
            diff -= 1;
        }
        if (result.type === Tag.invalid_entry) 
            generateInvalidLines(result, entry);
        else 
            fillEntry(result.startColumn + 2, result, entry);
        return entry;
    }

    function generateBlock(result : ParseResult) : BlockBlock {
        checkTag(result.type, Tag.param_block, Tag.block);
        const block = mkBlockBlock();
        let line = result.startLine;
        for (const child of result.children) {
            if (child.type === Tag.spurious_linebreak) {
                line = child.endLine + 1;
            } else {
                block.children.push(generateEntry(line, child));
                line = child.endLine;
            }
        }
        return block;
    }

    // top block
    // param block
    // label block


    return generateBlock(result);
}

export function childrenOfBlock(block : Block) : Block[] {
    const kind = block.kind;
    switch (kind) {
        case BlockKind.BLOCK:
        case BlockKind.ENTRY:
            return block.children;
        case BlockKind.TEXT:
        case BlockKind.LINEBREAK:
            return [];
        default: assertNever(kind);
    }
}

export function printBlock(block : Block, pr : (s : string) => void = debug) {
    let output = "";
    function writeln(s : string) {
        output += s;
        output += "\n";
    }
    function print(indentation : string, block : Block) {
        if (block.kind === BlockKind.TEXT) {
            const classes = block.textClasses.map(c => TextClass[c]).join(", ");
            writeln(indentation + BlockKind[block.kind] + "[" + classes + "]: " +
                " '" + block.content.toString() + "'");
        } else if (block.kind === BlockKind.LINEBREAK) {
            writeln(indentation + BlockKind[block.kind] + (block.indent ? " (INDENT)" : ""));
        } else {
            writeln(indentation + BlockKind[block.kind]);
        }
        indentation += "    ";
        for (const child of childrenOfBlock(block)) {
            print(indentation, child);
        }
    }
    print("", block);
    pr(output);
}

export function generateNodeFromBlock(block : Block) : Node {

    function generateFromBlock(indented : boolean, block : BlockBlock) : Node {
        const div = document.createElement("div");
        div.setAttribute("class", indented ? "parlay-indented-block" : "parlay-block");
        for (const child of block.children) {
            div.appendChild(generateFromEntry(child));
        }
        return div;
    }

    function generateFromEntry(entry : EntryBlock) : Node {
        const div = document.createElement("div");
        div.setAttribute("class", "parlay-entry");
        let row : Node[] = [];
        function flushRow(indented : boolean) {
            if (row.length === 0) row.push(linebreakNode());
            const rownode = document.createElement("div");
            rownode.setAttribute("class", indented ? "parlay-indented-entry-row" : "parlay-entry-row");
            for (const node of row) rownode.appendChild(node);
            div.appendChild(rownode);
            row = [];
        }
        let indentNext = false;
        for (const child of entry.children) {
            const kind = child.kind;
            switch (kind) {
                case BlockKind.BLOCK:
                    if (row.length !== 0) {
                        flushRow(indentNext);
                    }//throw new Error("In an entry, a block must always be after a linebreak.");
                    div.appendChild(generateFromBlock(indentNext,child));
                    break;
                case BlockKind.LINEBREAK:
                    flushRow(indentNext);
                    indentNext = child.indent;
                    break;
                case BlockKind.TEXT:
                    row.push(generateFromText(child));
                    break;
                default: assertNever(kind);
            }
        }
        if (row.length !== 0) flushRow(indentNext);
        return div;
    }

    function cssClassOf(textclass : TextClass) : string | undefined {
        const name = TextClass[textclass].toLowerCase().replaceAll("_", "-");
        return "parlay-token-" + name;
    }

    function generateFromText(textblock : TextBlock) : Node {
        const text = document.createTextNode(textblock.content.toString());
        const classes : string[] = [];
        for (const textclass of textblock.textClasses) {
            const c = cssClassOf(textclass);
            if (c) classes.push(c);
        }
        if (classes.length === 0) return text;
        const span = document.createElement("span");
        span.appendChild(text);
        const cl = span.classList;
        cl.add(...classes);
        return span;
    }

    function linebreakNode() : Node {
        return document.createElement("br");        
    }

    function generate(block : Block) : Node {
        const kind = block.kind;
        switch (kind) {
            case BlockKind.BLOCK:
                return generateFromBlock(false, block);
            case BlockKind.ENTRY:
                return generateFromEntry(block);
            default: throw new Error("Can only generate node for blocks and entries.");
        }
    }

    return generate(block);
}


