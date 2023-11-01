import { Model } from "../model/index.js";
import { Compound, MutationInfo } from "./compound.js";
import { Cursor } from "./cursor.js";

/**
 * The component carries the state, which consists of:
 * * The model the component displays and/or edits. 
 * * The main node representing this component.
 * * The cursor for this component. Null, if the component doesn't have a cursor,
 *   otherwise the cursor at a "legal" position / as a "legal" selection of the component.
 *   What "legal" is, is managed by the component.
 * 
 *   The compound has the current overall cursor. This cursor is either null, or is a selection
 *   (possibly of zero extent) between legal positions of some components that are part of the
 *   compound. Each component has its own cursor, which is a subselection of the compound cursor,
 *   such that the subselection is maximal while still inside the component.
 * 
 * Model and main node stay the same throughout the life time of the component.
 * 
 * The cursor can change though. Many methods of the component take a cursor as an argument.
 * That is the current location of the cursor, relative to the component. 
 * The component must ensure that afterwards, the cursor is in a legal position of its own
 * choosing, again relative to this component.
 * 
 */
export interface Component<Init, Update> {

    model : Model<Init, Update>

    get main() : Node

    get cursor() : Cursor

    /**
     * Notifies the component of the host it lives in.
     */
    attachHost(host : ComponentHost) : void

    /**
     * Surrounds the main node with the given prefix and suffix nodes.
     * The main node is guaranteed not to be a part of the prefix or suffix node trees.
     * It's up to the component how to integrate prefix and suffix nodes into the main node.
     * It might even choose not to integrate them at all and to just drop them.
     */
    surroundWith(cursor : Cursor, prefix : Node[], suffix : Node[]) : void

    /**
     * Replaces the current content of the main node with the content of the given replacements.
     * The main node is guaranteed not to be one of the replacements, but one of the replacements
     * may currently be an ancestor of the main node.
     */    
    replaceWith(cursor : Cursor, replacements : Node[]) : void

    mutationsObserved(cursor : Cursor, mutations : MutationInfo[]) : void

    cursorChanged(cursor : Cursor) : void

}

export type AnyComponent = Component<any, any>
export type UniformComponent<Value> = Component<Value, Value>

export interface ComponentHost {

    beginMutation() : void

    endMutation() : void

}



