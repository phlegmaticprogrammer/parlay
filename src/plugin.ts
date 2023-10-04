import { Block } from "./xblocks.js"

/*xport interface Component {

    props[

    render() : 

}*/

export interface BlockComponent {

    createDom(block : Block) : Element

}

export interface DocumentComponent {
}

export interface Plugin {

    documentComponent(document : Document) : DocumentComponent

}