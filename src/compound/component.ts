import { Model } from "../model/index.js";
import { MutationInfo } from "./compound.js";
import { Cursor } from "./cursor.js";

export interface Component<Init, Update> {

    model : Model<Init, Update>

    get DOMNode() : Node

    get cursor() : Cursor

    /**
     * The DOMNode is guaranteed not to be a part of the prefix or suffix trees.
     */
    surroundWith(cursor : Cursor, prefix : Node[], suffix : Node[]) : void

    /**
     * While the DOMNode is not one of the replacements, 
     * it may be a direct or indirect child of one of the replacements.
     */    
    replaceWith(cursor : Cursor, replacements : Node[]) : void

    mutationsObserved(cursor : Cursor, mutations : MutationInfo[]) : void

    cursorChanged(cursor : Cursor) : void

}

export type AnyComponent = Component<any, any>
export type UniformComponent<Value> = Component<Value, Value>



