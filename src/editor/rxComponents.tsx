/** @jsx compoundRender */
import { compoundRender, printRender, registerComponent } from "./component.js";
import { SimpleBlock, SimpleDocument, simpleRX } from "recursivetext/rx.js";
import { CompoundComponent, Properties, Render } from "./component.js";

declare global {
    namespace JSX {
        interface IntrinsicElements {
            "rx-line" : {text : string},
            "rx-block": {block : SimpleBlock, top : boolean, close : boolean},
            "rx-document" : {document : SimpleDocument}
        }
    }
}

class LineComponent implements CompoundComponent {

    isPrimitive : false = false

    name: string = "rx-line";

    render({text} : {text : string}, children : Render[]): Render {
        if (text.length === 0)
            // @ts-ignore
            return <compound-div class="parlay-line"/>;
        else 
            // @ts-ignore
            return <compound-div class="parlay-line">{text}</compound-div>;
    }

}
registerComponent(new LineComponent());

class BlockComponent implements CompoundComponent {

    isPrimitive : false = false

    name: string = "rx-block";

    render({block, top, close} : {block : SimpleBlock, top : boolean, close : boolean}, children : Render[]): Render {
        const linesOrBlocks = [...simpleRX.fromBlock(block)];
        const rLinesOrBlocks = [...linesOrBlocks.entries()].map(([i, lb]) => {
            if (simpleRX.isLine(lb)) {
                return <rx-line text={lb}/>;
            } else {
                const close = (i + 1 < linesOrBlocks.length) && simpleRX.isLine(linesOrBlocks[i + 1]);
                return <rx-block block={lb} top={false} close={close}/>
            }
        });
        const classes : string[] = [];
        if (top) classes.push("parlay-block"); else classes.push("parlay-indented-block");
        if (close) classes.push("parlay-close-block");
        // @ts-ignore
        return <compound-div class={classes.join(" ")}>{rLinesOrBlocks}</compound-div>;
    }

}
registerComponent(new BlockComponent());

class DocumentComponent implements CompoundComponent {

    isPrimitive : false = false

    name: string = "rx-document";

    render({document} : {document : SimpleDocument}, children : Render[]): Render {
        const blocks = [...simpleRX.fromDocument(document)];
                    // @ts-ignore
        const rblocks : Render[] = [...blocks.entries()] .map(([i, b]) => 
            <rx-block block={b} top={true} close={i === blocks.length - 1}/>);
                        // @ts-ignore
        return <compound-div class="parlay-document">{rblocks}</compound-div>;
    }

}
registerComponent(new DocumentComponent());


export function renderSimpleDocument(document : SimpleDocument) : Render {
                // @ts-ignore
    return <rx-document document={document}/>
}
