import { Model } from "../model/index.js";
import { MutationInfo } from "./compound.js";

export interface Component<Init, Update> {

    model : Model<Init, Update>

    get DOMNode() : Node

    /**
     * The DOMNode is guaranteed not to be a part of the prefix or suffix trees.
     */
    surroundWith(prefix : Node[], suffix : Node[]) : void

    /**
     * While the DOMNode is not one of the replacements, 
     * it may be a direct or indirect child of one of the replacements.
     */    
    replaceWith(replacements : Node[]) : void

    mutationsObserved(mutations : MutationInfo[]) : void

}

export type AnyComponent = Component<any, any>
export type UniformComponent<Value> = Component<Value, Value>



