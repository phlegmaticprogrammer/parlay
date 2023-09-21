import { TextLines } from "@practal/parsing";

export type Block<B, F> = { config : B, content : (Line<F> | Block<B, F>)[] }
export type Line<F> = { fragments : Fragment<F>[] }
export type Fragment<F> = { config : F, content : string }

export function isLine<B, F>(lineOrBlock : Line<F> | Block<B, F>) : boolean {
    return Object.hasOwn(lineOrBlock, 'fragments');
}

export function isBlock<B, F>(lineOrBlock : Line<F> | Block<B, F>) : boolean {
    return Object.hasOwn(lineOrBlock, 'content');
}

export interface Blocks<B, F> {

    parseBlock(text : TextLines) : Block<B, F> | undefined

    printBlock(block : Block<B, F>) : TextLines
    
    
}

